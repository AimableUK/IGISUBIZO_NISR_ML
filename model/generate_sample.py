"""
Generate sample district-level labour market data (2019-2025).
Mirrors the column structure of NISR LFS + Establishment Census aggregates.
Run once: python generate_sample.py
"""
import csv, math, pathlib, random

DISTRICTS = [
    ("Gasabo","Kigali City"),("Kicukiro","Kigali City"),("Nyarugenge","Kigali City"),
    ("Bugesera","Eastern"),("Gatsibo","Eastern"),("Kayonza","Eastern"),("Kirehe","Eastern"),
    ("Maramagambo","Eastern"),("Ngoma","Eastern"),("Nyagatare","Eastern"),("Rwamagana","Eastern"),
    ("Burera","Northern"),("Gakenke","Northern"),("Gicumbi","Northern"),("Musanze","Northern"),("Rulindo","Northern"),
    ("Gisagara","Southern"),("Huye","Southern"),("Kamonyi","Southern"),("Muhanga","Southern"),
    ("Nyamagabe","Southern"),("Nyamasheke","Southern"),("Nyanza","Southern"),("Ruhango","Southern"),
    ("Karongi","Western"),("Ngororero","Western"),("Nyabihu","Western"),("Nyamasheke","Western"),
    ("Rubavu","Western"),("Rusizi","Western"),
]

YEARS = list(range(2019, 2026))
SECTORS = ["Agriculture","Manufacturing","Construction","Trade","ICT","Education","Health","Finance","Other"]

rng = random.Random(42)

def _base(district: str, key: str, lo: float, hi: float) -> float:
    h = hash(district + key) & 0xFFFF
    return lo + (h / 0xFFFF) * (hi - lo)

def _val(district: str, key: str, year: int, lo: float, hi: float, trend: float = 0.0) -> float:
    base = _base(district, key, lo, hi)
    noise = math.sin(hash(district + key + str(year)) & 0xFF) * 0.8
    return round(min(hi, max(lo, base + trend * (year - 2019) + noise)), 1)

out = pathlib.Path(__file__).parent / "data" / "sample"
out.mkdir(parents=True, exist_ok=True)

# -- 1. district_labour.csv  (one row per district per year) ------------------
with open(out / "district_labour.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["district","province","year",
                "employment_rate","unemployment_rate","underemployment_rate",
                "youth_neet_rate","labour_force_participation",
                "pct_agriculture","pct_industry","pct_services",
                "pct_formal","median_hours_worked","avg_wage_rwf",
                "pct_secondary_plus","pct_tvet","population_15_64"])
    for dist, prov in DISTRICTS:
        is_kigali = prov == "Kigali City"
        for yr in YEARS:
            w.writerow([
                dist, prov, yr,
                _val(dist,"emp",yr, 55 if is_kigali else 42, 78 if is_kigali else 65, 0.4),
                _val(dist,"unemp",yr, 12 if is_kigali else 5, 22 if is_kigali else 14, -0.2),
                _val(dist,"underemp",yr, 8 if is_kigali else 18, 20 if is_kigali else 42, -0.5),
                _val(dist,"neet",yr, 10 if is_kigali else 22, 25 if is_kigali else 48, -0.6),
                _val(dist,"lfp",yr, 62, 85, 0.3),
                _val(dist,"agri",yr, 5 if is_kigali else 40, 20 if is_kigali else 75, -0.8),
                _val(dist,"ind",yr, 10, 28, 0.3),
                _val(dist,"svc",yr, 30 if is_kigali else 10, 70 if is_kigali else 35, 0.5),
                _val(dist,"formal",yr, 25 if is_kigali else 8, 55 if is_kigali else 22, 0.6),
                _val(dist,"hours",yr, 32, 48, 0.1),
                _val(dist,"wage",yr, 45000 if is_kigali else 18000, 180000 if is_kigali else 65000, 1200),
                _val(dist,"sec",yr, 30 if is_kigali else 12, 72 if is_kigali else 45, 0.7),
                _val(dist,"tvet",yr, 4, 18, 0.3),
                int(_val(dist,"pop",yr, 80000 if is_kigali else 40000, 350000 if is_kigali else 180000, 800)),
            ])

# -- 2. district_establishments.csv  (one row per district per year) ----------
with open(out / "district_establishments.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["district","province","year","total_establishments",
                "pct_micro","pct_small","pct_medium","pct_large",
                "dominant_sector","establishment_growth_rate"])
    for dist, prov in DISTRICTS:
        is_kigali = prov == "Kigali City"
        for yr in YEARS:
            w.writerow([
                dist, prov, yr,
                int(_val(dist,"est",yr, 800 if is_kigali else 200, 12000 if is_kigali else 2500, 80)),
                _val(dist,"micro",yr, 55, 80, -0.3),
                _val(dist,"small",yr, 12, 30, 0.2),
                _val(dist,"med",yr, 3, 10, 0.1),
                _val(dist,"large",yr, 0.5, 4, 0.05),
                rng.choice(SECTORS),
                _val(dist,"estgr",yr, -2, 8, 0.1),
            ])

# -- 3. sector_employment.csv  (district × sector × year) ---------------------
with open(out / "sector_employment.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["district","province","year","sector","employment_share","growth_rate","avg_wage_rwf"])
    for dist, prov in DISTRICTS:
        is_kigali = prov == "Kigali City"
        for yr in YEARS:
            for sec in SECTORS:
                w.writerow([
                    dist, prov, yr, sec,
                    _val(dist+sec,"share",yr, 2, 40, 0.1),
                    _val(dist+sec,"sgr",yr, -3, 9, 0.15),
                    int(_val(dist+sec,"swage",yr, 20000 if is_kigali else 12000, 200000 if is_kigali else 80000, 900)),
                ])

# -- 4. district_health.csv  (DHS-aligned; one row per district per year) -----
with open(out / "district_health.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["district","province","year",
                "skilled_birth_attendance","antenatal_care_4plus",
                "child_vaccination_full","stunting_under5",
                "under5_mortality_per1000","maternal_mortality_per100k",
                "health_facility_access","hiv_prevalence",
                "contraceptive_prevalence","open_defecation_free_pct"])
    for dist, prov in DISTRICTS:
        is_kigali = prov == "Kigali City"
        for yr in YEARS:
            w.writerow([
                dist, prov, yr,
                _val(dist,"sba",yr, 85 if is_kigali else 60, 99, 0.5),
                _val(dist,"anc4",yr, 55 if is_kigali else 30, 92, 0.8),
                _val(dist,"vacc",yr, 75 if is_kigali else 55, 98, 0.6),
                _val(dist,"stunt",yr, 8 if is_kigali else 28, 20 if is_kigali else 48, -0.5),
                _val(dist,"u5mort",yr, 18 if is_kigali else 35, 40 if is_kigali else 75, -0.8),
                _val(dist,"mmr",yr, 80 if is_kigali else 180, 200 if is_kigali else 450, -5.0),
                _val(dist,"hfa",yr, 70 if is_kigali else 40, 99, 0.7),
                _val(dist,"hiv",yr, 1.5 if is_kigali else 0.5, 5.0 if is_kigali else 2.5, -0.05),
                _val(dist,"cpr",yr, 55 if is_kigali else 35, 85, 0.6),
                _val(dist,"odf",yr, 60 if is_kigali else 30, 99, 1.2),
            ])

# -- 5. district_poverty.csv  (EICV-aligned; one row per district per year) ---
with open(out / "district_poverty.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["district","province","year",
                "poverty_headcount","extreme_poverty_headcount",
                "mean_consumption_rwf","gini_coefficient",
                "food_insecurity_pct","access_to_electricity",
                "access_to_clean_water","improved_sanitation",
                "mobile_money_usage","social_protection_coverage"])
    for dist, prov in DISTRICTS:
        is_kigali = prov == "Kigali City"
        for yr in YEARS:
            w.writerow([
                dist, prov, yr,
                _val(dist,"pov",yr, 5 if is_kigali else 25, 18 if is_kigali else 55, -0.7),
                _val(dist,"extpov",yr, 1 if is_kigali else 8, 6 if is_kigali else 25, -0.4),
                int(_val(dist,"cons",yr, 80000 if is_kigali else 28000, 250000 if is_kigali else 90000, 2500)),
                _val(dist,"gini",yr, 0.35 if is_kigali else 0.28, 0.52 if is_kigali else 0.42, 0.002),
                _val(dist,"foodins",yr, 5 if is_kigali else 18, 15 if is_kigali else 42, -0.5),
                _val(dist,"elec",yr, 75 if is_kigali else 20, 99, 1.5),
                _val(dist,"water",yr, 70 if is_kigali else 45, 99, 0.8),
                _val(dist,"sanit",yr, 65 if is_kigali else 35, 99, 0.9),
                _val(dist,"momo",yr, 60 if is_kigali else 30, 95, 1.2),
                _val(dist,"socprot",yr, 15 if is_kigali else 25, 45 if is_kigali else 65, 0.5),
            ])

# -- 6. district_agriculture.csv  (SAS-aligned; one row per district per year) 
with open(out / "district_agriculture.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["district","province","year",
                "crop_production_mt","cultivated_area_ha",
                "yield_kg_per_ha","pct_using_improved_seeds",
                "pct_using_fertilizer","pct_irrigated",
                "livestock_ownership_pct","crop_loss_pct",
                "agri_household_income_rwf","pct_selling_surplus"])
    for dist, prov in DISTRICTS:
        is_kigali = prov == "Kigali City"
        for yr in YEARS:
            w.writerow([
                dist, prov, yr,
                int(_val(dist,"cprod",yr, 2000 if is_kigali else 15000, 20000 if is_kigali else 120000, 500)),
                int(_val(dist,"area",yr, 500 if is_kigali else 8000, 5000 if is_kigali else 60000, 100)),
                int(_val(dist,"yield",yr, 800, 3500, 40)),
                _val(dist,"impseed",yr, 20 if is_kigali else 10, 65, 1.0),
                _val(dist,"fert",yr, 25 if is_kigali else 15, 70, 0.8),
                _val(dist,"irrig",yr, 5 if is_kigali else 2, 35, 0.5),
                _val(dist,"lvstk",yr, 20 if is_kigali else 45, 55 if is_kigali else 85, 0.2),
                _val(dist,"croploss",yr, 5, 28, -0.3),
                int(_val(dist,"aginc",yr, 30000 if is_kigali else 15000, 120000 if is_kigali else 60000, 800)),
                _val(dist,"surplus",yr, 15 if is_kigali else 25, 55 if is_kigali else 70, 0.4),
            ])

# -- 7. district_education.csv  (one row per district per year) ---------------
with open(out / "district_education.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["district","province","year",
                "primary_net_enrolment","secondary_net_enrolment",
                "tvet_enrolment_rate","higher_ed_enrolment_rate",
                "primary_completion_rate","secondary_completion_rate",
                "adult_literacy_rate","gender_parity_index_primary",
                "gender_parity_index_secondary","pupil_teacher_ratio_primary",
                "school_dropout_rate","pct_schools_with_electricity"])
    for dist, prov in DISTRICTS:
        is_kigali = prov == "Kigali City"
        for yr in YEARS:
            w.writerow([
                dist, prov, yr,
                _val(dist,"pne",yr, 85 if is_kigali else 70, 99, 0.3),
                _val(dist,"sne",yr, 35 if is_kigali else 18, 75 if is_kigali else 52, 0.8),
                _val(dist,"tvet",yr, 5 if is_kigali else 2, 22 if is_kigali else 12, 0.4),
                _val(dist,"higher",yr, 8 if is_kigali else 1, 28 if is_kigali else 6, 0.3),
                _val(dist,"primcomp",yr, 75 if is_kigali else 55, 98, 0.5),
                _val(dist,"seccomp",yr, 30 if is_kigali else 15, 72 if is_kigali else 48, 0.6),
                _val(dist,"lit",yr, 80 if is_kigali else 60, 99, 0.5),
                _val(dist,"gpip",yr, 0.92, 1.05, 0.003),
                _val(dist,"gpis",yr, 0.85 if is_kigali else 0.75, 1.08, 0.005),
                _val(dist,"ptr",yr, 35 if is_kigali else 45, 55 if is_kigali else 70, -0.3),
                _val(dist,"dropout",yr, 2 if is_kigali else 8, 10 if is_kigali else 22, -0.3),
                _val(dist,"schelec",yr, 55 if is_kigali else 20, 99, 1.5),
            ])

print("Sample data written to", out)

# -- 8. tvet_courses.csv  (district × trade × year) ---------------------------
TVET_TRADES = [
    "Construction & Building Technology",
    "Electrical & Electronics",
    "Mechanics & Automotive",
    "ICT & Computer Science",
    "Agriculture & Food Processing",
    "Hospitality & Tourism",
    "Health & Community Services",
    "Fashion & Garment Making",
    "Plumbing & Sanitation",
    "Welding & Metal Fabrication",
    "Business & Entrepreneurship",
    "Renewable Energy",
]

with open(out / "tvet_courses.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["district","province","year","trade","level",
                "enrolled_students","female_pct","pass_rate",
                "completion_rate","employed_within_6months",
                "avg_starting_wage_rwf","industry_partnership"])
    LEVELS = ["Level 2","Level 3","Level 4","Level 5"]
    for dist, prov in DISTRICTS:
        is_kigali = prov == "Kigali City"
        for yr in YEARS:
            for trade in TVET_TRADES:
                is_tech = trade in ("ICT & Computer Science","Electrical & Electronics","Renewable Energy")
                level = rng.choice(LEVELS)
                w.writerow([
                    dist, prov, yr, trade, level,
                    int(_val(dist+trade,"enr",yr, 20 if is_kigali else 8, 180 if is_kigali else 60, 2)),
                    _val(dist+trade,"fem",yr, 15 if is_tech else 35, 45 if is_tech else 72, 0.4),
                    _val(dist+trade,"pass",yr, 55, 92, 0.5),
                    _val(dist+trade,"comp",yr, 50, 90, 0.4),
                    _val(dist+trade,"emp6m",yr, 35 if is_kigali else 20, 78 if is_kigali else 55, 0.6),
                    int(_val(dist+trade,"wage",yr, 40000 if is_kigali else 22000, 150000 if is_kigali else 70000, 1000)),
                    rng.choice(["Yes","No","Partial"]),
                ])

# -- 9. higher_ed_programs.csv  (institution × program × year) ----------------
INSTITUTIONS = [
    ("University of Rwanda","Kigali City"),
    ("INES Ruhengeri","Northern"),
    ("KIM University","Kigali City"),
    ("Mount Kenya University Rwanda","Kigali City"),
    ("Adventist University of Central Africa","Eastern"),
    ("Rwanda Polytechnic","Kigali City"),
    ("Carnegie Mellon University Africa","Kigali City"),
    ("African Leadership University","Kigali City"),
]

PROGRAMS = [
    ("Medicine & Surgery","Health"),
    ("Nursing","Health"),
    ("Public Health","Health"),
    ("Computer Science","ICT"),
    ("Software Engineering","ICT"),
    ("Data Science & AI","ICT"),
    ("Electrical Engineering","Engineering"),
    ("Civil Engineering","Engineering"),
    ("Mechanical Engineering","Engineering"),
    ("Agriculture","Agriculture"),
    ("Agribusiness","Agriculture"),
    ("Business Administration","Business"),
    ("Accounting & Finance","Business"),
    ("Economics","Business"),
    ("Education","Education"),
    ("Law","Law"),
    ("Environmental Science","Environment"),
    ("Architecture","Engineering"),
    ("Journalism & Media","Arts"),
    ("Social Work","Social Sciences"),
]

with open(out / "higher_ed_programs.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["institution","province","year","program","field",
                "enrolled_students","female_pct","graduation_rate",
                "employed_within_1year","avg_graduate_wage_rwf",
                "scholarship_pct","international_students_pct"])
    for inst, prov in INSTITUTIONS:
        for yr in YEARS:
            for prog, field in PROGRAMS:
                is_stem = field in ("ICT","Engineering","Health")
                w.writerow([
                    inst, prov, yr, prog, field,
                    int(_val(inst+prog,"enr",yr, 15, 800, 10)),
                    _val(inst+prog,"fem",yr, 20 if is_stem else 45, 55 if is_stem else 75, 0.3),
                    _val(inst+prog,"grad",yr, 55, 92, 0.4),
                    _val(inst+prog,"emp1y",yr, 45, 88, 0.5),
                    int(_val(inst+prog,"wage",yr, 80000, 350000, 2500)),
                    _val(inst+prog,"schol",yr, 5, 45, 0.2),
                    _val(inst+prog,"intl",yr, 0.5, 18, 0.1),
                ])

# -- 10. national_exams.csv  (district × exam level × subject × year) ---------
EXAM_LEVELS = ["P6","S3","S6"]
SUBJECTS = {
    "P6": ["Mathematics","English","Kinyarwanda","Science","Social Studies"],
    "S3": ["Mathematics","English","French","Physics","Chemistry","Biology","History","Geography","ICT"],
    "S6": ["Mathematics","Physics","Chemistry","Biology","Economics","Geography","History",
           "Computer Science","Entrepreneurship","English Literature"],
}

with open(out / "national_exams.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["district","province","year","exam_level","subject",
                "candidates","pass_rate","distinction_rate",
                "female_pass_rate","male_pass_rate","mean_score"])
    for dist, prov in DISTRICTS:
        is_kigali = prov == "Kigali City"
        for yr in YEARS:
            for lvl in EXAM_LEVELS:
                for subj in SUBJECTS[lvl]:
                    is_stem = subj in ("Mathematics","Physics","Chemistry","Biology","Computer Science","ICT")
                    w.writerow([
                        dist, prov, yr, lvl, subj,
                        int(_val(dist+lvl+subj,"cand",yr, 200 if is_kigali else 80, 2500 if is_kigali else 800, 15)),
                        _val(dist+lvl+subj,"pass",yr, 45 if is_stem else 55, 88 if is_stem else 95, 0.5),
                        _val(dist+lvl+subj,"dist",yr, 3, 28, 0.3),
                        _val(dist+lvl+subj,"fpass",yr, 42 if is_stem else 55, 85 if is_stem else 94, 0.5),
                        _val(dist+lvl+subj,"mpass",yr, 48 if is_stem else 56, 90 if is_stem else 95, 0.4),
                        _val(dist+lvl+subj,"mean",yr, 42, 78, 0.4),
                    ])

# -- 11. career_demand.csv  (district × occupation × year) --------------------
OCCUPATIONS = [
    ("Software Developer","ICT"),
    ("Data Analyst","ICT"),
    ("Network Engineer","ICT"),
    ("Civil Engineer","Engineering"),
    ("Electrical Engineer","Engineering"),
    ("Medical Doctor","Health"),
    ("Nurse","Health"),
    ("Pharmacist","Health"),
    ("Secondary Teacher","Education"),
    ("TVET Instructor","Education"),
    ("Accountant","Finance"),
    ("Bank Officer","Finance"),
    ("Agronomist","Agriculture"),
    ("Veterinarian","Agriculture"),
    ("Construction Foreman","Construction"),
    ("Electrician","Construction"),
    ("Plumber","Construction"),
    ("Hotel Manager","Hospitality"),
    ("Tour Guide","Hospitality"),
    ("Journalist","Media"),
    ("Lawyer","Legal"),
    ("Social Worker","Social Services"),
    ("Logistics Officer","Transport"),
    ("Customs Officer","Trade"),
]

with open(out / "career_demand.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["district","province","year","occupation","sector",
                "job_vacancies","applicants_per_vacancy",
                "avg_advertised_wage_rwf","pct_filled_within_3months",
                "skill_gap_score","requires_degree_pct",
                "requires_tvet_pct","demand_trend"])
    TRENDS = ["Growing","Stable","Declining"]
    for dist, prov in DISTRICTS:
        is_kigali = prov == "Kigali City"
        for yr in YEARS:
            for occ, sec in OCCUPATIONS:
                is_digital = sec == "ICT"
                w.writerow([
                    dist, prov, yr, occ, sec,
                    int(_val(dist+occ,"vac",yr, 2 if not is_kigali else 5, 80 if is_kigali else 25, 0.8)),
                    _val(dist+occ,"apv",yr, 1.2, 18, -0.1),
                    int(_val(dist+occ,"wage",yr, 60000 if is_kigali else 35000, 500000 if is_kigali else 180000, 3000)),
                    _val(dist+occ,"fill",yr, 35, 88, 0.3),
                    _val(dist+occ,"gap",yr, 1, 9, -0.1),
                    _val(dist+occ,"deg",yr, 30 if sec in ("Construction","Hospitality") else 60, 95, 0.2),
                    _val(dist+occ,"tvet",yr, 5 if sec in ("Health","Legal") else 20, 65, 0.3),
                    rng.choice(TRENDS) if not is_digital else "Growing",
                ])

print("Education & career sample data written to", out)
