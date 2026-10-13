"""
Pydantic schemas matching the AnalyticalResult Zod contract in api/src/shared/analytical.ts
The API expects this exact shape — do not rename top-level keys.
"""
from __future__ import annotations
from typing import Any, Literal, Optional
from pydantic import BaseModel


class Column(BaseModel):
    key: str
    label: str
    kind: Literal["category", "time", "number", "percent", "geo"]
    unit: Optional[str] = None


class Dataset(BaseModel):
    label: str
    columns: list[Column]
    rows: list[dict[str, Any]]
    sourceIds: list[str] = []


class Delta(BaseModel):
    label: str
    value: float


class Metric(BaseModel):
    label: str
    value: float
    unit: str = ""
    decimals: int = 1
    delta: Optional[Delta] = None
    sourceIds: list[str] = []


class Insight(BaseModel):
    text: str
    evidence: list[str] = []


class Formula(BaseModel):
    label: str
    expression: str
    description: str
    inputs: dict[str, float]
    value: float
    unit: str = ""
    decimals: int = 1


class Source(BaseModel):
    publisher: str
    title: str
    period: str
    file: Optional[str] = None
    url: Optional[str] = None
    licence: Optional[str] = None
    isSample: bool


class Operation(BaseModel):
    id: str
    description: str


class Intent(BaseModel):
    metric: Optional[str] = None
    operation: Optional[Literal["compare", "trend", "rank", "summary"]] = None
    geography: Optional[str] = None
    periodFrom: Optional[int] = None
    periodTo: Optional[int] = None


class Meta(BaseModel):
    analysisVersion: str
    computedAt: str
    datasetVersions: dict[str, str]
    isSample: bool


class AnalyticalResult(BaseModel):
    id: str
    question: str
    status: Literal["ok", "partial", "ambiguous", "unsupported", "no_data"]
    message: Optional[str] = None
    intent: Intent
    datasets: dict[str, Dataset]
    metrics: dict[str, Metric]
    insights: dict[str, Insight]
    formulas: dict[str, Formula]
    sources: dict[str, Source]
    operations: list[Operation]
    caveats: list[str]
    meta: Meta


class AnalyzeRequest(BaseModel):
    question: str
    requestId: str
