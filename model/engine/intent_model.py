"""Small trainable Naive Bayes classifier for career-assistant conversation intents."""
from __future__ import annotations

import json
import math
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ENGINE_DIR = Path(__file__).resolve().parent
SEED_PATH = ENGINE_DIR / "intent_seed.jsonl"
TRAINING_DIR = ENGINE_DIR.parent / "data" / "training"
EXAMPLES_PATH = TRAINING_DIR / "examples.jsonl"
ARTIFACT_PATH = TRAINING_DIR / "intent_model.json"
MODEL_VERSION = "intent-nb-1.0.0"
LABELS = {
    "greeting",
    "student_intro",
    "program_query",
    "career_pathways",
    "career_decision",
    "data_query",
    "other",
}


def _tokens(text: str) -> list[str]:
    words = re.findall(r"[a-z0-9]+", text.lower())
    return words + [f"{left}_{right}" for left, right in zip(words, words[1:])]


def _read_examples(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    examples = []
    with path.open(encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, 1):
            if not line.strip():
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path.name}:{line_number} is not valid JSON.") from exc
            if not isinstance(item, dict):
                raise ValueError(f"{path.name}:{line_number} must be a JSON object.")
            text = item.get("text")
            label = item.get("label")
            if not isinstance(text, str) or not text.strip():
                raise ValueError(f"{path.name}:{line_number} has no example text.")
            if label not in LABELS:
                raise ValueError(f"{path.name}:{line_number} has an unsupported label.")
            examples.append({"text": text.strip(), "label": label})
    return examples


def _all_examples() -> list[dict[str, str]]:
    return _read_examples(SEED_PATH) + _read_examples(EXAMPLES_PATH)


def _fit(examples: list[dict[str, str]]) -> dict:
    labels = sorted({item["label"] for item in examples})
    document_counts = Counter(item["label"] for item in examples)
    token_counts: dict[str, Counter] = defaultdict(Counter)
    token_totals = Counter()
    vocabulary: set[str] = set()
    for item in examples:
        features = _tokens(item["text"])
        token_counts[item["label"]].update(features)
        token_totals[item["label"]] += len(features)
        vocabulary.update(features)
    return {
        "version": MODEL_VERSION,
        "labels": labels,
        "document_counts": dict(document_counts),
        "token_counts": {label: dict(token_counts[label]) for label in labels},
        "token_totals": dict(token_totals),
        "vocabulary": sorted(vocabulary),
        "example_count": len(examples),
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }


def _predict(model: dict, text: str) -> dict:
    labels = model["labels"]
    vocabulary_size = max(len(model["vocabulary"]), 1)
    total_documents = sum(model["document_counts"].values())
    features = _tokens(text)
    scores = {}
    for label in labels:
        prior = (model["document_counts"][label] + 1) / (
            total_documents + len(labels)
        )
        score = math.log(prior)
        denominator = model["token_totals"][label] + vocabulary_size
        token_counts = model["token_counts"][label]
        for token in features:
            score += math.log((token_counts.get(token, 0) + 1) / denominator)
        scores[label] = score
    max_score = max(scores.values())
    probabilities = {
        label: math.exp(value - max_score) for label, value in scores.items()
    }
    normalizer = sum(probabilities.values())
    label = max(scores, key=scores.get)
    return {
        "label": label,
        "confidence": round(probabilities[label] / normalizer, 4),
        "scores": {
            key: round(value / normalizer, 4)
            for key, value in sorted(
                probabilities.items(), key=lambda item: item[1], reverse=True
            )
        },
    }


def predict(text: str) -> dict:
    if ARTIFACT_PATH.is_file():
        with ARTIFACT_PATH.open(encoding="utf-8") as handle:
            model = json.load(handle)
    else:
        examples = _all_examples()
        if not examples:
            raise RuntimeError("No intent training examples are available.")
        model = _fit(examples)
    return _predict(model, text)


def append_examples(examples: list[dict[str, str]]) -> int:
    TRAINING_DIR.mkdir(parents=True, exist_ok=True)
    known = {
        (item["text"].casefold(), item["label"])
        for item in _all_examples()
    }
    additions = []
    for item in examples:
        text = item["text"].strip()
        label = item["label"]
        if not text or len(text) > 500:
            raise ValueError("Training examples must contain 1–500 characters.")
        if label not in LABELS:
            raise ValueError(f"Unsupported intent label: {label}")
        key = (text.casefold(), label)
        if key not in known:
            additions.append({"text": text, "label": label})
            known.add(key)
    with EXAMPLES_PATH.open("a", encoding="utf-8") as handle:
        for item in additions:
            handle.write(json.dumps(item, ensure_ascii=False) + "\n")
    return len(_all_examples())


def _holdout_metrics(examples: list[dict[str, str]]) -> dict:
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for item in examples:
        grouped[item["label"]].append(item)
    training = []
    testing = []
    for label, items in grouped.items():
        if len(items) < 2:
            raise ValueError(
                f"Intent '{label}' needs at least 2 examples before training."
            )
        test_indexes = set(range(4, len(items), 5)) if len(items) >= 5 else set()
        if not test_indexes:
            test_indexes = {len(items) - 1}
        testing.extend(item for index, item in enumerate(items) if index in test_indexes)
        training.extend(item for index, item in enumerate(items) if index not in test_indexes)
    model = _fit(training)
    correct = sum(
        _predict(model, item["text"])["label"] == item["label"] for item in testing
    )
    return {
        "test_examples": len(testing),
        "accuracy": round(correct / len(testing), 4) if testing else None,
        "note": "Deterministic holdout score; not a measure of answer accuracy.",
    }


def train() -> dict:
    examples = _all_examples()
    if not examples:
        raise ValueError("Add labeled examples before training.")
    metrics = _holdout_metrics(examples)
    model = _fit(examples)
    model["training_metrics"] = metrics
    TRAINING_DIR.mkdir(parents=True, exist_ok=True)
    temporary_path = ARTIFACT_PATH.with_suffix(".tmp")
    temporary_path.write_text(
        json.dumps(model, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    temporary_path.replace(ARTIFACT_PATH)
    return {
        "model_version": MODEL_VERSION,
        "example_count": len(examples),
        "label_counts": dict(Counter(item["label"] for item in examples)),
        **metrics,
        "trained_at": model["trained_at"],
    }


def status() -> dict:
    examples = _all_examples()
    artifact = None
    if ARTIFACT_PATH.is_file():
        with ARTIFACT_PATH.open(encoding="utf-8") as handle:
            artifact = json.load(handle)
    return {
        "model_version": MODEL_VERSION,
        "trained": artifact is not None,
        "model_current": (
            artifact is not None and artifact.get("example_count") == len(examples)
        ),
        "trained_at": artifact.get("trained_at") if artifact else None,
        "example_count": len(examples),
        "label_counts": dict(Counter(item["label"] for item in examples)),
        "labels": sorted(LABELS),
        "last_training": artifact.get("training_metrics") if artifact else None,
    }


if __name__ == "__main__":
    print(json.dumps(train(), indent=2))
