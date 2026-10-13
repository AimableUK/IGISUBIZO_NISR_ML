"""
Intent router — maps a question to the right engine via the NLU parser.
"""
from .nlu import parse_intent

def route(question: str) -> dict:
    from .decision import run as decision_run
    from .clustering import run as cluster_run
    from .regression import run as regression_run
    from .forecasting import run as forecast_run

    intent = parse_intent(question)
    engine = intent["engine"]

    if engine == "ambiguous":
        return {"status": "ambiguous", "message": intent["understood"]}
    if engine == "decision":
        return decision_run(question)
    if engine == "regression":
        return regression_run(question)
    if engine == "forecasting":
        return forecast_run(question)
    if engine == "career":
        return decision_run(question)   # career choice is a decision
    return cluster_run(question)
