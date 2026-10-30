"""
Natural Language Understanding - intent parser for the Python model engine.
Mirrors the logic in api/src/services/nlu.ts so both engines understand the same English.
"""
import re
from .intent_model import predict as predict_conversation_intent

# --- synonym expansion --------------------------------------------------------
# Each entry: (pattern, canonical keywords injected into enriched string)
SYNONYMS = [
    # crop / career decision choice (must come before generic career)
    (r"which crop (should|can) i (plant|grow)|what (should|can) i (plant|grow|farm)"
     r"|best crop to (plant|grow)|compare crops? to (plant|grow)|rice vs|maize vs|beans vs|potato vs"
     r"|which career|compare career|career vs|study.*vs|vs.*study"
     r"|should i (study|become|plant|grow)|i want to (plant|grow|farm)",
     "decision choice Rwanda"),
    (r"i want to (be|become|work as)|my (dream|goal|passion) is"
     r"|what (should|can) i (study|become)|which (course|program|career|field) (should|is best)"
     r"|advise me|guide me|help me choose|career (path|advice|guidance|choice)"
     r"|best (career|job|field|course)|future (career|job)|job (of the future|in demand)"
     r"|in.demand (career|job|skill)|high.demand (career|job)",
     "career opportunity Rwanda"),
    # TVET
    (r"tvet|vocational|technical (school|training|education)|trade school|artisan|short course|certificate course|level [2-5]",
     "tvet training"),
    # university
    (r"university|college|degree|bachelor|master|phd|higher education|tertiary|graduate program",
     "university higher education"),
    # exams
    (r"national exam|p6|s3|s6|primary leaving|ordinary level|advanced level|o.level|a.level|nesa"
     r"|exam result|pass rate|distinction|mean score|how (many|well) (student|pupil|candidate)s? (pass|score|perform)",
     "national exam pass rate"),
    # sector growth
    (r"which sector (is|are) (growing|expanding|booming|rising|declining)|sector (trend|growth|forecast)"
     r"|employment (trend|forecast|projection) (by )?sector|sector employment (trend|forecast)"
     r"|job (growth|market trend)|industry (growth|outlook)|future (of|for) (sector|industry)",
     "employment trend sector forecast"),
    # NEET / youth
    (r"neet|youth (outside|not in) (school|work|training)|young people (unemployed|idle)"
     r"|youth (unemployment|inactivity)|what (keeps|prevent|stop) youth|why (are|do) young people",
     "neet predict factor regression"),
    # clustering
    (r"district (profile|cluster|group|segment)|underutili[sz]"
     r"|labour (profile|map)|district labour cluster",
     "cluster district underutilization profile"),
    # specific occupations → career
    (r"software (developer|engineer)|programmer|coder|data (scientist|analyst|engineer)"
     r"|ai engineer|machine learning|cybersecurity|network engineer",
     "career opportunity ICT Rwanda"),
    (r"medical doctor|physician|surgeon|pharmacist|dentist|nursing|midwife|public health officer",
     "career opportunity health Rwanda"),
    (r"civil engineer|architect|structural engineer|construction manager",
     "career opportunity engineering Rwanda"),
    (r"teacher|lecturer|educator|professor|school (principal|head)|education officer",
     "career opportunity education Rwanda"),
    (r"accountant|auditor|banker|financial analyst|economist|actuary",
     "career opportunity finance Rwanda"),
    (r"agronomist|veterinarian|agricultural officer|food scientist|agribusiness",
     "career opportunity agriculture Rwanda"),
    (r"electrician|plumber|welder|mechanic|carpenter|mason|fitter",
     "tvet career demand construction"),
]

# --- engine routing rules (ordered - first match wins) -----------------------
ENGINE_RULES = [
    # Program outcomes are factual dataset questions, not career recommendations.
    (r"\b(enrol(?:l)?ment|admission|admitted|graduation rate|graduate employment)\b",
     "data_query"),
    (r"\bapplied mathematics?\b|\bapplied math\b",
     "career_pathways"),
    (r"decision choice|which crop (should|can) i (plant|grow)|what (should|can) i (plant|grow|farm)"
     r"|best crop to (plant|grow)|compare crops? to (plant|grow)|rice vs|maize vs|beans vs|potato vs"
     r"|which career.*vs|career.*compare|should i (plant|grow|farm|study|become)"
     r"|i want to (plant|grow|farm)|best crop|crop choice",
     "decision"),
    (r"career opportunity|career.*rwanda|tvet career|university career|which career|best career"
     r"|job.*opportunit|future.*work|ai.*era|in.demand|occupation.*demand"
     r"|what (should|can) i (study|become)|i want to (be|become)|my (dream|goal) is"
     r"|advise me|guide me|help me choose",
     "career"),
    (r"neet|youth (outside|not in) (school|work|training)|predict.*neet|neet.*predict|factor.*neet|regression.*neet|why.*youth",
     "regression"),
    (r"sector.*(trend|forecast|grow|employment)|employment trend.*sector|forecast.*sector|future.*sector",
     "forecasting"),
    (r"cluster|underutil|district.*profile|group.*district|segment.*district",
     "clustering"),
]


def parse_intent(question: str) -> dict:
    """
    Returns:
        engine: specialized analysis, general dataset query, or ambiguous
        understood: human-readable explanation
        enriched: question + expanded synonyms (for downstream keyword matching)
    """
    q = question.strip()
    words = q.split()

    greeting_only = re.fullmatch(
        r"(?:hi|hello|hey|good morning|good afternoon|good evening|"
        r"how are you|how are you doing)[!.?\s]*",
        q,
        re.I,
    )
    classification = predict_conversation_intent(q)
    if greeting_only or (
        classification["label"] == "student_intro"
        and classification["confidence"] >= 0.8
    ):
        return {
            "engine": "conversation",
            "understood": (
                "Hi! I can help you explore study programs and career paths in Rwanda. "
                "What subjects do you enjoy or do well in, and are you choosing what to "
                "study, looking for a job path, or exploring both?"
            ),
            "enriched": q,
        }

    if len(words) < 2 and len(q) < 3:
        return {
            "engine": "ambiguous",
            "understood": (
                "Your question is too short. Please describe what you want to know - "
                "for example: \"Which careers are in demand in Rwanda?\", "
                "\"What should I study to become a software developer?\", "
                "or \"Show me the employment trend by sector.\""
            ),
            "enriched": q,
        }

    # Expand synonyms
    enriched = q
    for pattern, replacement in SYNONYMS:
        if re.search(pattern, q, re.I):
            enriched += " " + replacement

    eq = enriched.lower()

    # Route
    engine = "data_query"
    model_routes = {
        "program_query": "data_query",
        "career_pathways": "career_pathways",
        "career_decision": "decision",
    }
    if classification["label"] == "other" and classification["confidence"] >= 0.9:
        model_routes["other"] = "conversation"
    predicted_engine = model_routes.get(classification["label"])
    if predicted_engine and classification["confidence"] >= 0.65:
        engine = predicted_engine
    for pattern, eng in ENGINE_RULES:
        if predicted_engine and classification["confidence"] >= 0.65:
            break
        if re.search(pattern, eq, re.I):
            engine = eng
            break

    understood = _build_understood(engine, q)
    return {"engine": engine, "understood": understood, "enriched": enriched}


def _build_understood(engine: str, q: str) -> str:
    if engine == "conversation":
        return (
            "I’m a Rwanda-focused study and career guidance assistant. I can help you "
            "choose what to study, explore job paths, or look at available Rwanda data. "
            "What subjects do you enjoy or do well in, and what decision are you trying to make?"
        )
    if engine == "decision":
        return (
            "Understood: decision comparison. "
            "I will identify your options, load the available proxy data, compute indicators "
            "per option, and rank them on visible criteria with sources and caveats."
        )
    if engine == "career":
        return (
            "Understood: career opportunity analysis. "
            "I will score occupations using sector growth (LFS), graduate employment (HEC/WDA), "
            "skill gaps (LMIS), and exam pipeline (NESA)."
        )
    if engine == "regression":
        return "Understood: regression analysis - what district characteristics predict youth NEET rate."
    if engine == "forecasting":
        return "Understood: employment trend and forecast by sector. I will fit linear trends and project 2 years forward."
    if engine == "clustering":
        return "Understood: district labour underutilization profiling. I will cluster districts by underemployment, NEET, agriculture share, and formal employment."
    if engine == "career_pathways":
        return (
            "Understood: career exploration. I will connect the interests or skills you "
            "mentioned to relevant occupations and show Rwanda sector/location signals "
            "from the available job dataset, with its source status and limitations."
        )
    if engine == "conversation":
        return (
            "I focus on study choices, career exploration, and Rwanda data. Tell me "
            "what subjects you enjoy or what decision you are trying to make."
        )
    if engine == "data_query":
        return (
            "Understood: dataset question. I will match your metric or topic to the available "
            "labour, poverty, health, agriculture, education, business, exam, TVET, university, "
            "sector, or career-demand data and summarize, compare, rank, or show trends."
        )
    return f'Could not understand: "{q}". Please be more specific.'
