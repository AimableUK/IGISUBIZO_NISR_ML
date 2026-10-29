import type { Metadata } from "next";
import Prose from "@/components/Prose";
export const metadata: Metadata = { title: "AI transparency" };
export default function AiTransparency() {
  return (
    <Prose title="AI transparency" intro="What the analysis code computes, where optional AI is used, and the limits of current demo data.">
      <h2>What the automated system does</h2>
      <p>
        The Python service combines rule-based question routing, a small trainable intent classifier, and analysis code (K-means, panel OLS, linear trends, and weighted decision rules). Admin training changes how questions are routed; it does not train a generative model or teach the system new facts. The study-and-career adviser can use an optional AI model to interpret a question and phrase a conversational reply from analysis evidence, but only when the user explicitly enables AI-assisted replies. Weather questions use Open-Meteo for Rwanda location forecasts. Unsupported topics are identified as unsupported rather than answered with unrelated career data. The optional workspace planner proposes layouts and does not calculate statistics.
      </p>

      <h2>Important data limitation</h2>
      <p>
        Most education, labour-market, and agriculture analysis inputs are generated proxy data shaped around NISR dataset categories, not verified observations from official source tables. One crop-yield query uses a public NISR table, but it does not provide annual trends. Proxy data cannot support reliable career forecasts or real-world decisions.
      </p>

      <h2>What the system does not do</h2>
      <ul>
        <li><strong>The optional planner does not calculate:</strong> Statistical operations run in the Python analysis service; the planner only proposes layouts.</li>
        <li><strong>Not verified NISR data:</strong> Source categories describe the intended data coverage, not verified provenance for the generated proxy values.</li>
        <li><strong>No causation claims:</strong> Models report associations (e.g. NEET predictors). The UI surfaces limitations and does not present correlation as causation.</li>
        <li><strong>No forecast guarantees:</strong> The adviser may discuss scenarios, but it cannot reliably predict an individual’s future or future job demand from the current proxy datasets.</li>
        <li><strong>No final decisions:</strong> For crop/career choices, the system presents evidence and trade-offs; it does not choose for you.</li>
        <li><strong>Strictly validated output:</strong> Any AI-generated layout must validate against the <code>PresentationSpec</code> schema and against the actual result. Unsupported references are rejected and replaced by a deterministic rule-based planner.</li>
      </ul>

      <h2>How you can verify</h2>
      <ul>
        <li><strong>Sources &amp; caveats:</strong> Each workspace lists data sources, operations performed, limitations, and analysis/planner versions.</li>
        <li><strong>Traceable:</strong> The analytical result is immutable; presentation customizations are versioned separately.</li>
        <li><strong>Inspectable:</strong> Charts include data tables. You can rearrange/edit layouts in the workspace/playground.</li>
        <li><strong>Explainable routing:</strong> The NLU explains what it understood; ambiguous requests are declined rather than guessed.</li>
      </ul>

      <h2>Architecture notes</h2>
      <p>
        The analysis service runs separately (<code>model/</code>, FastAPI). The Express API routes questions to it; production disables its in-process fallback. Adviser chat history is held in the current page session. If AI-assisted replies are enabled, the latest message, recent turns, and a compact analysis-evidence summary are sent to the configured AI provider. Sources and demo/proxy status are shown with replies when available.
      </p>
    </Prose>
  );
}
