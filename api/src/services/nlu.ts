/**
 * Natural Language Understanding — intent parser.
 *
 * Converts free-form English questions into a structured ParsedIntent so the
 * downstream engines (ml-engine, engine) always receive a well-understood signal
 * regardless of how the user phrased their question.
 *
 * No external dependencies. Pure string matching with synonym expansion.
 */

export type EngineIntent =
  | "career_intelligence"   // Problem D — career scoring, path advice
  | "clustering"            // Problem A — district underutilization profiles
  | "regression"            // Problem B — NEET predictors
  | "forecasting"           // Problem C — sector employment trends
  | "indicator_query"       // engine.ts — single indicator compare/trend/rank
  | "ambiguous";            // too short or unclear

export type Operation = "compare" | "trend" | "rank" | "summary";

export interface ParsedIntent {
  engine: EngineIntent;
  operation: Operation;
  /** Normalised question passed to the engine (original casing preserved) */
  question: string;
  /** Detected subject tokens useful for engine.ts indicator matching */
  subjects: string[];
  /** Named districts found in the question */
  districts: string[];
  /** Confidence 0–1 */
  confidence: number;
  /** Human-readable explanation of what was understood */
  understood: string;
}

// ─── synonym tables ───────────────────────────────────────────────────────────

/** Maps any natural phrase → canonical engine keyword injected into the question */
const SYNONYMS: Array<[RegExp, string]> = [
  // career / path advice
  [/\b(i want to (be|become|work as)|i (am|'m) interested in|i (dream|hope) (of|to)|my (dream|goal|passion) is|what (should|can) i (study|do|become)|which (course|program|career|field) (should|is best)|advise me|guide me|help me choose|career (path|advice|guidance|choice|option)|best (career|job|field|course) (for me|in rwanda|to study)|what (career|job|field) (has|have) (future|demand|opportunity)|future (career|job)|job (of the future|in demand)|in-demand (career|job|skill)|high.demand (career|job))\b/i, "career opportunity Rwanda"],
  // TVET / vocational
  [/\b(tvet|vocational|technical (school|training|education)|trade school|artisan|craftsman|short course|certificate course|level [2-5])\b/i, "tvet career demand"],
  // university / higher ed
  [/\b(university|college|degree|bachelor|master|phd|higher education|tertiary|campus|graduate program|undergraduate)\b/i, "university career graduate employment"],
  // exams
  [/\b(national exam|p6|s3|s6|primary leaving|ordinary level|advanced level|o.level|a.level|nesa|exam result|pass rate|distinction|mean score|how (many|well) (student|pupil|candidate)s? (pass|score|perform))\b/i, "national exam pass rate"],
  // sector growth / forecasting
  [/\b(which sector (is|are) (growing|expanding|booming|rising|declining)|sector (trend|growth|forecast|future)|employment (trend|forecast|projection)|job (growth|market trend)|industry (growth|outlook)|over (the )?(next|coming) (year|decade)|in (5|10|20) years?|future (of|for) (work|jobs|employment))\b/i, "employment trend sector forecast"],
  // NEET / youth
  [/\b(neet|youth (outside|not in) (school|work|training)|young people (unemployed|idle)|youth (unemployment|inactivity)|what (keeps|prevent|stop) youth|why (are|do) young people)\b/i, "neet predict factor regression"],
  // clustering / district profiles
  [/\b(district (profile|comparison|cluster|group|segment|rank)|underutili[sz]|labour (profile|map)|which district (has|have|is|are)|compare district|district (labour|employment) (profile|pattern))\b/i, "cluster district underutilization profile"],
  // poverty / welfare
  [/\b(poverty|poor|destitut|extreme poverty|consumption|welfare|living standard|household income|eicv)\b/i, "poverty headcount"],
  // health
  [/\b(health|hospital|clinic|doctor|nurse|vaccination|stunting|malnutrition|maternal|birth|dhs|mortality)\b/i, "health skilled birth attendance"],
  // agriculture
  [/\b(agri(culture)?|farm(ing|er)?|crop|harvest|yield|fertilizer|irrigation|livestock|seasonal survey|sas)\b/i, "crop production yield agriculture"],
  // electricity / infrastructure
  [/\b(electricity|power|electrif|solar|energy access)\b/i, "electricity access"],
  // water / sanitation
  [/\b(water|sanitation|hygiene|wash|clean water|latrine)\b/i, "clean water access"],
  // specific occupations → career intelligence
  [/\b(software (developer|engineer)|programmer|coder|data (scientist|analyst|engineer)|ai engineer|machine learning|cybersecurity|network engineer|it (professional|specialist))\b/i, "career opportunity ICT Rwanda"],
  [/\b(medical doctor|physician|surgeon|pharmacist|dentist|nursing|midwife|public health officer)\b/i, "career opportunity health Rwanda"],
  [/\b(civil engineer|architect|structural engineer|construction manager|quantity surveyor)\b/i, "career opportunity engineering Rwanda"],
  [/\b(teacher|lecturer|educator|professor|school (principal|head)|education officer)\b/i, "career opportunity education Rwanda"],
  [/\b(accountant|auditor|banker|financial analyst|economist|actuary|tax officer)\b/i, "career opportunity finance Rwanda"],
  [/\b(agronomist|veterinarian|agricultural officer|food scientist|agribusiness)\b/i, "career opportunity agriculture Rwanda"],
  [/\b(lawyer|advocate|legal officer|judge|magistrate|notary)\b/i, "career opportunity law Rwanda"],
  [/\b(journalist|media|communication|public relations|broadcaster)\b/i, "career opportunity media Rwanda"],
  [/\b(hotel|tourism|hospitality|tour guide|chef|catering)\b/i, "career opportunity hospitality Rwanda"],
  [/\b(electrician|plumber|welder|mechanic|carpenter|mason|fitter)\b/i, "tvet career demand construction"],
];

/** Operation detection */
const OP_PATTERNS: Array<[RegExp, Operation]> = [
  [/\b(trend|over time|change|grew|growth|last \d|since 20\d\d|historical|year.by.year|progress)\b/i, "trend"],
  [/\b(rank|top|highest|lowest|best|worst|leading|most|least|number one|bottom)\b/i, "rank"],
  [/\b(compare|versus|vs\.?|between|across|difference|gap|relative)\b/i, "compare"],
];

// ─── district name list (matches geo.ts) ─────────────────────────────────────
const DISTRICT_NAMES = [
  "Gasabo","Kicukiro","Nyarugenge","Bugesera","Gatsibo","Kayonza","Kirehe",
  "Ngoma","Nyagatare","Rwamagana","Burera","Gakenke","Gicumbi","Musanze",
  "Rulindo","Gisagara","Huye","Kamonyi","Muhanga","Nyamagabe","Nyamasheke",
  "Nyanza","Ruhango","Karongi","Ngororero","Nyabihu","Rubavu","Rusizi","Maramagambo",
];

// ─── engine routing rules (ordered — first match wins) ───────────────────────
const ENGINE_RULES: Array<[RegExp, EngineIntent]> = [
  [/career opportunity|career.*rwanda|tvet career|university career|which career|best career|job.*opportunit|future.*work|ai.*era|in.demand|occupation.*demand|what (should|can) i (study|become)|i want to (be|become)|my (dream|goal) is|advise me|guide me|help me choose/i, "career_intelligence"],
  [/neet|predict|factor|associat|regression|what.*(cause|affect|influenc)|why.*youth/i, "regression"],
  [/trend|forecast|sector.*grow|employment.*trend|over time|projection|future.*sector/i, "forecasting"],
  [/cluster|underutil|district.*profile|group.*district|segment.*district/i, "clustering"],
];

// ─── main export ──────────────────────────────────────────────────────────────
export function parseIntent(rawQuestion: string): ParsedIntent {
  const q = rawQuestion.trim();
  const words = q.split(/\s+/);

  // Too short — ask for clarification
  if (words.length < 3) {
    return {
      engine: "ambiguous", operation: "summary", question: q,
      subjects: [], districts: [], confidence: 0,
      understood: "Your question is too short. Please describe what you want to know — for example: \"Which careers are in demand in Rwanda?\", \"What should I study to become a software developer?\", or \"Show me the employment trend by sector.\"",
    };
  }

  // Expand synonyms — build an enriched string for routing
  let enriched = q;
  for (const [pattern, replacement] of SYNONYMS) {
    if (pattern.test(q)) enriched += " " + replacement;
  }
  const eq = enriched.toLowerCase();

  // Detect operation
  let operation: Operation = "summary";
  for (const [pat, op] of OP_PATTERNS) {
    if (pat.test(q)) { operation = op; break; }
  }

  // Detect districts
  const districts = DISTRICT_NAMES.filter((d) => new RegExp(`\\b${d}\\b`, "i").test(q));

  // Route to engine
  let engine: EngineIntent = "indicator_query"; // default
  let confidence = 0.6;
  for (const [pat, eng] of ENGINE_RULES) {
    if (pat.test(eq)) { engine = eng; confidence = 0.9; break; }
  }

  // Extract subject tokens (words that aren't stop words)
  const STOP = new Set(["what","which","how","why","where","when","is","are","was","were","the","a","an","in","of","to","for","and","or","do","does","did","i","my","me","we","our","can","will","would","should","could","has","have","had","be","been","being","show","tell","give","find","get","make","let","please","want","need","like","know","think","see","look","go","come","take","use","with","from","that","this","these","those","it","its","at","by","on","up","out","about","into","than","then","so","but","if","not","no","yes","all","any","some","more","most","much","many","very","just","also","even","still","yet","already","always","never","often","here","there","now","then","today","tomorrow","yesterday"]);
  const subjects = [...new Set(
    q.toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !STOP.has(w))
  )];

  // Build human-readable understanding
  const understood = buildUnderstood(engine, operation, districts, subjects, q);

  return { engine, operation, question: q, subjects, districts, confidence, understood };
}

function buildUnderstood(engine: EngineIntent, op: Operation, districts: string[], subjects: string[], q: string): string {
  const distStr = districts.length ? ` in ${districts.join(", ")}` : " across Rwanda";
  switch (engine) {
    case "career_intelligence":
      return `Understood: career opportunity analysis${distStr}. I will score occupations using sector growth (LFS), graduate employment (HEC/WDA), skill gaps (LMIS), and exam pipeline (NESA).`;
    case "clustering":
      return `Understood: district labour underutilization profiling${distStr}. I will cluster districts by underemployment, NEET, agriculture share, and formal employment.`;
    case "regression":
      return `Understood: regression analysis — what district characteristics predict youth NEET rate${distStr}.`;
    case "forecasting":
      return `Understood: employment trend and forecast by sector${distStr}. I will fit linear trends and project 2 years forward.`;
    case "indicator_query":
      return `Understood: indicator query — ${op} of ${subjects.slice(0, 3).join(", ")}${distStr}.`;
    case "ambiguous":
      return `Could not understand: "${q}". Please be more specific.`;
  }
}
