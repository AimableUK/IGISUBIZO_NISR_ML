"""
Problem A — District-level labour underutilization clustering.
Uses KMeans++ with multiple restarts (n_init=10) on latest-year district features.
Returns cluster profiles, district assignments, and cluster validation (Silhouette score, inertia).
"""

from __future__ import annotations

import math
import random
import uuid
from datetime import datetime, timezone

from .loader import IS_SAMPLE_DATA, is_real_available, load_district_labour

ENGINE_VERSION = "clustering-2.0.0"
DATASET_VERSION = "2024.1"

FEATURES = [
    "underemployment_rate",
    "unemployment_rate",
    "youth_neet_rate",
    "pct_agriculture",
    "pct_formal",
    "pct_secondary_plus",
]

CLUSTER_LABELS = {
    0: "High underutilization / rural",
    1: "Moderate underutilization / transitional",
    2: "Low underutilization / urban",
}


def _euclidean(p1: list[float], p2: list[float]) -> float:
    return math.sqrt(sum((p1[j] - p2[j]) ** 2 for j in range(len(p1))))


def _kmeans_pp_init(
    points: list[list[float]], k: int, rng: random.Random
) -> list[list[float]]:
    """K-Means++ initialization for better centroid spread and convergence."""
    centroids = [list(rng.choice(points))]
    while len(centroids) < k:
        d2 = []
        for p in points:
            min_d2 = min(
                sum((p[j] - c[j]) ** 2 for j in range(len(p))) for c in centroids
            )
            d2.append(min_d2)
        total_d2 = sum(d2)
        if total_d2 <= 1e-12:
            centroids.append(list(rng.choice(points)))
            continue
        r = rng.uniform(0, total_d2)
        cum = 0.0
        chosen = points[-1]
        for idx, val in enumerate(d2):
            cum += val
            if cum >= r:
                chosen = points[idx]
                break
        centroids.append(list(chosen))
    return centroids


def _kmeans_cluster(
    points: list[list[float]], k: int, n_init: int = 10
) -> tuple[list[int], list[list[float]], float]:
    """Runs KMeans with K-Means++ and multiple restarts, picking minimum inertia."""
    best_labels, best_centroids, best_inertia = None, None, float("inf")
    for run_idx in range(n_init):
        rng = random.Random(42 + run_idx * 31)
        centroids = _kmeans_pp_init(points, k, rng)
        labels = [0] * len(points)
        for _ in range(100):
            new_labels = []
            for p in points:
                dists = [
                    sum((p[j] - c[j]) ** 2 for j in range(len(p))) for c in centroids
                ]
                new_labels.append(dists.index(min(dists)))
            if new_labels == labels:
                break
            labels = new_labels
            for ci in range(k):
                members = [points[i] for i, l in enumerate(labels) if l == ci]
                if members:
                    centroids[ci] = [
                        sum(m[j] for m in members) / len(members)
                        for j in range(len(points[0]))
                    ]

        inertia = sum(
            sum(
                (points[i][j] - centroids[labels[i]][j]) ** 2
                for j in range(len(points[0]))
            )
            for i in range(len(points))
        )
        if inertia < best_inertia:
            best_inertia = inertia
            best_labels = labels
            best_centroids = centroids

    return best_labels or [0] * len(points), best_centroids or [], best_inertia


def _silhouette_score(points: list[list[float]], labels: list[int], k: int) -> float:
    """Computes mean silhouette coefficient across points."""
    n = len(points)
    if n <= k or k <= 1:
        return 0.0
    scores: list[float] = []
    for i in range(n):
        same = [points[j] for j in range(n) if labels[j] == labels[i] and j != i]
        if not same:
            scores.append(0.0)
            continue
        a = sum(_euclidean(points[i], p) for p in same) / len(same)
        b = float("inf")
        for ci in range(k):
            if ci == labels[i]:
                continue
            other = [points[j] for j in range(n) if labels[j] == ci]
            if other:
                avg_d = sum(_euclidean(points[i], p) for p in other) / len(other)
                b = min(b, avg_d)
        s = (b - a) / max(a, b) if max(a, b) > 0 else 0.0
        scores.append(s)
    return round(sum(scores) / len(scores), 3)


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
    raw_labels, centroids, inertia = _kmeans_cluster(normed, k, n_init=10)
    sil_score = _silhouette_score(normed, raw_labels, k)

    # Sort clusters consistently by underutilization severity:
    # Severity index = average underemployment + youth NEET
    cluster_severity = []
    for ci in range(k):
        members = [matrix[i] for i, l in enumerate(raw_labels) if l == ci]
        if members:
            mean_underemp = sum(m[0] for m in members) / len(members)
            mean_neet = sum(m[2] for m in members) / len(members)
            cluster_severity.append((ci, mean_underemp + mean_neet))
        else:
            cluster_severity.append((ci, 0.0))

    # sort descending: index 0 = highest underutilization, index 2 = lowest
    cluster_severity.sort(key=lambda x: -x[1])
    remap = {old_ci: new_ci for new_ci, (old_ci, _) in enumerate(cluster_severity)}
    labels = [remap[l] for l in raw_labels]

    # cluster summary rows
    cluster_rows = []
    for ci in range(k):
        members = [matrix[i] for i, l in enumerate(labels) if l == ci]
        if not members:
            continue
        means = [
            round(sum(m[j] for m in members) / len(members), 1)
            for j in range(len(FEATURES))
        ]
        cluster_rows.append(
            {
                "cluster": ci,
                "label": CLUSTER_LABELS.get(ci, f"Cluster {ci}"),
                "district_count": len(members),
                **{FEATURES[j]: means[j] for j in range(len(FEATURES))},
            }
        )

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

    high_districts = [districts[i] for i, l in enumerate(labels) if l == 0]
    source_id = "nisr_lfs"

    return {
        "id": str(uuid.uuid4()),
        "question": question,
        "status": "ok",
        "intent": {
            "metric": "underutilization_cluster",
            "operation": "compare",
            "periodFrom": latest_year,
            "periodTo": latest_year,
        },
        "datasets": {
            "cluster_profiles": {
                "label": f"Underutilization cluster profiles, {latest_year}",
                "columns": [
                    {"key": "cluster", "label": "Cluster ID", "kind": "number"},
                    {"key": "label", "label": "Profile", "kind": "category"},
                    {"key": "district_count", "label": "Districts", "kind": "number"},
                    {
                        "key": "underemployment_rate",
                        "label": "Underemployment (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "unemployment_rate",
                        "label": "Unemployment (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "youth_neet_rate",
                        "label": "Youth NEET (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "pct_agriculture",
                        "label": "Agriculture share (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "pct_formal",
                        "label": "Formal employment (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "pct_secondary_plus",
                        "label": "Secondary+ education (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
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
                    {
                        "key": "underemployment_rate",
                        "label": "Underemployment (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "youth_neet_rate",
                        "label": "Youth NEET (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "pct_formal",
                        "label": "Formal employment (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                ],
                "rows": district_rows,
                "sourceIds": [source_id],
            },
        },
        "metrics": {
            "k_clusters": {
                "label": "Clusters identified",
                "value": k,
                "unit": "",
                "decimals": 0,
                "sourceIds": [source_id],
            },
            "silhouette_score": {
                "label": "Silhouette Score",
                "value": sil_score,
                "unit": "",
                "decimals": 3,
                "sourceIds": [source_id],
            },
            "high_underutil_count": {
                "label": "Districts in highest underutilization cluster",
                "value": len(high_districts),
                "unit": "",
                "decimals": 0,
                "sourceIds": [source_id],
            },
        },
        "insights": {
            "cluster_summary": {
                "text": f"KMeans++ (k=3, silhouette={sil_score:.3f}) on {latest_year} district data identified {k} distinct labour underutilization profiles. "
                f"{len(high_districts)} districts fall in the highest underutilization cluster: {', '.join(high_districts[:5])}{'…' if len(high_districts) > 5 else ''}.",
                "evidence": ["datasets.cluster_profiles", "datasets.district_clusters"],
            },
        },
        "formulas": {},
        "sources": {
            source_id: {
                "publisher": "Mboni demo data",
                "title": "LFS-shaped generated district labour proxy data",
                "period": f"2019–{latest_year}",
                "isSample": IS_SAMPLE_DATA,
            },
        },
        "operations": [
            {
                "id": "load_data",
                "description": f"Loaded district labour data for {latest_year} ({len(latest)} districts).",
            },
            {
                "id": "normalise",
                "description": f"Min-max normalised {len(FEATURES)} features across districts.",
            },
            {
                "id": "kmeans_pp",
                "description": f"Fitted KMeans++ clustering (k={k}, n_init=10 restarts) with Silhouette score={sil_score:.3f}.",
            },
            {
                "id": "rank_severity",
                "description": "Ordered cluster labels deterministically by labour underutilization severity.",
            },
        ],
        "caveats": [
            "Demo only: input values are generated proxy data and are not verified NISR observations.",
            "Results are based on generated district-level proxy data shaped like LFS data.",
            "KMeans cluster profiles are ordered by underemployment severity; profiles show patterns of association, not causation.",
            "Silhouette score measures cluster cohesion and separation on normalized feature space.",
        ],
        "meta": {
            "analysisVersion": ENGINE_VERSION,
            "computedAt": datetime.now(timezone.utc).isoformat(),
            "datasetVersions": {source_id: DATASET_VERSION},
            "isSample": IS_SAMPLE_DATA,
        },
    }
