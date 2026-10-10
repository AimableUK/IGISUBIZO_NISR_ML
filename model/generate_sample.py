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

# ── 1. district_labour.csv  (one row per district per year) ──────────────────
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

# ── 2. district_establishments.csv  (one row per district per year) ──────────
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

# ── 3. sector_employment.csv  (district × sector × year) ─────────────────────
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

print("Sample data written to", out)
