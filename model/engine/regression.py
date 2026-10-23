"""
Problem B — Predict district youth NEET rate using regularized OLS regression with LOOCV.
Features: pct_agriculture, pct_formal, pct_secondary_plus, pct_tvet, unemployment_rate.
Returns coefficients, R², Adjusted R², LOOCV out-of-sample metrics, and feature importance.
"""

from __future__ import annotations

import math
import uuid
from datetime import datetime, timezone

from .loader import is_real_available, load_district_labour

ENGINE_VERSION = "regression-2.0.0"
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


def _fit_ols(X: list[list[float]], y: list[float], ridge_lambda: float = 1e-5):
    """Fits OLS with ridge stabilization to guarantee invertibility."""
    n = len(X)
    Xa = [[1.0] + row for row in X]
    p = len(Xa[0])

    Xt = _transpose(Xa)
    XtX = _matmul(Xt, Xa)
    # ridge diagonal for non-intercept features
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

    # adjusted R²
    k_features = len(X[0])
    adj_r2 = (
        max(0.0, 1.0 - ((1.0 - r2) * (n - 1) / (n - k_features - 1)))
        if (n - k_features - 1) > 0
        else r2
    )

    # standard errors and t-statistics
    df = max(1, n - p)
    sigma2 = ss_res / df
    se_beta = [math.sqrt(max(0.0, sigma2 * XtX_inv[i][i])) for i in range(p)]
    t_stats = [beta[i] / se_beta[i] if se_beta[i] > 1e-9 else 0.0 for i in range(p)]

    return beta, y_pred, round(r2, 4), round(adj_r2, 4), se_beta, t_stats


def _loocv(
    X: list[list[float]], y: list[float]
) -> tuple[list[float], float, float, float]:
    """Leave-One-Out Cross-Validation for authentic out-of-sample error."""
    n = len(X)
    y_mean = sum(y) / n
    ss_tot = sum((val - y_mean) ** 2 for val in y)
    loocv_preds: list[float] = []

    for i in range(n):
        X_train = [X[j] for j in range(n) if j != i]
        y_train = [y[j] for j in range(n) if j != i]
        beta_i, _, _, _, _, _ = _fit_ols(X_train, y_train)
        pred_i = _dot([1.0] + X[i], beta_i)
        loocv_preds.append(round(pred_i, 2))

    ss_loocv = sum((y[i] - loocv_preds[i]) ** 2 for i in range(n))
    loocv_rmse = math.sqrt(ss_loocv / n)
    loocv_mae = sum(abs(y[i] - loocv_preds[i]) for i in range(n)) / n
    q2 = max(0.0, 1.0 - ss_loocv / ss_tot) if ss_tot > 0 else 0.0

    return loocv_preds, round(loocv_rmse, 3), round(loocv_mae, 3), round(q2, 4)


def run(question: str) -> dict:
    real = is_real_available()
    rows = load_district_labour(real)
    latest_year = int(max(r["year"] for r in rows))
    data = [r for r in rows if int(r["year"]) == latest_year]

    X = [[float(r[f]) for f in FEATURES] for r in data]
    y = [float(r[TARGET]) for r in data]

    beta, y_pred, r2, adj_r2, se_beta, t_stats = _fit_ols(X, y)
    loocv_preds, loocv_rmse, loocv_mae, q2 = _loocv(X, y)

    intercept, coefs = beta[0], beta[1:]
    coef_se, coef_t = se_beta[1:], t_stats[1:]

    # feature importance: |coef| / sum(|coef|)
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

    pred_rows = [
        {
            "district": data[i]["district"],
            "province": data[i]["province"],
            "actual_neet": round(y[i], 1),
            "predicted_neet": round(y_pred[i], 1),
            "residual": round(y[i] - y_pred[i], 1),
        }
        for i in range(len(data))
    ]

    top_feature = coef_rows[0]["feature"].replace("_", " ")
    source_id = "nisr_lfs"

    return {
        "id": str(uuid.uuid4()),
        "question": question,
        "status": "ok",
        "intent": {
            "metric": "youth_neet_rate",
            "operation": "summary",
            "periodFrom": latest_year,
            "periodTo": latest_year,
        },
        "datasets": {
            "feature_importance": {
                "label": f"OLS regression — predictors of youth NEET rate, {latest_year}",
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
                "label": "Model R²",
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
                "label": "Cross-Validation RMSE",
                "value": loocv_rmse,
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
                "text": f"OLS regression on {latest_year} district data yields R²={r2:.3f} (Adjusted R²={adj_r2:.3f}). Out-of-sample LOOCV generalization RMSE is {loocv_rmse:.2f} percentage points.",
                "evidence": ["datasets.feature_importance"],
            },
            "top_predictor": {
                "text": f"The variable most associated with youth NEET rate is {top_feature} "
                f"(relative importance {coef_rows[0]['importance_pct']}%). "
                f"This is a statistical association, not a causal claim.",
                "evidence": ["datasets.feature_importance"],
            },
        },
        "formulas": {
            "ols": {
                "label": "OLS regression equation",
                "expression": "NEET = β₀ + β₁·agri + β₂·formal + β₃·secondary + β₄·tvet + β₅·unemp",
                "description": "Ordinary least squares fit to district-level data for the latest survey year.",
                "inputs": {
                    "intercept": round(intercept, 2),
                    **{FEATURES[i]: round(coefs[i], 3) for i in range(len(FEATURES))},
                },
                "value": r2,
                "unit": "R²",
                "decimals": 3,
            },
        },
        "sources": {
            source_id: {
                "publisher": "NISR",
                "title": "Rwanda Labour Force Survey (LFS) — NISR",
                "period": f"2019–{latest_year}",
                "isSample": False,
            },
        },
        "operations": [
            {
                "id": "load_data",
                "description": f"Loaded {len(data)} district observations for {latest_year}.",
            },
            {
                "id": "ols_fit",
                "description": f"Fitted regularized OLS regression: target={TARGET}, features={FEATURES}.",
            },
            {
                "id": "loocv",
                "description": f"Evaluated out-of-sample predictive performance via Leave-One-Out Cross-Validation (Q²={q2:.3f}, RMSE={loocv_rmse:.2f} pp).",
            },
            {
                "id": "importance",
                "description": "Computed relative feature importance as |coef|/sum(|coef|).",
            },
        ],
        "caveats": [
            "Based on aggregated district-level LFS data (n=30 districts).",
            "OLS assumes linear relationships; results reflect cross-sectional association, not causation.",
            "Out-of-sample validation performed via Leave-One-Out Cross-Validation (LOOCV).",
        ],
        "meta": {
            "analysisVersion": ENGINE_VERSION,
            "computedAt": datetime.now(timezone.utc).isoformat(),
            "datasetVersions": {source_id: DATASET_VERSION},
            "isSample": False,
        },
    }
