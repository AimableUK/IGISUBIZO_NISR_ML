"""
Intent router — maps a question to the right engine via the NLU parser.
"""
import uuid
from datetime import datetime, timezone

from .loader import IS_SAMPLE_DATA
from .nlu import parse_intent


def _shell(question: str, status: str, message: str) -> dict:
    """Minimal AnalyticalResult-shaped payload for non-ok statuses."""
    return {
        "id": str(uuid.uuid4()),
        "question": question,
        "status": status,
        "message": message,
        "intent": {},
        "decision": None,
        "datasets": {},
        "metrics": {},
        "insights": {},
        "formulas": {},
        "sources": {},
        "operations": [{"id": "route", "description": message[:400]}],
        "caveats": [],
        "meta": {
            "analysisVersion": "router-1.0.0",
            "computedAt": datetime.now(timezone.utc).isoformat(),
            "datasetVersions": {},
            "isSample": IS_SAMPLE_DATA,
        },
    }


def route(question: str) -> dict:
    from .clustering import run as cluster_run
    from .career_pathways import run as career_pathways_run
    from .decision import run as decision_run
    from .data_query import run as data_query_run
    from .forecasting import run as forecast_run
    from .regression import run as regression_run

    intent = parse_intent(question)
    engine = intent["engine"]

    if engine == "ambiguous":
        return _shell(question, "ambiguous", intent["understood"])
    if engine == "conversation":
        return _shell(question, "ambiguous", intent["understood"])
    if engine == "decision":
        return decision_run(question)
    if engine == "regression":
        return regression_run(question)
    if engine == "forecasting":
        return forecast_run(question)
    if engine == "career":
        return decision_run(question)  # career choice is a decision
    if engine == "career_pathways":
        return career_pathways_run(question)
    if engine == "clustering":
        return cluster_run(question)
    if engine == "data_query":
        return data_query_run(question)
    return data_query_run(question)
