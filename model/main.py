"""
FastAPI model service - single POST /analyze endpoint.
Receives an AnalyzeRequest, routes to the correct ML engine, returns AnalyticalResult.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal
import os

from schema import AnalyzeRequest, AnalyticalResult
from engine.intent_model import append_examples, status as training_status, train as train_intents
from engine.router import route

app = FastAPI(title="Mboni Model Service", version="1.0.0")

IntentLabel = Literal[
    "greeting",
    "student_intro",
    "program_query",
    "career_pathways",
    "career_decision",
    "data_query",
    "other",
]


class IntentExample(BaseModel):
    text: str = Field(min_length=3, max_length=500)
    label: IntentLabel


class IntentExamplesRequest(BaseModel):
    examples: list[IntentExample] = Field(min_length=1, max_length=200)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("API_URL", "http://localhost:4000")],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/admin/training")
def get_training_status():
    return training_status()


@app.post("/admin/training/examples")
def add_training_examples(req: IntentExamplesRequest):
    try:
        count = append_examples([item.model_dump() for item in req.examples])
        return {"ok": True, "example_count": count, "label_counts": training_status()["label_counts"]}
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/admin/training/train")
def train_intent_model():
    try:
        return {"ok": True, **train_intents()}
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/analyze", response_model=AnalyticalResult)
def analyze(req: AnalyzeRequest):
    if len(req.question.strip()) < 3:
        raise HTTPException(status_code=422, detail="Question too short.")
    try:
        result = route(req.question)
        return AnalyticalResult(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
