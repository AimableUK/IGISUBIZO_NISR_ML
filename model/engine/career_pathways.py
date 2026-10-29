"""Explore applied-mathematics job pathways using the available Rwanda-shaped data."""
from __future__ import annotations

import csv
import uuid
from collections import defaultdict
from datetime import datetime, timezone

from .loader import BASE

ENGINE_VERSION = "career-pathways-1.0.0"
DATASET_VERSION = "demo-career-demand-1"
SOURCE_ID = "demo_career_demand"

# Illustrative skill-to-role pathways. The source data does not encode degree
# eligibility, so these are leads to investigate, not verified qualification matches.
PATHWAYS = {
    "ICT": ("Data Analyst", "Software Developer", "Network Engineer"),
    "Finance": ("Accountant", "Bank Officer"),
    "Engineering": ("Civil Engineer", "Electrical Engineer"),
    "Agriculture": ("Agronomist",),
    "Transport": ("Logistics Officer",),
    "Trade": ("Customs Officer",),
    "Construction": ("Construction Foreman",),
    "Education": ("Secondary Teacher", "TVET Instructor"),
    "Hospitality": ("Hotel Manager",),
    "Media": ("Journalist",),
}
INTERESTS = {
    "mathematics and quantitative skills": (
        ("math", "mathematics", "numbers", "statistics", "data"),
        (
            "ICT", "Finance", "Engineering", "Agriculture", "Transport",
            "Trade", "Construction", "Education", "Hospitality", "Media",
        ),
    ),
    "computers and technology": (
        ("computer", "coding", "programming", "technology", "ict"),
        ("ICT", "Engineering"),
    ),
    "biology and life sciences": (
        ("biology", "life science", "health", "living things"),
        ("Health", "Agriculture"),
    ),
    "business and finance": (
        ("business", "finance", "accounting", "marketing", "entrepreneur"),
        ("Finance", "Trade", "Hospitality"),
    ),
}


def run(question: str) -> dict:
    path = BASE / "real" / "career_demand.csv"
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    available_years = sorted({int(row["year"]) for row in rows})
    latest = available_years[-1]
    latest_rows = [row for row in rows if int(row["year"]) == latest]
    normalized_question = question.lower()
    matched_interests = [
        (label, sectors)
        for label, (aliases, sectors) in INTERESTS.items()
        if any(alias in normalized_question for alias in aliases)
    ]
    selected_sectors = {
        sector for _, sectors in matched_interests for sector in sectors
    }

    opportunities = []
    for sector, roles in PATHWAYS.items():
        if selected_sectors and sector not in selected_sectors:
            continue
        role_rows = [
            row for row in latest_rows
            if row["sector"] == sector and row["occupation"] in roles
        ]
        if not role_rows:
            continue
        province_vacancies: dict[str, int] = defaultdict(int)
        district_vacancies: dict[str, int] = defaultdict(int)
        for row in role_rows:
            vacancies = int(float(row["job_vacancies"]))
            province_vacancies[row["province"]] += vacancies
            district_vacancies[row["district"]] += vacancies
        top_provinces = sorted(
            province_vacancies.items(), key=lambda item: (-item[1], item[0])
        )[:3]
        top_districts = sorted(
            district_vacancies.items(), key=lambda item: (-item[1], item[0])
        )[:3]
        opportunities.append({
            "sector": sector,
            "related_occupations": ", ".join(roles),
            "listed_vacancies": sum(int(float(row["job_vacancies"])) for row in role_rows),
            "top_provinces": ", ".join(name for name, _ in top_provinces),
            "top_districts": ", ".join(name for name, _ in top_districts),
            "skill_match": ", ".join(label for label, sectors in matched_interests if sector in sectors)
            or "Quantitative/data-related occupation (explore requirements)",
            "year": latest,
        })
    opportunities.sort(key=lambda row: (-row["listed_vacancies"], row["sector"]))

    return {
        "id": str(uuid.uuid4()),
        "question": question,
        "status": "ok" if opportunities else "no_data",
        "message": None,
        "intent": {
            "metric": "listed_vacancies",
            "operation": "rank",
            "geography": "Rwanda",
            "periodFrom": latest,
            "periodTo": latest,
        },
        "decision": None,
        "datasets": {
            "applied_math_pathways": {
                "label": f"Potential quantitative-skill pathways — generated {latest} job data",
                "columns": [
                    {"key": "sector", "label": "Sector", "kind": "category"},
                    {"key": "related_occupations", "label": "Related occupations to investigate", "kind": "category"},
                    {"key": "listed_vacancies", "label": "Listed vacancies in proxy data", "kind": "number"},
                    {"key": "top_provinces", "label": "Provinces with most listed vacancies", "kind": "category"},
                    {"key": "top_districts", "label": "Districts with most listed vacancies", "kind": "category"},
                    {"key": "skill_match", "label": "Interest match", "kind": "category"},
                    {"key": "year", "label": "Year", "kind": "time"},
                ],
                "rows": opportunities,
                "sourceIds": [SOURCE_ID],
            }
        },
        "metrics": {},
        "insights": {
            "summary": {
                "text": (
                    f"Found {len(opportunities)} potential sectors to investigate using "
                    f"the generated {latest} Rwanda-shaped job-demand data. "
                    + (
                        f"Matched interests: {', '.join(label for label, _ in matched_interests)}. "
                        if matched_interests else ""
                    )
                    + "This is a starting shortlist, not proof that employers accept a "
                    "particular degree or hire fresh graduates."
                ),
                "evidence": ["datasets.applied_math_pathways"],
            }
        },
        "formulas": {},
        "sources": {
            SOURCE_ID: {
                "publisher": "Isesengura demo data",
                "title": "Generated Rwanda-shaped occupation and vacancy proxy data",
                "period": str(latest),
                "file": "career_demand.csv",
                "isSample": True,
            }
        },
        "operations": [
            {"id": "map_skills", "description": "Mapped applied-mathematics skills to illustrative quantitative or analytical occupation pathways."},
            {"id": "aggregate_vacancies", "description": f"Grouped available occupation records by sector and location for {latest}."},
            {"id": "rank_pathways", "description": "Ranked sectors by the sum of listed proxy vacancies for the mapped occupations."},
        ],
        "caveats": [
            "All job-demand values are generated proxy data, not verified current Rwanda vacancies.",
            "The source does not identify entry-level eligibility, degree requirements for each occupation, or applied-mathematics graduate outcomes.",
            "Occupation-to-sector links are illustrative pathways, not validated hiring requirements.",
            "Vacancy totals are summed from the generated district-by-occupation rows and should not be interpreted as official vacancy counts.",
        ],
        "meta": {
            "analysisVersion": ENGINE_VERSION,
            "computedAt": datetime.now(timezone.utc).isoformat(),
            "datasetVersions": {SOURCE_ID: DATASET_VERSION},
            "isSample": True,
        },
    }
