"""
Problem B - Predict district youth NEET rate using panel OLS with year fixed effects.

Uses all district×year observations (not latest year only), ridge-stabilized OLS,
and leave-one-district-out cross-validation for out-of-sample Q².
"""

from __future__ import annotations

import math
import uuid
from datetime import datetime, timezone

from .loader import IS_SAMPLE_DATA, is_real_available, load_district_labour

ENGINE_VERSION = "regression-2.1.0"
DATASET_VERSION = "2024.1"

TARGET = "youth_neet_rate"
FEATURES = [
    "pct_agriculture",
    "pct_formal",
    "pct_secondary_plus",
    "pct_tvet",
    "unemployment_rate",
]


def _dot(a: list[float], b: list[float]) -> float:
    return sum(a[i] * b[i] for i in range(len(a)))


def _matmul(A: list[list[float]], B: list[list[float]]) -> list[list[float]]:
    rows, cols, inner = len(A), len(B[0]), len(B)
    return [
        [sum(A[r][k] * B[k][c] for k in range(inner)) for c in range(cols)]
        for r in range(rows)
    ]


def _transpose(A: list[list[float]]) -> list[list[float]]:
    return [[A[r][c] for r in range(len(A))] for c in range(len(A[0]))]


def _inv(M: list[list[float]]) -> list[list[float]]:
    """Gauss-Jordan inversion with partial pivoting."""
    n = len(M)
    aug = [M[i][:] + [1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(aug[r][col]))
        aug[col], aug[pivot] = aug[pivot], aug[col]
        f = aug[col][col]
        if abs(f) < 1e-12:
            raise ValueError("Singular matrix")
        aug[col] = [v / f for v in aug[col]]
        for r in range(n):
            if r != col:
                factor = aug[r][col]
                aug[r] = [aug[r][j] - factor * aug[col][j] for j in range(2 * n)]
    return [row[n:] for row in aug]


def _fit_ols(X: list[list[float]], y: list[float], ridge_lambda: float = 1e-4):
    """Fits OLS with ridge stabilization to guarantee invertibility."""
    n = len(X)
    Xa = [[1.0] + row for row in X]
    p = len(Xa[0])

    Xt = _transpose(Xa)
    XtX = _matmul(Xt, Xa)
    for j in range(1, p):
        XtX[j][j] += ridge_lambda

    Xty = [_dot(Xt[i], y) for i in range(p)]
    XtX_inv = _inv(XtX)
    beta = [_dot(XtX_inv[i], Xty) for i in range(p)]

    y_pred = [_dot(Xa[i], beta) for i in range(n)]
    y_mean = sum(y) / n
    ss_res = sum((y[i] - y_pred[i]) ** 2 for i in range(n))
    ss_tot = sum((y[i] - y_mean) ** 2 for i in range(n))
    r2 = max(0.0, 1.0 - ss_res / ss_tot) if ss_tot > 0 else 0.0

    k_features = len(X[0])
    adj_r2 = (
        max(0.0, 1.0 - ((1.0 - r2) * (n - 1) / (n - k_features - 1)))
        if (n - k_features - 1) > 0
        else r2
    )

    df = max(1, n - p)
    sigma2 = ss_res / df
    se_beta = [math.sqrt(max(0.0, sigma2 * XtX_inv[i][i])) for i in range(p)]
    t_stats = [beta[i] / se_beta[i] if se_beta[i] > 1e-9 else 0.0 for i in range(p)]

    return beta, y_pred, round(r2, 4), round(adj_r2, 4), se_beta, t_stats


def _year_dummies(
    years: list[int], year_levels: list[int]
) -> tuple[list[list[float]], list[str]]:
    """Omit first year as baseline."""
    dummies_levels = year_levels[1:]
    out = [[1.0 if yr == lvl else 0.0 for lvl in dummies_levels] for yr in years]
    return out, [f"year_{lvl}" for lvl in dummies_levels]


def _lodo_cv(
    X: list[list[float]], y: list[float], districts: list[str]
) -> tuple[list[float], float, float, float]:
    """Leave-One-District-Out CV - all years for a held-out district."""
    n = len(X)
    y_mean = sum(y) / n
    ss_tot = sum((val - y_mean) ** 2 for val in y)
    preds = [0.0] * n
    unique = sorted(set(districts))

    for held in unique:
        train_idx = [i for i in range(n) if districts[i] != held]
        test_idx = [i for i in range(n) if districts[i] == held]
        X_train = [X[i] for i in train_idx]
        y_train = [y[i] for i in train_idx]
        beta_i, _, _, _, _, _ = _fit_ols(X_train, y_train)
        for i in test_idx:
            preds[i] = _dot([1.0] + X[i], beta_i)

    ss_cv = sum((y[i] - preds[i]) ** 2 for i in range(n))
    rmse = math.sqrt(ss_cv / n)
    mae = sum(abs(y[i] - preds[i]) for i in range(n)) / n
    q2 = max(0.0, 1.0 - ss_cv / ss_tot) if ss_tot > 0 else 0.0
    return [round(p, 2) for p in preds], round(rmse, 3), round(mae, 3), round(q2, 4)


def run(question: str) -> dict:
    real = is_real_available()
    rows = load_district_labour(real)
    years_all = sorted({int(r["year"]) for r in rows})
    latest_year = years_all[-1]

    # Panel: all district × year rows
    data = sorted(rows, key=lambda r: (r["district"], int(r["year"])))
    districts = [r["district"] for r in data]
    years = [int(r["year"]) for r in data]
    y = [float(r[TARGET]) for r in data]

    year_dum, year_names = _year_dummies(years, years_all)
    X_base = [[float(r[f]) for f in FEATURES] for r in data]
    X = [X_base[i] + year_dum[i] for i in range(len(data))]

    beta, y_pred, r2, adj_r2, se_beta, t_stats = _fit_ols(X, y)
    cv_preds, cv_rmse, cv_mae, q2 = _lodo_cv(X, y, districts)

    intercept, coefs = beta[0], beta[1 : 1 + len(FEATURES)]
    year_coefs = beta[1 + len(FEATURES) :]

    abs_coefs = [abs(c) for c in coefs]
    total = sum(abs_coefs) or 1.0
    importance = [round(v / total * 100, 1) for v in abs_coefs]

    coef_rows = [
        {
            "feature": FEATURES[i],
            "coefficient": round(coefs[i], 3),
            "importance_pct": importance[i],
            "direction": "increases NEET" if coefs[i] > 0 else "decreases NEET",
        }
        for i in range(len(FEATURES))
    ]
    coef_rows.sort(key=lambda r: -r["importance_pct"])

    # Latest-year actual vs predicted for map/table readability
    latest_idx = [i for i, yr in enumerate(years) if yr == latest_year]
    pred_rows = [
        {
            "district": data[i]["district"],
            "province": data[i]["province"],
            "actual_neet": round(y[i], 1),
            "predicted_neet": round(y_pred[i], 1),
            "residual": round(y[i] - y_pred[i], 1),
        }
        for i in latest_idx
    ]

    top_feature = coef_rows[0]["feature"].replace("_", " ")
    source_id = "nisr_lfs"
    n_obs = len(data)
    n_districts = len(set(districts))

    return {
        "id": str(uuid.uuid4()),
        "question": question,
        "status": "ok",
        "intent": {
            "metric": "youth_neet_rate",
            "operation": "summary",
            "periodFrom": years_all[0],
            "periodTo": latest_year,
        },
        "datasets": {
            "feature_importance": {
                "label": f"Panel OLS - predictors of youth NEET rate ({years_all[0]}–{latest_year})",
                "columns": [
                    {"key": "feature", "label": "Feature", "kind": "category"},
                    {"key": "coefficient", "label": "Coefficient", "kind": "number"},
                    {
                        "key": "importance_pct",
                        "label": "Relative importance (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {"key": "direction", "label": "Direction", "kind": "category"},
                ],
                "rows": coef_rows,
                "sourceIds": [source_id],
            },
            "predictions": {
                "label": f"Actual vs predicted youth NEET rate by district, {latest_year}",
                "columns": [
                    {"key": "district", "label": "District", "kind": "geo"},
                    {"key": "province", "label": "Province", "kind": "category"},
                    {
                        "key": "actual_neet",
                        "label": "Actual NEET (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "predicted_neet",
                        "label": "Predicted NEET (%)",
                        "kind": "percent",
                        "unit": "%",
                    },
                    {
                        "key": "residual",
                        "label": "Residual (pp)",
                        "kind": "number",
                        "unit": "pp",
                    },
                ],
                "rows": pred_rows,
                "sourceIds": [source_id],
            },
        },
        "metrics": {
            "r_squared": {
                "label": "Panel R²",
                "value": r2,
                "unit": "",
                "decimals": 3,
                "sourceIds": [source_id],
            },
            "adjusted_r_squared": {
                "label": "Adjusted R²",
                "value": adj_r2,
                "unit": "",
                "decimals": 3,
                "sourceIds": [source_id],
            },
            "loocv_rmse": {
                "label": "Leave-district-out RMSE",
                "value": cv_rmse,
                "unit": "pp",
                "decimals": 2,
                "sourceIds": [source_id],
            },
            "loocv_q2": {
                "label": "Out-of-sample Q²",
                "value": q2,
                "unit": "",
                "decimals": 3,
                "sourceIds": [source_id],
            },
            "n_observations": {
                "label": "Panel observations",
                "value": float(n_obs),
                "unit": "",
                "decimals": 0,
                "sourceIds": [source_id],
            },
            "intercept": {
                "label": "Intercept",
                "value": round(intercept, 2),
                "unit": "%",
                "decimals": 2,
                "sourceIds": [source_id],
            },
        },
        "insights": {
            "model_fit": {
                "text": (
                    f"Panel OLS on {n_obs} district×year observations "
                    f"({n_districts} districts, {len(years_all)} years) with year fixed effects "
                    f"yields R²={r2:.3f} (Adjusted R²={adj_r2:.3f}). "
                    f"Leave-one-district-out RMSE is {cv_rmse:.2f} percentage points (Q²={q2:.3f})."
                ),
                "evidence": ["datasets.feature_importance"],
            },
            "top_predictor": {
                "text": (
                    f"The variable most associated with youth NEET rate is {top_feature} "
                    f"(relative importance {coef_rows[0]['importance_pct']}%). "
                    f"This is a statistical association, not a causal claim."
                ),
                "evidence": ["datasets.feature_importance"],
            },
        },
        "formulas": {
            "ols": {
                "label": "Panel OLS with year FE",
                "expression": "NEET = β₀ + β·X + Σ γ_t·Year_t + ε",
                "description": (
                    "Ordinary least squares on district×year panel; year dummies absorb "
                    "common national shocks. Substantive coefficients below."
                ),
                "inputs": {
                    "intercept": round(intercept, 2),
                    **{FEATURES[i]: round(coefs[i], 3) for i in range(len(FEATURES))},
                    **{
                        year_names[i]: round(year_coefs[i], 3)
                        for i in range(len(year_names))
                    },
                },
                "value": r2,
                "unit": "R²",
                "decimals": 3,
            },
        },
        "sources": {
            source_id: {
                "publisher": "Mboni demo data",
                "title": "LFS-shaped generated district labour proxy data",
                "period": f"{years_all[0]}–{latest_year}",
                "isSample": IS_SAMPLE_DATA,
            },
        },
        "operations": [
            {
                "id": "load_data",
                "description": f"Loaded {n_obs} district×year observations ({years_all[0]}–{latest_year}).",
            },
            {
                "id": "ols_fit",
                "description": (
                    f"Fitted panel OLS with year fixed effects: target={TARGET}, "
                    f"features={FEATURES}."
                ),
            },
            {
                "id": "lodo_cv",
                "description": (
                    f"Leave-one-district-out CV: Q²={q2:.3f}, RMSE={cv_rmse:.2f} pp."
                ),
            },
            {
                "id": "importance",
                "description": "Relative importance on substantive coefficients only (|β|/Σ|β|).",
            },
        ],
        "caveats": [
            "Demo only: input values are generated proxy data and are not verified NISR observations.",
            f"Panel of {n_obs} observations ({n_districts} districts × {len(years_all)} years).",
            "Year fixed effects absorb national time shocks; coefficients are within-year associations.",
            "OLS assumes linear relationships; results reflect association, not causation.",
            "Out-of-sample validation: leave-one-district-out (all years of a district held out).",
        ],
        "meta": {
            "analysisVersion": ENGINE_VERSION,
            "computedAt": datetime.now(timezone.utc).isoformat(),
            "datasetVersions": {source_id: DATASET_VERSION},
            "isSample": IS_SAMPLE_DATA,
        },
    }
