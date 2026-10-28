import type { Metadata } from "next";
import Prose from "@/components/Prose";
export const metadata: Metadata = { title: "AI transparency" };
export default function AiTransparency() {
  return (
    <Prose title="AI transparency" intro="What the analysis code computes, where optional AI is used, and the limits of current demo data.">
      <h2>What the automated system does</h2>
      <p>
        The Python service uses rule-based question routing and statistical code (K-means, panel OLS, linear trends, and weighted decision rules). It is not a trained neural network or chatbot. The optional AI planner may propose a <em>presentation specification</em>: which components to show and how to arrange them. It does not calculate the statistics.
      </p>

      <h2>Important data limitation</h2>
      <p>
        Current analysis inputs are generated proxy data shaped around NISR dataset categories. They are not verified observations from official NISR source tables. Results are marked as demo data and must not be treated as official statistics or used for real-world decisions.
      </p>

      <h2>What the system does not do</h2>
      <ul>
        <li><strong>The optional planner does not calculate:</strong> Statistical operations run in the Python analysis service; the planner only proposes layouts.</li>
        <li><strong>Not verified NISR data:</strong> Source categories describe the intended data coverage, not verified provenance for the generated proxy values.</li>
        <li><strong>No causation claims:</strong> Models report associations (e.g. NEET predictors). The UI surfaces limitations and does not present correlation as causation.</li>
        <li><strong>No final decisions:</strong> For crop/career choices, the system ranks options with evidence; it never picks a single "best" option for you.</li>
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
        The analysis service runs separately (<code>model/</code>, FastAPI). The Express API routes questions to it; production disables its in-process fallback. Demo results and data limitations appear in the workspace provenance panel.
      </p>
    </Prose>
  );
}
