"""Answer metric, comparison, and trend questions from the available CSV datasets."""
from __future__ import annotations

import csv
import math
import re
import uuid
from collections import defaultdict
from datetime import datetime, timezone

from .loader import BASE, IS_SAMPLE_DATA

ENGINE_VERSION = "data-query-1.0.0"
DATA_VERSION = "demo-proxy-1"


def _metric(
    field: str,
    label: str,
    *aliases: str,
    unit: str = "",
    aggregation: str = "mean",
) -> dict:
    return {
        "field": field,
        "label": label,
        "aliases": (field.replace("_", " "), *aliases),
        "unit": unit,
        "aggregation": aggregation,
    }


DATASETS = [
    {
        "file": "official/district_crop_yield.csv", "id": "nisr_agriculture_yield",
        "title": "Average yield by season, district and crop type",
        "domain": ("crop yield", "agriculture yield"),
        "groups": ("district", "crop_type", "season"),
        "metrics": (
            _metric(
                "yield_kg_per_ha",
                "Crop yield",
                "yield",
                "productivity",
                "yield per hectare",
                "per hectare",
                "per ha",
                "kg per hectare",
                "kg per ha",
                "harvest yield",
                "crop productivity",
                "farm productivity",
                "productive",
                unit="kg/ha",
            ),
        ),
        "isSample": False,
        "version": "nisr-pxweb-snapshot",
        "publisher": "National Institute of Statistics of Rwanda (NISR)",
        "url": "https://pxweb.statistics.gov.rw/pxweb/en/NISR%20Statistical%20Databases/Agriculture/Crop%20area,%20production%20and%20yield%20for%20major%20crops/yield.px",
        "period": "Season A and Season B (reference year not stated)",
    },
    {
        "file": "district_labour.csv", "id": "demo_labour",
        "title": "Generated labour-market proxy data", "domain": ("labour", "labor", "employment", "workforce", "jobs"),
        "groups": ("district", "province"),
        "metrics": (
            _metric("employment_rate", "Employment rate", "employed", "employment", unit="%"),
            _metric("unemployment_rate", "Unemployment rate", "unemployed", "unemployment", unit="%"),
            _metric("underemployment_rate", "Underemployment rate", "underemployment", "underemployed", unit="%"),
            _metric("youth_neet_rate", "Youth NEET rate", "neet", "youth not in employment education or training", unit="%"),
            _metric("labour_force_participation", "Labour-force participation", "participation rate", "lfp", unit="%"),
            _metric("pct_agriculture", "Employment in agriculture", "agriculture employment", "agricultural employment", unit="%"),
            _metric("pct_industry", "Employment in industry", "industry employment", unit="%"),
            _metric("pct_services", "Employment in services", "services employment", unit="%"),
            _metric("pct_formal", "Formal employment", "formal jobs", "formal sector", unit="%"),
            _metric("median_hours_worked", "Median hours worked", "working hours", "hours worked", unit="hours"),
            _metric("avg_wage_rwf", "Average wage", "salary", "income", unit="RWF"),
            _metric("pct_secondary_plus", "Workers with secondary education or higher", "secondary education", unit="%"),
            _metric("pct_tvet", "Workers with TVET qualifications", "tvet qualification", unit="%"),
            _metric("population_15_64", "Working-age population", "working age population", "population", unit="people", aggregation="sum"),
        ),
    },
    {
        "file": "district_poverty.csv", "id": "demo_poverty",
        "title": "Generated household-welfare proxy data", "domain": ("poverty", "living standards", "household welfare", "income inequality"),
        "groups": ("district", "province"),
        "metrics": (
            _metric("poverty_headcount", "Poverty headcount", "poverty rate", "people in poverty", unit="%"),
            _metric("extreme_poverty_headcount", "Extreme-poverty headcount", "extreme poverty", unit="%"),
            _metric("mean_consumption_rwf", "Mean household consumption", "consumption", "household spending", unit="RWF"),
            _metric("gini_coefficient", "Gini coefficient", "inequality", "gini"),
            _metric("food_insecurity_pct", "Food insecurity", "food insecurity rate", "food insecure", unit="%"),
            _metric("access_to_electricity", "Households with electricity access", "electricity access", "electricity", unit="%"),
            _metric("access_to_clean_water", "Households with clean-water access", "clean water access", "water access", unit="%"),
            _metric("improved_sanitation", "Improved sanitation", "sanitation", unit="%"),
            _metric("mobile_money_usage", "Mobile-money usage", "mobile money", unit="%"),
            _metric("social_protection_coverage", "Social-protection coverage", "social protection", unit="%"),
        ),
    },
    {
        "file": "district_health.csv", "id": "demo_health",
        "title": "Generated health-indicator proxy data", "domain": ("health", "healthcare", "health care", "maternal health", "child health"),
        "groups": ("district", "province"),
        "metrics": (
            _metric("skilled_birth_attendance", "Skilled birth attendance", "birth attendance", "facility delivery", unit="%"),
            _metric("antenatal_care_4plus", "Four or more antenatal visits", "antenatal care", "prenatal care", "anc", unit="%"),
            _metric("child_vaccination_full", "Full child vaccination", "vaccination", "immunization", "immunisation", unit="%"),
            _metric("stunting_under5", "Stunting among children under five", "child stunting", "stunting", unit="%"),
            _metric("under5_mortality_per1000", "Under-five mortality", "child mortality", "infant mortality", unit="per 1,000"),
            _metric("maternal_mortality_per100k", "Maternal mortality", "maternal deaths", unit="per 100,000"),
            _metric("health_facility_access", "Access to a health facility", "health facility access", "clinic access", unit="%"),
            _metric("hiv_prevalence", "HIV prevalence", "hiv", unit="%"),
            _metric("contraceptive_prevalence", "Contraceptive prevalence", "contraception", "family planning", unit="%"),
            _metric("open_defecation_free_pct", "Households free from open defecation", "open defecation", unit="%"),
        ),
    },
    {
        "file": "district_agriculture.csv", "id": "demo_agriculture",
        "title": "Generated agriculture proxy data", "domain": ("agriculture", "farming", "farm", "crops", "livestock"),
        "groups": ("district", "province"),
        "metrics": (
            _metric("crop_production_mt", "Crop production", "crop output", "production", unit="metric tonnes"),
            _metric("cultivated_area_ha", "Cultivated area", "farm area", "land cultivated", unit="ha"),
            _metric("yield_kg_per_ha", "Crop yield", "yield", "productivity", unit="kg/ha"),
            _metric("pct_using_improved_seeds", "Use of improved seeds", "improved seeds", "seed use", unit="%"),
            _metric("pct_using_fertilizer", "Fertilizer use", "fertilizer", "fertiliser", unit="%"),
            _metric("pct_irrigated", "Irrigated area", "irrigation", "irrigated", unit="%"),
            _metric("livestock_ownership_pct", "Livestock ownership", "livestock", "animal ownership", unit="%"),
            _metric("crop_loss_pct", "Crop losses", "crop loss", "harvest loss", unit="%"),
            _metric("agri_household_income_rwf", "Agricultural household income", "farm income", "agricultural income", unit="RWF"),
            _metric("pct_selling_surplus", "Households selling agricultural surplus", "selling surplus", "marketed surplus", unit="%"),
        ),
    },
    {
        "file": "district_education.csv", "id": "demo_education",
        "title": "Generated education proxy data", "domain": ("education", "schools", "schooling", "literacy", "enrolment", "enrollment"),
        "groups": ("district", "province"),
        "metrics": (
            _metric("primary_net_enrolment", "Primary net enrolment", "primary enrollment", "primary enrolment", unit="%"),
            _metric("secondary_net_enrolment", "Secondary net enrolment", "secondary enrollment", "secondary enrolment", unit="%"),
            _metric("tvet_enrolment_rate", "TVET enrolment rate", "tvet enrollment", "technical education", unit="%"),
            _metric("higher_ed_enrolment_rate", "Higher-education enrolment rate", "university enrolment", "higher education", unit="%"),
            _metric("primary_completion_rate", "Primary completion rate", "primary completion", unit="%"),
            _metric("secondary_completion_rate", "Secondary completion rate", "secondary completion", unit="%"),
            _metric("adult_literacy_rate", "Adult literacy rate", "literacy", "adult literacy", unit="%"),
            _metric("gender_parity_index_primary", "Primary gender-parity index", "primary gender parity"),
            _metric("gender_parity_index_secondary", "Secondary gender-parity index", "secondary gender parity"),
            _metric("pupil_teacher_ratio_primary", "Primary pupil-teacher ratio", "pupil teacher ratio", "class size"),
            _metric("school_dropout_rate", "School dropout rate", "dropout", "school dropouts", unit="%"),
            _metric("pct_schools_with_electricity", "Schools with electricity", "school electricity", unit="%"),
        ),
    },
    {
        "file": "district_establishments.csv", "id": "demo_businesses",
        "title": "Generated business-establishment proxy data", "domain": ("business", "businesses", "enterprise", "establishment", "companies"),
        "groups": ("district", "province", "dominant_sector"),
        "metrics": (
            _metric("total_establishments", "Business establishments", "businesses", "number of businesses", "firms", unit="establishments", aggregation="sum"),
            _metric("pct_micro", "Micro-enterprises", "micro businesses", unit="%"),
            _metric("pct_small", "Small enterprises", "small businesses", unit="%"),
            _metric("pct_medium", "Medium enterprises", "medium businesses", unit="%"),
            _metric("pct_large", "Large enterprises", "large businesses", unit="%"),
            _metric("establishment_growth_rate", "Business-establishment growth", "business growth", "firm growth", unit="%"),
        ),
    },
    {
        "file": "sector_employment.csv", "id": "demo_sector_jobs",
        "title": "Generated sector-employment proxy data", "domain": ("sector", "industry", "sectors"),
        "groups": ("sector", "district", "province"),
        "metrics": (
            _metric("employment_share", "Employment share", "employment", "sector employment", "jobs share", unit="%"),
            _metric("growth_rate", "Employment growth", "job growth", "sector growth", unit="%"),
            _metric("avg_wage_rwf", "Average sector wage", "sector salary", "sector pay", unit="RWF"),
        ),
    },
    {
        "file": "tvet_courses.csv", "id": "demo_tvet",
        "title": "Generated TVET-course proxy data", "domain": ("tvet", "vocational", "technical training", "trade school"),
        "groups": ("trade", "district", "province", "level"),
        "metrics": (
            _metric("enrolled_students", "TVET enrolment", "students enrolled", "enrollment", unit="students", aggregation="sum"),
            _metric("female_pct", "Female share of enrolment", "female students", "women enrolled", unit="%"),
            _metric("pass_rate", "TVET pass rate", "passed", unit="%"),
            _metric("completion_rate", "TVET completion rate", "course completion", unit="%"),
            _metric("employed_within_6months", "Graduates employed within six months", "graduate employment", "employed after training", unit="%"),
            _metric("avg_starting_wage_rwf", "Average starting wage", "starting salary", "starting pay", unit="RWF"),
        ),
    },
    {
        "file": "higher_ed_programs.csv", "id": "demo_higher_education",
        "title": "Generated higher-education proxy data", "domain": ("university", "universities", "college", "higher education", "degree", "program", "programme", "course", "enrollment", "enrolment", "admission", "software engineering", "computer science", "accounting and finance"),
        "groups": ("program", "field", "institution", "province"),
        "metrics": (
            _metric("enrolled_students", "Higher-education enrolment", "students enrolled", "university enrolment", "enrollment", "enrolment", "student intake", "admissions", unit="students", aggregation="sum"),
            _metric("female_pct", "Female share of enrolment", "female students", unit="%"),
            _metric("graduation_rate", "Graduation rate", "graduates", "graduation", unit="%"),
            _metric("employed_within_1year", "Graduates employed within one year", "graduate employment", "graduate jobs", unit="%"),
            _metric("avg_graduate_wage_rwf", "Average graduate wage", "graduate salary", "graduate pay", unit="RWF"),
            _metric("scholarship_pct", "Students with scholarships", "scholarships", unit="%"),
            _metric("international_students_pct", "International students", "foreign students", unit="%"),
        ),
    },
    {
        "file": "national_exams.csv", "id": "demo_exams",
        "title": "Generated national-exam proxy data", "domain": ("exam", "exams", "examination", "test scores", "students"),
        "groups": ("exam_level", "subject", "district", "province"),
        "metrics": (
            _metric("candidates", "Exam candidates", "students taking exams", "number of candidates", unit="candidates", aggregation="sum"),
            _metric("pass_rate", "Exam pass rate", "passed", "passing rate", unit="%"),
            _metric("distinction_rate", "Distinction rate", "distinctions", unit="%"),
            _metric("female_pass_rate", "Female pass rate", "girls passing", unit="%"),
            _metric("male_pass_rate", "Male pass rate", "boys passing", unit="%"),
            _metric("mean_score", "Mean exam score", "average score", "exam score"),
        ),
    },
    {
        "file": "career_demand.csv", "id": "demo_career_demand",
        "title": "Generated career-demand proxy data", "domain": ("career", "careers", "occupation", "occupations", "vacancies"),
        "groups": ("occupation", "sector", "district", "province"),
        "metrics": (
            _metric("job_vacancies", "Job vacancies", "vacancies", "open jobs", "job openings", unit="vacancies", aggregation="sum"),
            _metric("applicants_per_vacancy", "Applicants per vacancy", "competition for jobs", "applicants per job"),
            _metric("avg_advertised_wage_rwf", "Average advertised wage", "advertised salary", "salary", "career pay", unit="RWF"),
            _metric("pct_filled_within_3months", "Vacancies filled within three months", "jobs filled", unit="%"),
            _metric("skill_gap_score", "Skill-gap score", "skills shortage", "skill shortage"),
            _metric("requires_degree_pct", "Vacancies requiring a degree", "degree requirement", unit="%"),
            _metric("requires_tvet_pct", "Vacancies requiring TVET", "tvet requirement", unit="%"),
        ),
    },
]

GENERIC_CAVEATS = [
    "Source status is reported separately for each dataset; generated proxies are not official statistics.",
    "Group averages are unweighted averages of the rows in the selected dataset.",
]


def _normalise(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def _contains(text: str, phrase: str) -> bool:
    normal_text, normal_phrase = _normalise(text), _normalise(phrase)
    if not normal_phrase:
        return False
    words = normal_phrase.split()
    last = words[-1]
    prefix = " ".join(words[:-1])
    alternatives = {normal_phrase}
    if last.endswith("ies"):
        alternatives.add(f"{prefix} {last[:-3]}y".strip())
    elif last.endswith("es"):
        alternatives.add(f"{prefix} {last[:-2]}".strip())
    elif last.endswith("s"):
        alternatives.add(f"{prefix} {last[:-1]}".strip())
    elif last.endswith("y"):
        alternatives.update((f"{normal_phrase}s", f"{normal_phrase[:-1]}ies"))
    else:
        alternatives.update((f"{normal_phrase}s", f"{normal_phrase}es"))
    return any(re.search(rf"(?<!\w){re.escape(candidate)}(?!\w)", normal_text) for candidate in alternatives)


def _category_matches(question: str, value: str, field: str) -> bool:
    if _contains(question, value):
        return True
    if field == "program" and value == "Accounting & Finance":
        return _contains(question, "finance") or _contains(question, "accounting")
    return False


def _requested_dimension(question: str) -> str | None:
    for phrase, field in (
        ("by district", "district"), ("across districts", "district"),
        ("by crop", "crop_type"), ("across crops", "crop_type"),
        ("by season", "season"), ("across seasons", "season"),
        ("between seasons", "season"), ("season a vs season b", "season"),
        ("season a versus season b", "season"), ("season a and season b", "season"),
        ("by province", "province"), ("by sector", "sector"),
        ("by occupation", "occupation"), ("by career", "occupation"),
        ("by trade", "trade"), ("by course", "trade"),
        ("by program", "program"), ("by programme", "program"),
        ("by course", "program"), ("by degree", "program"),
        ("by institution", "institution"), ("by subject", "subject"),
        ("by exam level", "exam_level"), ("by level", "level"),
        ("by field", "field"), ("by university", "institution"),
        ("by college", "institution"), ("by school", "institution"),
    ):
        if _contains(question, phrase):
            return field
    return None


def _read(spec: dict) -> list[dict]:
    if spec.get("isSample") is False:
        path = BASE / spec["file"]
    else:
        path = BASE / "real" / spec["file"]
        if not path.is_file():
            path = BASE / "sample" / spec["file"]
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    for row in rows:
        for key, value in row.items():
            try:
                number = float(value)
                row[key] = number if math.isfinite(number) else None
            except (TypeError, ValueError):
                pass
    return rows


def _select(question: str) -> tuple[dict | None, list[dict], list[dict]]:
    explicit_domains = {
        spec["id"]
        for spec in DATASETS
        if any(_contains(question, alias) for alias in spec["domain"])
    }
    all_metric_matches = set()
    candidates = []
    for spec in DATASETS:
        rows = _read(spec)
        if not rows:
            continue
        metric_scores = []
        for metric in spec["metrics"]:
            for alias in metric["aliases"]:
                if _contains(question, alias):
                    metric_scores.append((len(_normalise(alias)), metric))
                    all_metric_matches.add(spec["id"])
        category_match = any(
            _category_matches(question, str(row[field]), field)
            for field in spec["groups"]
            if field in rows[0]
            for row in rows
            if row.get(field) not in (None, "")
        )
        if explicit_domains and spec["id"] not in explicit_domains and not metric_scores:
            continue
        requested_dimension = _requested_dimension(question)
        if requested_dimension and requested_dimension not in spec["groups"]:
            continue
        domain_scores = [len(_normalise(alias)) for alias in spec["domain"] if _contains(question, alias)]
        if metric_scores:
            score, selected = max(metric_scores, key=lambda match: match[0])
            candidates.append((score + 100 + (50 if category_match else 0), spec, [selected], rows))
        elif domain_scores:
            candidates.append((max(domain_scores), spec, list(spec["metrics"]), rows))
        elif explicit_domains and spec["id"] in explicit_domains:
            candidates.append((max((len(_normalise(alias)) for alias in spec["domain"] if _contains(question, alias)), default=0), spec, list(spec["metrics"]), rows))
    if explicit_domains and not any(candidate[1]["id"] in explicit_domains and candidate[0] >= 100 for candidate in candidates) and all_metric_matches:
        return None, [], []
    if not candidates:
        return None, [], []
    _, spec, metrics, rows = max(candidates, key=lambda candidate: candidate[0])
    return spec, metrics, rows


def _years(question: str, rows: list[dict]) -> list[int]:
    available = sorted({int(row["year"]) for row in rows if isinstance(row.get("year"), (int, float))})
    if not available:
        return []
    count_words = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    }
    match = re.search(r"(?:last|past)\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)\s+years?", question, re.I)
    since = re.search(r"\bsince\s+(20\d{2})\b", question, re.I)
    year_range = re.search(r"\b(?:from|between)\s+(20\d{2})\s+(?:to|and|through)\s+(20\d{2})\b", question, re.I)
    explicit_year = re.search(r"\bin\s+(20\d{2})\b", question, re.I)
    if year_range:
        start, end = sorted((int(year_range.group(1)), int(year_range.group(2))))
        return [year for year in available if start <= year <= end]
    if explicit_year:
        selected = int(explicit_year.group(1))
        return [selected] if selected in available else []
    if match:
        value = match.group(1).lower()
        requested = int(value) if value.isdigit() else count_words[value]
        count = min(max(requested, 1), len(available))
        return available[-count:]
    if since:
        return [year for year in available if year >= int(since.group(1))]
    if re.search(r"\b(trends?|over time|over the years|each year|annually|historical)\b", question, re.I):
        return available
    return [available[-1]]


def _chosen_dimensions(question: str, spec: dict, rows: list[dict]) -> list[str]:
    available = set(rows[0])
    dimensions = [field for field in spec["groups"] if field in available]
    wanted = None
    for phrase, field in (
        ("by district", "district"), ("across districts", "district"),
        ("by crop", "crop_type"), ("across crops", "crop_type"),
        ("by season", "season"), ("across seasons", "season"),
        ("between seasons", "season"), ("season a vs season b", "season"),
        ("season a versus season b", "season"), ("season a and season b", "season"),
        ("by province", "province"), ("by sector", "sector"),
        ("by occupation", "occupation"), ("by career", "occupation"),
        ("by trade", "trade"), ("by course", "trade"),
        ("by program", "program"), ("by programme", "program"),
        ("by course", "program"), ("by degree", "program"),
        ("by institution", "institution"), ("by subject", "subject"),
        ("by exam level", "exam_level"), ("by level", "level"),
        ("by field", "field"), ("by university", "institution"),
        ("by college", "institution"), ("by school", "institution"),
    ):
        if _contains(question, phrase) and field in dimensions:
            wanted = field
            break
    if wanted:
        return [wanted]
    preferred = next((field for field in dimensions if field in ("district", "occupation", "sector", "trade", "program", "subject", "crop_type")), None)
    return [preferred] if preferred else ([dimensions[0]] if dimensions else [])


def _filter_rows(
    question: str, rows: list[dict], dimensions: list[str]
) -> tuple[list[dict], list[str], list[str]]:
    selected = list(rows)
    filters = []
    matched_fields = []
    # Exact data values let users filter by district, province, sector, occupation, subject, and more.
    for field in ("district", "province", "sector", "occupation", "trade", "program", "field", "institution", "subject", "exam_level", "level", "dominant_sector", "crop_type", "season"):
        if not selected or field not in selected[0]:
            continue
        values = sorted({str(row[field]) for row in selected if row.get(field) not in (None, "")}, key=len, reverse=True)
        found = [value for value in values if _category_matches(question, value, field)]
        if found:
            wanted = {value.lower() for value in found}
            selected = [row for row in selected if str(row.get(field, "")).lower() in wanted]
            filters.append(f"{field.replace('_', ' ')}: {', '.join(found)}")
            matched_fields.append(field)
    return selected, filters, matched_fields


def _aggregate(rows: list[dict], metrics: list[dict], dimensions: list[str], include_year: bool) -> list[dict]:
    buckets: dict[tuple, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))
    for row in rows:
        group = tuple(row.get(field) for field in dimensions)
        if include_year:
            group += (row.get("year"),)
        for metric in metrics:
            value = row.get(metric["field"])
            if isinstance(value, (int, float)) and math.isfinite(value):
                buckets[group][metric["field"]].append(float(value))
    output = []
    for group, values in buckets.items():
        item = {field: value for field, value in zip(dimensions, group)}
        offset = len(dimensions)
        if include_year:
            item["year"] = int(group[offset])
        for metric in metrics:
            vals = values.get(metric["field"], [])
            if metric.get("aggregation") == "sum":
                item[metric["field"]] = round(sum(vals), 2) if vals else None
            else:
                item[metric["field"]] = round(sum(vals) / len(vals), 2) if vals else None
        output.append(item)
    return output


def _column(field: str, label: str, unit: str = "", dimensions: tuple[str, ...] = ()) -> dict:
    kind = "time" if field == "year" else "geo" if field in ("district", "province") else "category" if field in dimensions else "percent" if unit == "%" else "number"
    return {"key": field, "label": label, "kind": kind, "unit": unit or None}


def _empty(question: str, message: str, status: str = "unsupported") -> dict:
    examples = "Try questions about employment, wages, poverty, electricity access, health, farming, school enrolment, exam scores, businesses, TVET, universities, sectors, or career vacancies."
    return {
        "id": str(uuid.uuid4()), "question": question, "status": status,
        "message": f"{message} {examples}",
        "intent": {}, "decision": None, "datasets": {}, "metrics": {},
        "insights": {}, "formulas": {}, "sources": {},
        "operations": [{"id": "dataset_lookup", "description": "Matched the question against available dataset metrics and categories."}],
        "caveats": GENERIC_CAVEATS,
        "meta": {"analysisVersion": ENGINE_VERSION, "computedAt": datetime.now(timezone.utc).isoformat(), "datasetVersions": {}, "isSample": IS_SAMPLE_DATA},
    }


def run(question: str) -> dict:
    spec, metrics, rows = _select(question)
    if not spec:
        return _empty(
            question,
            "I couldn't match that question to a metric in the available datasets.",
        )

    rows, filters, matched_fields = _filter_rows(question, rows, list(spec["groups"]))
    if not rows:
        return _empty(question, "I couldn't find matching records for the requested category.", "no_data")

    requested_dimension = _requested_dimension(question)
    has_crop_filter = any(item.startswith("crop type:") for item in filters)
    if (
        spec["id"] == "nisr_agriculture_yield"
        and not has_crop_filter
        and requested_dimension not in (None, "crop_type")
    ):
        return _empty(
            question,
            "Crop yields are not directly comparable across different crops. "
            "Please specify a crop, such as maize, cassava, or beans.",
            "ambiguous",
        )

    years = _years(question, rows)
    if years:
        rows = [row for row in rows if int(row.get("year", years[-1])) in years]
    latest_year = years[-1] if years else None
    dimension_fields = _chosen_dimensions(question, spec, rows)
    for field in matched_fields:
        if field in spec["groups"] and field not in dimension_fields:
            dimension_fields.append(field)
    if spec["id"] == "nisr_agriculture_yield" and not has_crop_filter and requested_dimension is None:
        dimension_fields = ["crop_type"]
    is_trend = bool(years and len(years) > 1 and re.search(r"\b(trends?|over time|over the years|each year|annually|historical|last|past|since|between|from)\b", question, re.I))
    is_rank = bool(re.search(r"\b(top|highest|most|lowest|least|rank|ranking|best|worst)\b", question, re.I))
    group_fields = list(dimension_fields)
    if is_trend:
        group_fields.append("year")

    grouped = _aggregate(rows, metrics, group_fields, False)
    if not grouped:
        return _empty(question, "The selected dataset has no numeric observations for that metric.", "no_data")

    if is_rank and len(metrics) == 1:
        metric_field = metrics[0]["field"]
        descending = not bool(re.search(r"\b(lowest|least|bottom|worst)\b", question, re.I))
        grouped.sort(key=lambda row: row.get(metric_field) if row.get(metric_field) is not None else -math.inf, reverse=descending)
        limit_match = re.search(r"\b(?:top|bottom)\s+(\d{1,2})\b", question, re.I)
        grouped = grouped[:min(int(limit_match.group(1)), 50)] if limit_match else grouped[:10]
    else:
        grouped.sort(key=lambda row: tuple(str(row.get(field, "")) for field in group_fields))

    # Keep chart/table payloads bounded even for high-cardinality source files.
    grouped = grouped[:500]
    metric = metrics[0]
    metric_values = [row[metric["field"]] for row in grouped if isinstance(row.get(metric["field"]), (int, float))]
    if not metric_values:
        return _empty(question, "The selected metric has no numeric observations.", "no_data")
    average = round(sum(metric_values) / len(metric_values), 2)

    dataset_key = "query_results"
    columns = [_column(field, field.replace("_", " ").title(), dimensions=tuple(spec["groups"])) for field in dimension_fields]
    if is_trend:
        columns.append(_column("year", "Year"))
    columns.extend(_column(item["field"], item["label"], item["unit"]) for item in metrics)
    label = f"{', '.join(item['label'] for item in metrics[:4])}" + (" and other indicators" if len(metrics) > 4 else "")
    dataset_rows = [{key: value for key, value in row.items() if key in {column["key"] for column in columns}} for row in grouped]

    metric_cards = {}
    for item in metrics[:6]:
        values = [row[item["field"]] for row in grouped if isinstance(row.get(item["field"]), (int, float))]
        if values:
            metric_cards[item["field"]] = {
                "label": f"Average {item['label']}" if len(grouped) > 1 else item["label"],
                "value": round(sum(values) / len(values), 2),
                "unit": item["unit"],
                "decimals": 2 if item["unit"] in ("RWF", "people", "students", "metric tonnes", "ha") else 1,
                "sourceIds": [spec["id"]],
            }

    subject = metric["label"] if len(metrics) == 1 else f"{spec['domain'][0].title()} indicators"
    if is_rank and len(metrics) == 1:
        subject = f"{'Lowest' if not descending else 'Highest'} {metric['label'].lower()}"
    insights = {
        "summary": {
            "text": f"{subject}: average {average:g}{(' ' + metric['unit']) if metric['unit'] else ''} across {len(grouped)} displayed group(s) in {latest_year if latest_year else 'the available records'}.",
            "evidence": [f"datasets.{dataset_key}"],
        },
    }
    if filters:
        insights["filters"] = {"text": "Applied filters: " + "; ".join(filters) + ".", "evidence": [f"datasets.{dataset_key}"]}

    is_sample = spec.get("isSample", IS_SAMPLE_DATA)
    caveats = [
        "Group averages are unweighted means of the matching source rows.",
    ]
    if is_sample:
        caveats.insert(0, "Demo only: input values are generated proxy data, not verified official observations.")
    elif spec.get("period") and "reference year not stated" in spec["period"]:
        caveats.append("The NISR table does not state a reference year; season values are reported as published.")
    source = {
        "publisher": spec.get("publisher", "Isesengura demo data"),
        "title": spec["title"],
        "period": spec.get("period") or (f"{min(row['year'] for row in rows)}–{max(row['year'] for row in rows)}" if rows and isinstance(rows[0].get("year"), (int, float)) else "Available records"),
        "file": spec["file"],
        "isSample": is_sample,
    }
    if spec.get("url"):
        source["url"] = spec["url"]
    if is_rank:
        question_operation = "rank"
    elif re.search(r"\b(compare|versus|vs|difference between)\b", question, re.I):
        question_operation = "compare"
    elif is_trend:
        question_operation = "trend"
    else:
        question_operation = "compare" if len(grouped) > 1 else "summary"
    return {
        "id": str(uuid.uuid4()),
        "question": question,
        "status": "ok",
        "intent": {
            "metric": metric["field"] if len(metrics) == 1 else None,
            "operation": question_operation,
            "geography": ", ".join(filters) if filters else "Rwanda",
            "periodFrom": min(years) if years else None,
            "periodTo": max(years) if years else None,
        },
        "decision": None,
        "datasets": {
            dataset_key: {
                "label": label,
                "columns": columns,
                "rows": dataset_rows,
                "sourceIds": [spec["id"]],
            },
        },
        "metrics": metric_cards,
        "insights": insights,
        "formulas": {},
        "sources": {spec["id"]: source},
        "operations": [
            {"id": "match_dataset", "description": f"Matched the question to the {spec['title'].lower()} file."},
            {"id": "filter_records", "description": f"Used {len(rows)} matching records" + (f" ({'; '.join(filters)})" if filters else "") + "."},
            {"id": "aggregate", "description": f"Computed averages by {', '.join(group_fields) if group_fields else 'dataset'}; ranking/trend aggregation was applied when requested."},
        ],
        "caveats": caveats,
        "meta": {
            "analysisVersion": ENGINE_VERSION,
            "computedAt": datetime.now(timezone.utc).isoformat(),
            "datasetVersions": {spec["id"]: spec.get("version", DATA_VERSION)},
            "isSample": is_sample,
        },
    }
