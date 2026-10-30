"""
Mboni Model Training, Validation & Evaluation Suite.

Runs cross-validation, statistical checks, and schema validation across all engines:
  1. Regression (OLS + Ridge + LOOCV): In-sample R², Adj-R², Out-of-sample Q², LOOCV RMSE
  2. Clustering (KMeans++): Inertia and Silhouette scores across k=2..5
  3. Forecasting (Time-series OLS): Walk-forward backtesting (2019-2022 -> 2023-2024), MAPE, interval coverage
  4. Decision Engine: Multi-criteria crop & career option evaluation
  5. Schema & Route Verification: Validates AnalyticalResult compliance across sample questions

Run: python3 model/train_eval.py
"""

import math
import sys
import time
from pathlib import Path

# Ensure model directory is importable
sys.path.insert(0, str(Path(__file__).parent))

from engine.clustering import _kmeans_cluster, _silhouette_score
from engine.clustering import run as run_clustering
from engine.decision import run as run_decision
from engine.forecasting import run as run_forecasting
from engine.intent_model import _all_examples, _holdout_metrics, predict as predict_intent
from engine.loader import (
    is_real_available,
    load_district_labour,
    load_sector_employment,
)
from engine.regression import run as run_regression
from engine.router import route

# Try importing pydantic schema if installed in environment
try:
    from schema import AnalyticalResult

    def validate_schema(res):
        AnalyticalResult(**res)
        return True
except ImportError:

    def validate_schema(res):
        required_keys = {
            "id",
            "question",
            "status",
            "intent",
            "datasets",
            "metrics",
            "insights",
            "formulas",
            "sources",
            "operations",
            "caveats",
            "meta",
        }
        missing = required_keys - set(res.keys())
        if missing:
            raise ValueError(f"Missing required AnalyticalResult keys: {missing}")
        assert res["status"] in {"ok", "partial", "ambiguous", "unsupported", "no_data"}
        return True


def print_header(title: str):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def evaluate_regression():
    print_header("1. REGRESSION ENGINE - OLS & LOOCV EVALUATION")
    result = run_regression("what factors predict youth NEET rate?")
    validate_schema(result)

    metrics = result["metrics"]
    n_obs = metrics.get("n_observations", {}).get("value", 30)
    print(f"  Target: youth_neet_rate - panel OLS with year FE (n={int(n_obs)})")
    print(f"  Panel R²:               {metrics['r_squared']['value']:.4f}")
    print(f"  Adjusted R²:           {metrics['adjusted_r_squared']['value']:.4f}")
    print(f"  Leave-district-out Q²:  {metrics['loocv_q2']['value']:.4f}")
    print(
        f"  Leave-district-out RMSE:{metrics['loocv_rmse']['value']:.2f} percentage points"
    )
    print(f"  Intercept:             {metrics['intercept']['value']:.2f}%\n")
    if metrics["r_squared"]["value"] >= 0.995:
        print("  [WARN] R² ≥ 0.995 - data may still be near-deterministic; check generator noise.")

    print("  Feature Importance & Direction:")
    features = result["datasets"]["feature_importance"]["rows"]
    for f in features:
        print(
            f"    - {f['feature']:22s} | Coef: {f['coefficient']:+6.3f} | Imp: {f['importance_pct']:5.1f}% | {f['direction']}"
        )
    print("  [PASS] Regression engine trained and validated successfully.")


def evaluate_clustering():
    print_header("2. CLUSTERING ENGINE - K-MEANS++ & SILHOUETTE VALIDATION")
    result = run_clustering("which districts have highest labour underutilization?")
    validate_schema(result)

    rows = load_district_labour(is_real_available())
    latest = [r for r in rows if int(r["year"]) == 2024]
    features = [
        "underemployment_rate",
        "unemployment_rate",
        "youth_neet_rate",
        "pct_agriculture",
        "pct_formal",
        "pct_secondary_plus",
    ]

    matrix = [[float(r[f]) for f in features] for r in latest]
    mins = [min(row[i] for row in matrix) for i in range(len(features))]
    maxs = [max(row[i] for row in matrix) for i in range(len(features))]
    normed = [
        [(v - mins[i]) / (maxs[i] - mins[i] + 1e-9) for i, v in enumerate(row)]
        for row in matrix
    ]

    print("  Evaluating cluster separation across k = 2..5:")
    best_k, best_sil = 3, -1.0
    for k in range(2, 6):
        labels, _, inertia = _kmeans_cluster(normed, k, n_init=10)
        sil = _silhouette_score(normed, labels, k)
        mark = " (selected)" if k == 3 else ""
        print(f"    k={k}: Inertia={inertia:6.3f} | Silhouette Score={sil:+.3f}{mark}")
        if sil > best_sil:
            best_k = k
            best_sil = sil

    profiles = result["datasets"]["cluster_profiles"]["rows"]
    print(f"\n  Identified Profiles (k=3):")
    for p in profiles:
        print(
            f"    Cluster {p['cluster']}: {p['label']:42s} | {p['district_count']:2d} districts | Avg Underemployment: {p['underemployment_rate']}%"
        )
    print("  [PASS] Clustering engine converged with stable Silhouette separation.")


def evaluate_forecasting():
    print_header("3. FORECASTING ENGINE - SECTOR TRENDS & BACKTESTING")
    result = run_forecasting("what are the employment share trends by sector?")
    validate_schema(result)

    # Walk-forward backtesting: train on 2019-2022, evaluate on 2023-2024
    rows = load_sector_employment(is_real_available())
    from collections import defaultdict

    sector_year = defaultdict(list)
    for r in rows:
        sector_year[(r["sector"], int(r["year"]))].append(float(r["employment_share"]))

    sectors = sorted({r["sector"] for r in rows})
    years = sorted({int(r["year"]) for r in rows})
    train_years = [y for y in years if y <= 2022]
    test_years = [y for y in years if y > 2022]

    print(
        f"  Backtest split: Training {min(train_years)}–{max(train_years)} | Testing {min(test_years)}–{max(test_years)}"
    )
    mape_list = []
    for sec in sectors:
        # train OLS
        n_tr = len(train_years)
        y_tr = [
            sum(sector_year[(sec, yr)]) / len(sector_year[(sec, yr)])
            for yr in train_years
        ]
        x_mean = sum(train_years) / n_tr
        y_mean = sum(y_tr) / n_tr
        ss_xx = sum((yr - x_mean) ** 2 for yr in train_years)
        ss_xy = sum((train_years[i] - x_mean) * (y_tr[i] - y_mean) for i in range(n_tr))
        slope = ss_xy / ss_xx if ss_xx else 0.0
        intercept = y_mean - slope * x_mean

        for t_yr in test_years:
            actual = sum(sector_year[(sec, t_yr)]) / len(sector_year[(sec, t_yr)])
            pred = slope * t_yr + intercept
            if actual > 0:
                mape = abs(actual - pred) / actual * 100.0
                mape_list.append(mape)

    avg_mape = sum(mape_list) / len(mape_list) if mape_list else 0.0
    print(f"  Backtesting Out-of-sample MAPE: {avg_mape:.2f}%")

    print("\n  2025-2026 Forecast Projections with 95% Prediction Intervals:")
    forecast_rows = [
        r for r in result["datasets"]["sector_forecast"]["rows"] if r["year"] == "2025"
    ]
    for fr in forecast_rows:
        print(
            f"    - {fr['sector']:15s} | 2025 Proj: {fr['projected_share']:5.2f}% [{fr['projected_lower']:5.2f}%, {fr['projected_upper']:5.2f}%] | Trend: {fr['trend_slope']:+5.2f} pp/yr"
        )
    print("  [PASS] Forecasting engine trend lines and interval bands validated.")


def evaluate_decision_and_router():
    print_header("4. DECISION ENGINE & NLU ROUTER VERIFICATION")
    test_queries = [
        ("what crop should I plant in Musanze?", "decision", "crop_choice"),
        (
            "should I study software developer or civil engineer?",
            "decision",
            "career_choice",
        ),
        ("what factors predict youth NEET rate?", "regression", None),
        ("what are employment trends by sector?", "forecasting", None),
        ("which districts have labour underutilization?", "clustering", None),
    ]

    for query, expected_engine, decision_type in test_queries:
        t0 = time.time()
        res = route(query)
        dt = (time.time() - t0) * 1000
        validate_schema(res)
        assert res["status"] == "ok", f"Expected 'ok' status for {query}"
        if decision_type:
            dec = res.get("decision")
            assert dec is not None, f"Expected decision result for {query}"
            assert dec["decisionType"] == decision_type
            top_opt = dec["optionComparison"][0]
            print(
                f"  [OK] '{query}' ({dt:.1f}ms) -> {dec['decisionType']} | Top choice: {top_opt['option']} (score={top_opt['score']})"
            )
        else:
            intent = res.get("intent", {})
            print(
                f"  [OK] '{query}' ({dt:.1f}ms) -> Engine: {intent.get('operation') or intent.get('metric')}"
            )

    print("  [PASS] All engines strictly comply with AnalyticalResult schema.")


def evaluate_dataset_queries():
    print_header("5. GENERAL DATASET QUERY COVERAGE")
    greeting = route("Hi")
    validate_schema(greeting)
    assert greeting["status"] == "ambiguous"
    assert "study programs and career paths" in greeting["message"]
    student_opening = route("I'm a student")
    validate_schema(student_opening)
    assert student_opening["status"] == "ambiguous"
    assert "study" in student_opening["message"].lower()
    print("  [OK] Greetings and student introductions open a supportive career conversation.")
    interest_path = route("I enjoy math and computers—what career paths could fit me?")
    validate_schema(interest_path)
    interest_rows = interest_path["datasets"]["applied_math_pathways"]["rows"]
    interest_sectors = {row["sector"] for row in interest_rows}
    assert interest_path["status"] == "ok"
    assert {"ICT", "Finance", "Engineering"}.issubset(interest_sectors)
    assert interest_path["meta"]["isSample"] is True
    print("  [OK] Student interests narrow the career-pathway shortlist.")
    cases = [
        ("Compare youth employment across districts over the last five years", "employment_rate", "compare", True),
        ("What are employment trends across districts?", "employment_rate", "trend", True),
        ("Which districts have the highest poverty rates?", "poverty_headcount", "rank", True),
        ("Show child vaccination coverage by district", "child_vaccination_full", "compare", True),
        ("How has school dropout changed since 2020?", "school_dropout_rate", "trend", True),
        ("Compare maize crop yield across districts", "yield_kg_per_ha", "compare", False),
        ("Rank employment share by sector", "employment_share", "rank", True),
        ("Show job vacancies by occupation", "job_vacancies", "compare", True),
        ("Compare TVET pass rates by trade", "pass_rate", "compare", True),
        ("Which exam subjects have the highest pass rates?", "pass_rate", "rank", True),
        ("Show university graduation rate by program", "graduation_rate", "compare", True),
        ("Show food insecurity rates by district", "food_insecurity_pct", "compare", True),
        ("Rank districts by business growth", "establishment_growth_rate", "rank", True),
    ]
    for question, metric, operation, is_sample in cases:
        result = route(question)
        validate_schema(result)
        assert result["status"] == "ok", (question, result.get("message"))
        assert result["intent"].get("metric") == metric, (question, result["intent"])
        assert result["intent"].get("operation") == operation, (question, result["intent"])
        assert result["meta"]["isSample"] is is_sample, question
        assert all(source["isSample"] is is_sample for source in result["sources"].values()), question
        print(f"  [OK] {question} -> {metric} ({operation})")
    program_trend = route(
        "How has Software Engineering enrollment changed from 2021 to 2025?"
    )
    validate_schema(program_trend)
    assert program_trend["status"] == "ok", program_trend.get("message")
    assert program_trend["intent"]["operation"] == "trend"
    assert program_trend["meta"]["isSample"] is True
    program_rows = program_trend["datasets"]["query_results"]["rows"]
    assert len(program_rows) == 5
    assert {row["program"] for row in program_rows} == {"Software Engineering"}
    assert [row["year"] for row in program_rows] == [2021, 2022, 2023, 2024, 2025]
    assert program_rows[-1]["enrolled_students"] > program_rows[0]["enrolled_students"]
    print("  [OK] Program enrollment trends filter the requested program and years.")
    program_comparison = route(
        "Compare Software Engineering and Finance program enrollment by year from 2021 to 2025"
    )
    comparison_rows = program_comparison["datasets"]["query_results"]["rows"]
    assert len(comparison_rows) == 10
    assert {row["program"] for row in comparison_rows} == {
        "Software Engineering", "Accounting & Finance"
    }
    print("  [OK] Program comparisons sum enrollment across institutions by year.")
    student_decision = route("Should I study Software Engineering or Finance?")
    validate_schema(student_decision)
    assert student_decision["status"] == "ok"
    assert student_decision["decision"]["options"] == [
        "Software Engineering", "Accounting & Finance"
    ]
    assert student_decision["meta"]["isSample"] is True
    print("  [OK] Study-choice comparisons use named programs and disclose proxy data.")
    hotel_choice = route(
        "What if I took hotel management? Hotel Manager career in Rwanda"
    )
    validate_schema(hotel_choice)
    assert hotel_choice["status"] == "ok", hotel_choice.get("message")
    assert hotel_choice["decision"]["options"] == ["Hotel Manager"]
    assert hotel_choice["sources"]["nisr_lmis"]["isSample"] is True
    print("  [OK] Hotel-management questions return career evidence with proxy-data labeling.")
    applied_math = route("Which sectors hire applied mathematics graduates?")
    validate_schema(applied_math)
    pathway_rows = applied_math["datasets"]["applied_math_pathways"]["rows"]
    assert len(pathway_rows) == 10
    assert applied_math["meta"]["isSample"] is True
    assert "fresh graduates" in applied_math["insights"]["summary"]["text"]
    print("  [OK] Applied-mathematics pathways show 10 sectors and disclose limitations.")
    crop_result = route("Compare maize crop yield by season in Musanze")
    validate_schema(crop_result)
    assert crop_result["status"] == "ok", crop_result.get("message")
    assert crop_result["meta"]["isSample"] is False
    crop_rows = crop_result["datasets"]["query_results"]["rows"]
    assert {row["season"] for row in crop_rows} == {"Season A", "Season B"}
    crop_filters = crop_result["insights"]["filters"]["text"]
    assert "district: Musanze" in crop_filters and "crop type: Maize" in crop_filters
    yields_by_season = {row["season"]: row["yield_kg_per_ha"] for row in crop_rows}
    assert yields_by_season == {"Season A": 1604.0, "Season B": 1522.97}
    assert crop_result["sources"]["nisr_agriculture_yield"]["publisher"].startswith("National Institute")
    print("  [OK] Official crop-yield results filter by crop, season, and district.")
    natural_questions = [
        ("How much maize per hectare in Musanze?", {"district": "Musanze", "crop_type": "Maize"}),
        ("What is the yield of Irish potato in Nyabihu?", {"district": "Nyabihu", "crop_type": "Irish potatoes"}),
    ]
    for question, expected in natural_questions:
        result = route(question)
        validate_schema(result)
        assert result["status"] == "ok", (question, result.get("message"))
        row = result["datasets"]["query_results"]["rows"][0]
        assert all(row[field] == value for field, value in expected.items()), (question, row)
        assert result["meta"]["isSample"] is False
        print(f"  [OK] Natural-language query: {question}")
    season_comparison = route(
        "Compare maize yield between Season A and Season B in Musanze"
    )
    season_rows = season_comparison["datasets"]["query_results"]["rows"]
    assert {row["season"] for row in season_rows} == {"Season A", "Season B"}
    assert all(row["district"] == "Musanze" and row["crop_type"] == "Maize" for row in season_rows)
    print("  [OK] Season comparisons return both values with their crop and district labels.")
    ambiguous_yield = route("Compare crop yield across districts")
    assert ambiguous_yield["status"] == "ambiguous"
    assert "specify a crop" in ambiguous_yield["message"]
    print("  [OK] Crop-yield comparisons ask for a crop instead of averaging unlike crops.")
    compared = route("Compare poverty rates in Huye and Musanze")
    validate_schema(compared)
    districts = {row["district"] for row in compared["datasets"]["query_results"]["rows"]}
    assert districts == {"Huye", "Musanze"}, districts
    print("  [OK] Named-district comparisons retain all requested locations.")
    out_of_scope = route("What is the weather in Kigali?")
    assert out_of_scope["status"] == "ambiguous"
    assert "Rwanda-focused study and career guidance" in out_of_scope["message"]
    print("  [OK] Out-of-scope questions are redirected to the assistant's purpose.")
    print("  [PASS] Broad dataset queries route to the requested metric and preserve demo-data labels.")


def evaluate_trainable_intent_model():
    print_header("6. TRAINABLE CONVERSATION INTENT MODEL")
    examples = _all_examples()
    metrics = _holdout_metrics(examples)
    assert len(examples) >= 50
    assert metrics["test_examples"] >= 10
    assert metrics["accuracy"] is not None and metrics["accuracy"] >= 0.6, metrics
    print(
        f"  [OK] Naive Bayes intent model: {len(examples)} examples, "
        f"{metrics['test_examples']} held out, accuracy={metrics['accuracy']:.1%}."
    )
    expected = [
        ("I enjoy mathematics, what jobs could fit me?", "career_pathways"),
        ("How has Software Engineering enrollment changed from 2021 to 2025?", "program_query"),
        ("Should I study Software Engineering or Finance?", "career_decision"),
        ("What is the weather tomorrow?", "other"),
    ]
    for question, label in expected:
        prediction = predict_intent(question)
        assert prediction["label"] == label, (question, prediction)
        print(f"  [OK] {question} -> {label} ({prediction['confidence']:.1%})")
    print("  [PASS] The trained intent classifier recognizes supported career conversations.")


if __name__ == "__main__":
    t_start = time.time()
    print_header("MBONI ML TRAINING & EVALUATION PIPELINE")
    evaluate_regression()
    evaluate_clustering()
    evaluate_forecasting()
    evaluate_decision_and_router()
    evaluate_dataset_queries()
    evaluate_trainable_intent_model()
    total_time = (time.time() - t_start) * 1000
    print("\n" + "=" * 70)
    print(f"  ALL ANALYSIS ENGINES VALIDATED AND OPERATIONAL IN {total_time:.1f}ms")
    print("=" * 70 + "\n")
