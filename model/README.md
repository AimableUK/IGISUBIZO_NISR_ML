# Model service template

This folder reuses the Python 3.12 production and development Dockerfiles from `/home/aimableuk/My_Files/IGISUBIZO_NISR_ML/model`.

The source folder in that project contains only Docker configuration. It does not include `requirements.txt`, `main.py`, or model weights, so this service is not yet buildable and is not included in Docker Compose. Add the FastAPI app and its dependencies here before wiring the API to it.

The Dockerfiles expect a FastAPI ASGI app exported as `app` from `main.py` and listen on port 8000. The development image enables Uvicorn reload.
