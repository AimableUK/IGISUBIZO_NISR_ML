import type { Metadata } from "next";
import Prose from "@/components/Prose";
export const metadata: Metadata = { title: "AI transparency" };
export default function AiTransparency() {
  return (
    <Prose title="AI transparency" intro="Where AI is used in Isesengura, where it is not, and how it is kept in check.">
      <h2>What the AI does</h2>
      <p>
        The AI planner (when enabled) may propose a <em>presentation specification</em>: which components to show (charts, tables, maps, metrics, insights) and how to arrange them. It sees only the structure of an analytical result (dataset/column names, layout hints), not your personal details or raw numbers.
      </p>

      <h2>What the AI does not do</h2>
      <ul>
        <li><strong>No calculations:</strong> All statistics, rankings, coefficients, clusters, forecasts and scores come from verified engines (Python ML service) or validated code. The AI does not compute or estimate numbers.</li>
        <li><strong>No data invention:</strong> The AI cannot fabricate data points, sources, or confidence values. If information is missing, the system says so.</li>
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
        The ML engines run in a separate service (<code>model/</code>, FastAPI) calling pure Python/statistical code on NISR-shaped CSVs. The Express API routes questions to it with a fallback to the in-process engine. The planner is separate from computation by design.
      </p>
    </Prose>
  );
}
