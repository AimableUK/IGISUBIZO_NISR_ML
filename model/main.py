"""
FastAPI model service - single POST /analyze endpoint.
Receives an AnalyzeRequest, routes to the correct ML engine, returns AnalyticalResult.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

from schema import AnalyzeRequest, AnalyticalResult
from engine.router import route

app = FastAPI(title="Mboni Model Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("API_URL", "http://localhost:4000")],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyticalResult)
def analyze(req: AnalyzeRequest):
    if len(req.question.strip()) < 3:
        raise HTTPException(status_code=422, detail="Question too short.")
    try:
        result = route(req.question)
        return AnalyticalResult(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
