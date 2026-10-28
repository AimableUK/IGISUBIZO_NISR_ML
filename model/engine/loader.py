"""
Shared data loader for generated demo CSVs with common dataset schemas.
"""
import pathlib
import csv
from typing import Optional

BASE = pathlib.Path(__file__).parent.parent / "data"
# Files in data/real are generated proxy data, not verified source-table extracts.
IS_SAMPLE_DATA = True

def _read(name: str, real: bool) -> list[dict]:
    folder = BASE / ("real" if real else "sample")
    path = folder / name
    if not path.exists():
        path = BASE / "sample" / name          # fallback to sample
    with open(path, newline="") as f:
        return list(csv.DictReader(f))

def load_district_labour(real: bool = True) -> list[dict]:
    rows = _read("district_labour.csv", real)
    for r in rows:
        for k in ["year","employment_rate","unemployment_rate","underemployment_rate",
                  "youth_neet_rate","labour_force_participation","pct_agriculture",
                  "pct_industry","pct_services","pct_formal","median_hours_worked",
                  "avg_wage_rwf","pct_secondary_plus","pct_tvet","population_15_64"]:
            try: r[k] = float(r[k])
            except (ValueError, KeyError): pass
    return rows

def load_establishments(real: bool = True) -> list[dict]:
    rows = _read("district_establishments.csv", real)
    for r in rows:
        for k in ["year","total_establishments","pct_micro","pct_small",
                  "pct_medium","pct_large","establishment_growth_rate"]:
            try: r[k] = float(r[k])
            except (ValueError, KeyError): pass
    return rows

def load_sector_employment(real: bool = True) -> list[dict]:
    rows = _read("sector_employment.csv", real)
    for r in rows:
        for k in ["year","employment_share","growth_rate","avg_wage_rwf"]:
            try: r[k] = float(r[k])
            except (ValueError, KeyError): pass
    return rows

def load_health(real: bool = True) -> list[dict]:
    rows = _read("district_health.csv", real)
    for r in rows:
        for k in ["year","skilled_birth_attendance","antenatal_care_4plus",
                  "child_vaccination_full","stunting_under5","under5_mortality_per1000",
                  "maternal_mortality_per100k","health_facility_access","hiv_prevalence",
                  "contraceptive_prevalence","open_defecation_free_pct"]:
            try: r[k] = float(r[k])
            except (ValueError, KeyError): pass
    return rows

def load_poverty(real: bool = True) -> list[dict]:
    rows = _read("district_poverty.csv", real)
    for r in rows:
        for k in ["year","poverty_headcount","extreme_poverty_headcount",
                  "mean_consumption_rwf","gini_coefficient","food_insecurity_pct",
                  "access_to_electricity","access_to_clean_water","improved_sanitation",
                  "mobile_money_usage","social_protection_coverage"]:
            try: r[k] = float(r[k])
            except (ValueError, KeyError): pass
    return rows

def load_agriculture(real: bool = True) -> list[dict]:
    rows = _read("district_agriculture.csv", real)
    for r in rows:
        for k in ["year","crop_production_mt","cultivated_area_ha","yield_kg_per_ha",
                  "pct_using_improved_seeds","pct_using_fertilizer","pct_irrigated",
                  "livestock_ownership_pct","crop_loss_pct","agri_household_income_rwf",
                  "pct_selling_surplus"]:
            try: r[k] = float(r[k])
            except (ValueError, KeyError): pass
    return rows

def load_education(real: bool = True) -> list[dict]:
    rows = _read("district_education.csv", real)
    for r in rows:
        for k in ["year","primary_net_enrolment","secondary_net_enrolment",
                  "tvet_enrolment_rate","higher_ed_enrolment_rate",
                  "primary_completion_rate","secondary_completion_rate",
                  "adult_literacy_rate","gender_parity_index_primary",
                  "gender_parity_index_secondary","pupil_teacher_ratio_primary",
                  "school_dropout_rate","pct_schools_with_electricity"]:
            try: r[k] = float(r[k])
            except (ValueError, KeyError): pass
    return rows


def load_tvet_courses(real: bool = True) -> list[dict]:
    rows = _read("tvet_courses.csv", real)
    for r in rows:
        for k in ["year","enrolled_students","female_pct","pass_rate","completion_rate",
                  "employed_within_6months","avg_starting_wage_rwf"]:
            try: r[k] = float(r[k])
            except (ValueError, KeyError): pass
    return rows

def load_higher_ed_programs(real: bool = True) -> list[dict]:
    rows = _read("higher_ed_programs.csv", real)
    for r in rows:
        for k in ["year","enrolled_students","female_pct","graduation_rate",
                  "employed_within_1year","avg_graduate_wage_rwf",
                  "scholarship_pct","international_students_pct"]:
            try: r[k] = float(r[k])
            except (ValueError, KeyError): pass
    return rows

def load_national_exams(real: bool = True) -> list[dict]:
    rows = _read("national_exams.csv", real)
    for r in rows:
        for k in ["year","candidates","pass_rate","distinction_rate",
                  "female_pass_rate","male_pass_rate","mean_score"]:
            try: r[k] = float(r[k])
            except (ValueError, KeyError): pass
    return rows

def load_career_demand(real: bool = True) -> list[dict]:
    rows = _read("career_demand.csv", real)
    for r in rows:
        for k in ["year","job_vacancies","applicants_per_vacancy","avg_advertised_wage_rwf",
                  "pct_filled_within_3months","skill_gap_score",
                  "requires_degree_pct","requires_tvet_pct"]:
            try: r[k] = float(r[k])
            except (ValueError, KeyError): pass
    return rows

def is_real_available() -> bool:
    return (BASE / "real" / "district_labour.csv").exists()
