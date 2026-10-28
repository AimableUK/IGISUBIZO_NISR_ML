"""
Natural Language Understanding — intent parser for the Python model engine.
Mirrors the logic in api/src/services/nlu.ts so both engines understand the same English.
"""
import re

# ─── synonym expansion ────────────────────────────────────────────────────────
# Each entry: (pattern, canonical keywords injected into enriched string)
SYNONYMS = [
    # crop / career decision choice (must come before generic career)
    (r"which (crop|plant|grow|farm)|what (should|can) i (plant|grow|farm)"
     r"|best crop|compare crop|rice vs|maize vs|beans vs|potato vs"
     r"|which career|compare career|career vs|study.*vs|vs.*study"
     r"|should i (study|become|plant|grow)|i want to (plant|grow|farm)",
     "decision choice Rwanda"),
    (r"i want to (be|become|work as)|i (am|'m) interested in|my (dream|goal|passion) is"
     r"|what (should|can) i (study|do|become)|which (course|program|career|field) (should|is best)"
     r"|advise me|guide me|help me choose|career (path|advice|guidance|choice)"
     r"|best (career|job|field|course)|future (career|job)|job (of the future|in demand)"
     r"|in.demand (career|job|skill)|high.demand (career|job)",
     "career opportunity Rwanda"),
    # TVET
    (r"tvet|vocational|technical (school|training|education)|trade school|artisan|short course|certificate course|level [2-5]",
     "tvet career demand"),
    # university
    (r"university|college|degree|bachelor|master|phd|higher education|tertiary|graduate program",
     "university career graduate employment"),
    # exams
    (r"national exam|p6|s3|s6|primary leaving|ordinary level|advanced level|o.level|a.level|nesa"
     r"|exam result|pass rate|distinction|mean score|how (many|well) (student|pupil|candidate)s? (pass|score|perform)",
     "national exam pass rate"),
    # sector growth
    (r"which sector (is|are) (growing|expanding|booming|rising|declining)|sector (trend|growth|forecast)"
     r"|employment (trend|forecast|projection)|job (growth|market trend)|industry (growth|outlook)"
     r"|over (the )?(next|coming) (year|decade)|in (5|10|20) years?|future (of|for) (work|jobs|employment)",
     "employment trend sector forecast"),
    # NEET / youth
    (r"neet|youth (outside|not in) (school|work|training)|young people (unemployed|idle)"
     r"|youth (unemployment|inactivity)|what (keeps|prevent|stop) youth|why (are|do) young people",
     "neet predict factor regression"),
    # clustering
    (r"district (profile|comparison|cluster|group|segment|rank)|underutili[sz]"
     r"|labour (profile|map)|which district (has|have|is|are)|compare district",
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

# ─── engine routing rules (ordered — first match wins) ───────────────────────
ENGINE_RULES = [
    (r"decision choice|which crop|compare crop|rice vs|maize vs|beans vs|potato vs"
     r"|which career.*vs|career.*compare|should i (plant|grow|farm|study|become)"
     r"|i want to (plant|grow|farm)|best crop|crop choice",
     "decision"),
    (r"career opportunity|career.*rwanda|tvet career|university career|which career|best career"
     r"|job.*opportunit|future.*work|ai.*era|in.demand|occupation.*demand"
     r"|what (should|can) i (study|become)|i want to (be|become)|my (dream|goal) is"
     r"|advise me|guide me|help me choose",
     "career"),
    (r"neet|predict|factor|associat|regression|what.*(cause|affect|influenc)|why.*youth",
     "regression"),
    (r"trend|forecast|sector.*grow|employment.*trend|over time|projection|future.*sector",
     "forecasting"),
    (r"cluster|underutil|district.*profile|group.*district|segment.*district",
     "clustering"),
]


def parse_intent(question: str) -> dict:
    """
    Returns:
        engine: 'decision' | 'career' | 'regression' | 'forecasting' | 'clustering' | 'ambiguous'
        understood: human-readable explanation
        enriched: question + expanded synonyms (for downstream keyword matching)
    """
    q = question.strip()
    words = q.split()

    if len(words) < 2:
        return {
            "engine": "ambiguous",
            "understood": (
                "Your question is too short. Please describe what you want to know — "
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
    engine = "clustering"  # default
    for pattern, eng in ENGINE_RULES:
        if re.search(pattern, eq, re.I):
            engine = eng
            break

    understood = _build_understood(engine, q)
    return {"engine": engine, "understood": understood, "enriched": enriched}


def _build_understood(engine: str, q: str) -> str:
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
        return "Understood: regression analysis — what district characteristics predict youth NEET rate."
    if engine == "forecasting":
        return "Understood: employment trend and forecast by sector. I will fit linear trends and project 2 years forward."
    if engine == "clustering":
        return "Understood: district labour underutilization profiling. I will cluster districts by underemployment, NEET, agriculture share, and formal employment."
    return f'Could not understand: "{q}". Please be more specific.'
