"""
Problem C - Employment trend forecasting by sector/occupation.
Uses linear trend (OLS on time) per sector with 95% prediction intervals and trend significance tests.
Returns historical trend lines, growth rankings, and a 2-year forward projection with explicit uncertainty bounds.
"""

from __future__ import annotations

import math
import uuid
from collections import defaultdict
from datetime import datetime, timezone

from .loader import IS_SAMPLE_DATA, is_real_available, load_sector_employment

ENGINE_VERSION = "forecasting-2.0.0"
DATASET_VERSION = "2024.1"
FORECAST_YEARS = 2


def _linear_trend_with_intervals(
    years: list[int], values: list[float], future_years: list[int]
):
    """
    Fits simple linear regression y = slope * x + intercept.
    Computes standard error of the slope, t-statistic, and 95% prediction intervals for future projections.
    """
    n = len(years)
    if n < 2:
        return 0.0, values[0] if values else 0.0, 0.0, 0.0, {}

    x_mean = sum(years) / n
    y_mean = sum(values) / n
    ss_xx = sum((years[i] - x_mean) ** 2 for i in range(n))
    ss_xy = sum((years[i] - x_mean) * (values[i] - y_mean) for i in range(n))

    slope = ss_xy / ss_xx if ss_xx > 1e-12 else 0.0
    intercept = y_mean - slope * x_mean
    y_pred = [slope * years[i] + intercept for i in range(n)]

    ss_res = sum((values[i] - y_pred[i]) ** 2 for i in range(n))
    ss_tot = sum((values[i] - y_mean) ** 2 for i in range(n))
    r2 = max(0.0, 1.0 - ss_res / ss_tot) if ss_tot > 1e-12 else 0.0

    # residual variance and slope standard error
    df = max(1, n - 2)
    se_res = math.sqrt(ss_res / df)
    se_slope = se_res / math.sqrt(ss_xx) if ss_xx > 1e-12 else 0.0
    t_stat = slope / se_slope if se_slope > 1e-9 else 0.0

    # t critical value for ~95% confidence with df=4 (n=6): t_crit ≈ 2.571
    t_crit = 2.571 if df <= 4 else 2.0

    future_intervals: dict[int, tuple[float, float, float]] = {}
    for f_yr in future_years:
        proj = slope * f_yr + intercept
        # prediction interval formula: se_res * sqrt(1 + 1/n + (x0 - x_mean)^2 / ss_xx)
        se_pred = se_res * math.sqrt(
            1.0 + 1.0 / n + ((f_yr - x_mean) ** 2) / (ss_xx + 1e-9)
        )
        margin = t_crit * se_pred
        proj_low = max(0.0, round(proj - margin, 2))
        proj_high = max(0.0, round(proj + margin, 2))
        future_intervals[f_yr] = (round(proj, 2), proj_low, proj_high)

    return (
        round(slope, 3),
        round(intercept, 3),
        round(r2, 4),
        round(t_stat, 2),
        future_intervals,
    )


def run(question: str) -> dict:
    real = is_real_available()
    rows = load_sector_employment(real)

    # aggregate national employment share by sector × year
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

    trend_rows = []
    forecast_rows = []
    sector_trends = []

    for sec in sectors:
        y_vals = [nat[sec][yr] for yr in years]
        slope, intercept, r2, t_stat, future_intervals = _linear_trend_with_intervals(
            years, y_vals, forecast_years
        )

        status_text = (
            "Significant growth"
            if t_stat > 2.0
            else "Significant decline"
            if t_stat < -2.0
            else "Stable / no significant trend"
        )

        sector_trends.append(
            {
                "sector": sec,
                "slope": slope,
                "r2": r2,
                "t_statistic": t_stat,
                "status": status_text,
            }
        )

        for yr in years:
            trend_rows.append(
                {
                    "sector": sec,
                    "year": str(yr),
                    "actual_share": nat[sec][yr],
                    "trend_share": round(slope * yr + intercept, 2),
                }
            )

        for yr in forecast_years:
            proj, proj_low, proj_high = future_intervals.get(yr, (0.0, 0.0, 0.0))
            forecast_rows.append(
                {
                    "sector": sec,
                    "year": str(yr),
                    "projected_share": max(0.0, proj),
                    "projected_lower": proj_low,
                    "projected_upper": proj_high,
                    "trend_slope": slope,
                    "r2": r2,
                }
            )

    sector_trends.sort(key=lambda x: -x["slope"])
    growing = [s for s in sector_trends if s["slope"] > 0]
    shrinking = [s for s in sector_trends if s["slope"] <= 0]

    source_id = "nisr_sector"

    return {
        "id": str(uuid.uuid4()),
        "question": question,
        "status": "ok",
        "intent": {
            "metric": "employment_share",
            "operation": "trend",
            "periodFrom": min(years),
            "periodTo": latest_year + FORECAST_YEARS,
        },
        "datasets": {
            "sector_trends": {
                "label": f"National employment share by sector, {min(years)}–{latest_year} (actual + trend)",
                "columns": [
                    {"key": "sector", "label": "Sector", "kind": "category"},
                    {"key": "year", "label": "Year", "kind": "time"},
                    {
                        "key": "actual_share",
                        "label": "Actual share (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "trend_share",
                        "label": "Trend (fitted)",
                        "kind": "percent",
                        "unit": "%",
                    },
                ],
                "rows": trend_rows,
                "sourceIds": [source_id],
            },
            "sector_forecast": {
                "label": f"Projected employment share by sector with 95% intervals, {forecast_years[0]}–{forecast_years[-1]}",
                "columns": [
                    {"key": "sector", "label": "Sector", "kind": "category"},
                    {"key": "year", "label": "Year", "kind": "time"},
                    {
                        "key": "projected_share",
                        "label": "Projected share (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "projected_lower",
                        "label": "95% Lower Bound (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "projected_upper",
                        "label": "95% Upper Bound (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "trend_slope",
                        "label": "Annual trend (pp/yr)",
                        "kind": "number",
                        "unit": "pp",
                    },
                    {"key": "r2", "label": "Trend R²", "kind": "number"},
                ],
                "rows": forecast_rows,
                "sourceIds": [source_id],
            },
            "sector_ranking": {
                "label": f"Sector growth ranking by trend slope, {min(years)}–{latest_year}",
                "columns": [
                    {"key": "sector", "label": "Sector", "kind": "category"},
                    {
                        "key": "slope",
                        "label": "Trend slope (pp/yr)",
                        "kind": "number",
                        "unit": "pp",
                    },
                    {"key": "r2", "label": "Trend R²", "kind": "number"},
                    {"key": "status", "label": "Trend status", "kind": "category"},
                ],
                "rows": sector_trends,
                "sourceIds": [source_id],
            },
        },
        "metrics": {
            "growing_sectors": {
                "label": "Sectors with positive trend",
                "value": len(growing),
                "unit": "",
                "decimals": 0,
                "sourceIds": [source_id],
            },
            "top_growth_sector": {
                "label": "Fastest growing sector slope (pp/yr)",
                "value": sector_trends[0]["slope"] if sector_trends else 0,
                "unit": "pp/yr",
                "decimals": 2,
                "sourceIds": [source_id],
            },
        },
        "insights": {
            "growth_leaders": {
                "text": f"{len(growing)} of {len(sectors)} sectors show a positive employment share trend. "
                f"Fastest growing: {', '.join(s['sector'] for s in sector_trends[:3])}.",
                "evidence": ["datasets.sector_ranking"],
            },
            "forecast_caveat": {
                "text": f"Linear projections to {forecast_years[-1]} include 95% prediction intervals. "
                f"These directional estimates reflect historical trends and carry visible uncertainty margins.",
                "evidence": ["datasets.sector_forecast"],
            },
        },
        "formulas": {
            "linear_trend": {
                "label": "Linear trend model with prediction intervals",
                "expression": "share(t) = slope × t + intercept ± t_crit · SE_pred",
                "description": "OLS fit of employment share on year with 95% prediction intervals per sector.",
                "inputs": {"forecast_horizon_years": FORECAST_YEARS},
                "value": float(FORECAST_YEARS),
                "unit": "years",
                "decimals": 0,
            },
        },
        "sources": {
            source_id: {
                "publisher": "Mboni demo data",
                "title": "LFS-shaped generated sector employment proxy data",
                "period": f"{min(years)}–{latest_year}",
                "isSample": IS_SAMPLE_DATA,
            },
        },
        "operations": [
            {
                "id": "aggregate",
                "description": f"Aggregated district sector shares to national means across {len(rows)} rows.",
            },
            {
                "id": "trend_fit",
                "description": f"Fitted linear OLS trend and slope significance tests over {len(years)} years.",
            },
            {
                "id": "forecast",
                "description": f"Extrapolated trend {FORECAST_YEARS} years forward with 95% prediction intervals.",
            },
        ],
        "caveats": [
            "Demo only: input values are generated proxy data and are not verified NISR observations.",
            "Based on generated proxy data shaped like LFS/Establishment Census indicators.",
            f"Linear extrapolation {FORECAST_YEARS} years forward. Prediction intervals capture trend variance but not structural economic shocks.",
            "Employment share projections do not account for population growth or total employment volume.",
            "Correlation does not imply causation.",
        ],
        "meta": {
            "analysisVersion": ENGINE_VERSION,
            "computedAt": datetime.now(timezone.utc).isoformat(),
            "datasetVersions": {source_id: DATASET_VERSION},
            "isSample": IS_SAMPLE_DATA,
        },
    }
