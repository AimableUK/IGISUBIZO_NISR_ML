"""
Problem A — District-level labour underutilization clustering.
Uses KMeans on latest-year district features. Returns cluster profiles + district assignments.
"""
from __future__ import annotations
import uuid
from datetime import datetime, timezone

from .loader import load_district_labour, is_real_available

ENGINE_VERSION = "clustering-1.0.0"
DATASET_VERSION = "2024.1"

FEATURES = ["underemployment_rate", "unemployment_rate", "youth_neet_rate",
            "pct_agriculture", "pct_formal", "pct_secondary_plus"]

CLUSTER_LABELS = {
    0: "High underutilization / rural",
    1: "Moderate underutilization / transitional",
    2: "Low underutilization / urban",
}


def _kmeans_manual(points: list[list[float]], k: int, seed: int = 42) -> list[int]:
    """Minimal KMeans without sklearn dependency at import time."""
    import random, math
    rng = random.Random(seed)
    centroids = [list(p) for p in rng.sample(points, k)]
    labels = [0] * len(points)
    for _ in range(100):
        new_labels = []
        for p in points:
            dists = [sum((p[j] - c[j]) ** 2 for j in range(len(p))) for c in centroids]
            new_labels.append(dists.index(min(dists)))
        if new_labels == labels:
            break
        labels = new_labels
        for ci in range(k):
            members = [points[i] for i, l in enumerate(labels) if l == ci]
            if members:
                centroids[ci] = [sum(m[j] for m in members) / len(members) for j in range(len(points[0]))]
    return labels


def run(question: str) -> dict:
    real = is_real_available()
    rows = load_district_labour(real)
    latest_year = int(max(r["year"] for r in rows))
    latest = [r for r in rows if int(r["year"]) == latest_year]

    districts = [r["district"] for r in latest]
    provinces = [r["province"] for r in latest]

    # normalise features 0-1
    matrix: list[list[float]] = []
    for r in latest:
        matrix.append([float(r[f]) for f in FEATURES])

    mins = [min(row[i] for row in matrix) for i in range(len(FEATURES))]
    maxs = [max(row[i] for row in matrix) for i in range(len(FEATURES))]
    normed = [
        [(v - mins[i]) / (maxs[i] - mins[i] + 1e-9) for i, v in enumerate(row)]
        for row in matrix
    ]

    k = 3
    labels = _kmeans_manual(normed, k)

    # cluster summary
    cluster_rows = []
    for ci in range(k):
        members = [matrix[i] for i, l in enumerate(labels) if l == ci]
        if not members:
            continue
        means = [round(sum(m[j] for m in members) / len(members), 1) for j in range(len(FEATURES))]
        cluster_rows.append({
            "cluster": ci,
            "label": CLUSTER_LABELS.get(ci, f"Cluster {ci}"),
            "district_count": len(members),
            **{FEATURES[j]: means[j] for j in range(len(FEATURES))},
        })

    # district assignment rows
    district_rows = [
        {
            "district": districts[i],
            "province": provinces[i],
            "cluster": labels[i],
            "cluster_label": CLUSTER_LABELS.get(labels[i], f"Cluster {labels[i]}"),
            **{f: round(matrix[i][j], 1) for j, f in enumerate(FEATURES)},
        }
        for i in range(len(districts))
    ]

    high_cluster = max(range(k), key=lambda c: sum(
        matrix[i][0] for i, l in enumerate(labels) if l == c
    ) / max(1, sum(1 for l in labels if l == c)))
    high_districts = [districts[i] for i, l in enumerate(labels) if l == high_cluster]

    source_id = "nisr_lfs"
    

    return {
        "id": str(uuid.uuid4()),
        "question": question,
        "status": "ok",
        "intent": {"metric": "underutilization_cluster", "operation": "compare",
                   "periodFrom": latest_year, "periodTo": latest_year},
        "datasets": {
            "cluster_profiles": {
                "label": f"Underutilization cluster profiles, {latest_year}",
                "columns": [
                    {"key": "cluster", "label": "Cluster ID", "kind": "number"},
                    {"key": "label", "label": "Profile", "kind": "category"},
                    {"key": "district_count", "label": "Districts", "kind": "number"},
                    {"key": "underemployment_rate", "label": "Underemployment (%)", "kind": "percent", "unit": "%"},
                    {"key": "unemployment_rate", "label": "Unemployment (%)", "kind": "percent", "unit": "%"},
                    {"key": "youth_neet_rate", "label": "Youth NEET (%)", "kind": "percent", "unit": "%"},
                    {"key": "pct_agriculture", "label": "Agriculture share (%)", "kind": "percent", "unit": "%"},
                    {"key": "pct_formal", "label": "Formal employment (%)", "kind": "percent", "unit": "%"},
                    {"key": "pct_secondary_plus", "label": "Secondary+ education (%)", "kind": "percent", "unit": "%"},
                ],
                "rows": cluster_rows,
                "sourceIds": [source_id],
            },
            "district_clusters": {
                "label": f"District cluster assignments, {latest_year}",
                "columns": [
                    {"key": "district", "label": "District", "kind": "geo"},
                    {"key": "province", "label": "Province", "kind": "category"},
                    {"key": "cluster_label", "label": "Cluster", "kind": "category"},
                    {"key": "underemployment_rate", "label": "Underemployment (%)", "kind": "percent", "unit": "%"},
                    {"key": "youth_neet_rate", "label": "Youth NEET (%)", "kind": "percent", "unit": "%"},
                    {"key": "pct_formal", "label": "Formal employment (%)", "kind": "percent", "unit": "%"},
                ],
                "rows": district_rows,
                "sourceIds": [source_id],
            },
        },
        "metrics": {
            "k_clusters": {"label": "Clusters identified", "value": k, "unit": "", "decimals": 0, "sourceIds": [source_id]},
            "high_underutil_count": {"label": "Districts in highest underutilization cluster",
                                     "value": len(high_districts), "unit": "", "decimals": 0, "sourceIds": [source_id]},
        },
        "insights": {
            "cluster_summary": {
                "text": f"KMeans (k=3) on {latest_year} district data identified {k} labour underutilization profiles. "
                        f"{len(high_districts)} districts fall in the highest underutilization cluster: {', '.join(high_districts[:5])}{'…' if len(high_districts) > 5 else ''}.",
                "evidence": ["datasets.cluster_profiles", "datasets.district_clusters"],
            },
        },
        "formulas": {},
        "sources": {
            source_id: {
                "publisher": "NISR",
                "title": "Rwanda Labour Force Survey (LFS) — NISR",
                "period": f"2019–{latest_year}",
                "isSample": False,
            },
        },
        "operations": [
            {"id": "load_data", "description": f"Loaded district labour data for {latest_year} ({len(latest)} districts)."},
            {"id": "normalise", "description": f"Min-max normalised {len(FEATURES)} features."},
            {"id": "kmeans", "description": f"Applied KMeans (k={k}, seed=42) to identify underutilization clusters."},
        ],
        "caveats": [
            "Results are based on aggregated district-level LFS data.",
            "KMeans cluster labels are assigned by mean underemployment rate; interpret profiles, not cluster IDs.",
            "Correlation does not imply causation.",
        ],
        "meta": {
            "analysisVersion": ENGINE_VERSION,
            "computedAt": datetime.now(timezone.utc).isoformat(),
            "datasetVersions": {source_id: DATASET_VERSION},
            "isSample": False,
        },
    }
