# Model service

The Python FastAPI service is the analysis backend used by the Express API. It exposes `GET /health` and `POST /analyze`; the API connects to it with `MODEL_URL`.

The "brain" is ordinary Python code, not a trained neural network:

- regex/synonym rules route questions to an engine;
- K-means clusters district profiles;
- panel OLS estimates associations;
- linear regression extrapolates sector trends;
- decision rules calculate weighted crop/career comparisons.

The optional Anthropic integration is a separate presentation planner; it does not calculate the analysis.

## Data status

The files under `data/real/` are generated proxy data written by `generate_real.py`. They are not verified extracts of NISR source tables. Model results are marked as sample/demo data and must not be presented as official statistics or used for real-world decisions. Replace and validate the inputs against published source tables before changing `IS_SAMPLE_DATA` in `engine/loader.py`.

## Run locally

```bash
python -m pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

In the full application, use `docker compose up --build`; production uses `docker-compose.prod.yml` and runs the model as a private service.
