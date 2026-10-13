"""
Problem C — Employment trend forecasting by sector/occupation.
Uses simple linear trend (OLS on time) per sector per district aggregate.
Returns trend lines, growth rankings, and a 2-year forward projection with explicit caveats.
"""
from __future__ import annotations
import uuid
from datetime import datetime, timezone

from .loader import load_sector_employment, is_real_available

ENGINE_VERSION = "forecasting-1.0.0"
DATASET_VERSION = "2024.1"
FORECAST_YEARS = 2


def _linear_trend(years: list[int], values: list[float]):
    """Returns (slope, intercept, r2) via simple OLS on a time series."""
    n = len(years)
    if n < 2:
        return 0.0, values[0] if values else 0.0, 0.0
    x_mean = sum(years) / n
    y_mean = sum(values) / n
    ss_xy = sum((years[i] - x_mean) * (values[i] - y_mean) for i in range(n))
    ss_xx = sum((years[i] - x_mean) ** 2 for i in range(n))
    slope = ss_xy / ss_xx if ss_xx else 0.0
    intercept = y_mean - slope * x_mean
    y_pred = [slope * years[i] + intercept for i in range(n)]
    ss_res = sum((values[i] - y_pred[i]) ** 2 for i in range(n))
    ss_tot = sum((values[i] - y_mean) ** 2 for i in range(n))
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0.0
    return round(slope, 3), round(intercept, 3), round(r2, 4)


def run(question: str) -> dict:
    real = is_real_available()
    rows = load_sector_employment(real)

    # aggregate national employment share by sector × year
    from collections import defaultdict
    sector_year: dict[tuple, list[float]] = defaultdict(list)
    for r in rows:
        sector_year[(r["sector"], int(r["year"]))].append(float(r["employment_share"]))

    sectors = sorted({r["sector"] for r in rows})
    years = sorted({int(r["year"]) for r in rows})
    latest_year = max(years)
    forecast_years = [latest_year + i + 1 for i in range(FORECAST_YEARS)]

    # national mean share per sector per year
    nat: dict[str, dict[int, float]] = {}
    for sec in sectors:
        nat[sec] = {}
        for yr in years:
            vals = sector_year.get((sec, yr), [])
            nat[sec][yr] = round(sum(vals) / len(vals), 2) if vals else 0.0

    # fit trend per sector
    trend_rows = []
    forecast_rows = []
    sector_trends = []

    for sec in sectors:
        y_vals = [nat[sec][yr] for yr in years]
        slope, intercept, r2 = _linear_trend(years, y_vals)
        sector_trends.append({"sector": sec, "slope": slope, "r2": r2})

        for yr in years:
            trend_rows.append({"sector": sec, "year": str(yr),
                                "actual_share": nat[sec][yr],
                                "trend_share": round(slope * yr + intercept, 2)})
        for yr in forecast_years:
            proj = round(slope * yr + intercept, 2)
            forecast_rows.append({"sector": sec, "year": str(yr),
                                   "projected_share": max(0.0, proj),
                                   "trend_slope": slope,
                                   "r2": r2})

    sector_trends.sort(key=lambda x: -x["slope"])
    growing = [s for s in sector_trends if s["slope"] > 0]
    shrinking = [s for s in sector_trends if s["slope"] <= 0]

    source_id = "nisr_sector"
    

    return {
        "id": str(uuid.uuid4()),
        "question": question,
        "status": "ok",
        "intent": {"metric": "employment_share", "operation": "trend",
                   "periodFrom": min(years), "periodTo": latest_year + FORECAST_YEARS},
        "datasets": {
            "sector_trends": {
                "label": f"National employment share by sector, {min(years)}–{latest_year} (actual + trend)",
                "columns": [
                    {"key": "sector", "label": "Sector", "kind": "category"},
                    {"key": "year", "label": "Year", "kind": "time"},
                    {"key": "actual_share", "label": "Actual share (%)", "kind": "percent", "unit": "%"},
                    {"key": "trend_share", "label": "Trend (fitted)", "kind": "percent", "unit": "%"},
                ],
                "rows": trend_rows,
                "sourceIds": [source_id],
            },
            "sector_forecast": {
                "label": f"Projected employment share by sector, {forecast_years[0]}–{forecast_years[-1]}",
                "columns": [
                    {"key": "sector", "label": "Sector", "kind": "category"},
                    {"key": "year", "label": "Year", "kind": "time"},
                    {"key": "projected_share", "label": "Projected share (%)", "kind": "percent", "unit": "%"},
                    {"key": "trend_slope", "label": "Annual trend (pp/yr)", "kind": "number", "unit": "pp"},
                    {"key": "r2", "label": "Trend R²", "kind": "number"},
                ],
                "rows": forecast_rows,
                "sourceIds": [source_id],
            },
            "sector_ranking": {
                "label": f"Sector growth ranking by trend slope, {min(years)}–{latest_year}",
                "columns": [
                    {"key": "sector", "label": "Sector", "kind": "category"},
                    {"key": "slope", "label": "Trend slope (pp/yr)", "kind": "number", "unit": "pp"},
                    {"key": "r2", "label": "Trend R²", "kind": "number"},
                ],
                "rows": sector_trends,
                "sourceIds": [source_id],
            },
        },
        "metrics": {
            "growing_sectors": {"label": "Sectors with positive trend", "value": len(growing),
                                "unit": "", "decimals": 0, "sourceIds": [source_id]},
            "top_growth_sector": {"label": f"Fastest growing sector slope (pp/yr)",
                                  "value": sector_trends[0]["slope"] if sector_trends else 0,
                                  "unit": "pp/yr", "decimals": 2, "sourceIds": [source_id]},
        },
        "insights": {
            "growth_leaders": {
                "text": f"{len(growing)} of {len(sectors)} sectors show a positive employment share trend. "
                        f"Fastest growing: {', '.join(s['sector'] for s in sector_trends[:3])}.",
                "evidence": ["datasets.sector_ranking"],
            },
            "forecast_caveat": {
                "text": f"Linear projections to {forecast_years[-1]} assume historical trends continue. "
                        f"These are estimates, not predictions. Treat as directional signals only.",
                "evidence": ["datasets.sector_forecast"],
            },
        },
        "formulas": {
            "linear_trend": {
                "label": "Linear trend model",
                "expression": "share(t) = slope × t + intercept",
                "description": "OLS fit of employment share on year for each sector using national district means.",
                "inputs": {"forecast_horizon_years": FORECAST_YEARS},
                "value": float(FORECAST_YEARS),
                "unit": "years",
                "decimals": 0,
            },
        },
        "sources": {
            source_id: {
                "publisher": "NISR",
                "title": "Rwanda LFS — Sector Employment Shares",
                "period": f"{min(years)}–{latest_year}",
                "isSample": False,
            },
        },
        "operations": [
            {"id": "aggregate", "description": f"Aggregated district sector shares to national means across {len(rows)} rows."},
            {"id": "trend_fit", "description": f"Fitted linear OLS trend per sector over {len(years)} years."},
            {"id": "forecast", "description": f"Extrapolated trend {FORECAST_YEARS} years beyond {latest_year}."},
        ],
        "caveats": [
            "Based on aggregated LFS/Establishment Census data.",
            f"Linear extrapolation {FORECAST_YEARS} years forward. Structural breaks, policy changes, or external shocks are not modelled.",
            "Employment share projections do not account for population growth or total employment volume.",
            "Correlation does not imply causation.",
        ],
        "meta": {
            "analysisVersion": ENGINE_VERSION,
            "computedAt": datetime.now(timezone.utc).isoformat(),
            "datasetVersions": {source_id: DATASET_VERSION},
            "isSample": False,
        },
    }
