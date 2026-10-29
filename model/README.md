# Model service

The Python FastAPI service is the analysis backend used by the Express API. It exposes `GET /health` and `POST /analyze`; the API connects to it with `MODEL_URL`.

The model service combines a small **trainable intent classifier** with ordinary Python analysis code; it is not a generative LLM:

- a Multinomial Naive Bayes classifier learns to route greetings, student introductions, program questions, career-path questions, decisions, data questions, and out-of-scope requests from labeled examples;
- regex/synonym rules and domain-specific engines still compute the answers;
- a dataset query engine answers metric, comparison, ranking, and trend questions across 12 CSV datasets (11 generated proxies and one official NISR table);
- K-means clusters district profiles;
- panel OLS estimates associations;
- linear regression extrapolates sector trends;
- decision rules calculate weighted crop/career comparisons.

The optional Anthropic presentation planner does not calculate analysis. The web app also has a multi-turn study-and-career adviser: the API retrieves analysis evidence for each message and can use Anthropic to compose a natural-language answer only after the user opts in. Without that option, a visibly labeled guided response is used. Conversation context is held in the current page session and is not saved as an analysis. The intent classifier is trained from `engine/intent_seed.jsonl` and admin-added examples. Admins can add labeled examples and train/save the classifier from `/admin`; production persists its artifact and examples in the `modeltraining` volume. This trains intent routing only, not answer generation or facts. Its hold-out score is not a measure of career advice accuracy. Use reviewed examples and verified data; do not add personal student information.

Career decision support now includes named study-program comparisons using enrollment, graduation, graduate employment, and wage indicators; questions such as “How has Software Engineering enrollment changed from 2021 to 2025?” return a yearly series, and “Should I study Software Engineering or Finance?” compares the programs. Applied-mathematics questions return ten potential sectors, related occupations, and Rwanda locations represented in the job-demand file. These education and job-demand files are generated proxy data: the pathway list is illustrative, and the source does not verify employer eligibility or entry-level hiring. Do not treat the current rankings or vacancy counts as real labor-market advice.

The general query engine also covers labour, poverty, health, agriculture, education, business establishments, sector employment, TVET, higher education, national exams, and career demand. For recognized metrics it can summarize values, compare or rank districts/categories, apply named-category filters, and show time trends when years are available. Crop-yield questions use the official NISR PxWeb export in `data/official/`; natural-language examples include “How much maize per hectare in Musanze?”, “What is the yield of Irish potato in Nyabihu?”, and “Compare maize yield between Season A and Season B in Musanze”. If a district/season comparison omits the crop, the engine asks for one rather than averaging yields across unlike crops. Unsupported questions return available topic suggestions instead of an unrelated labour-clustering result.

## Data status

The files under `data/real/` are generated proxy data written by `generate_real.py`; they are not verified NISR extracts and are marked as sample/demo. The crop-yield query uses the public NISR table “Average yield (Kg/Ha) by Season, District and Crop type.” The original export, normalized district observations, source URL, dimensions, and retrieval time are kept under `data/official/`. The source does not state a reference year, so results are limited to its two seasons and are not year-over-year trends. Refresh this table with `python3 model/download_official_data.py`. The other proxy-based analyses remain demos and must not be presented as official statistics or used for real-world decisions. Do not change the core loader's sample flag based on this single table.

## Run locally

```bash
python -m pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

In the full application, use `docker compose up --build`; production uses `docker-compose.prod.yml` and runs the model as a private service.
