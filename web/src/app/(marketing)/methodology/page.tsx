import type { Metadata } from "next";
import Prose from "@/components/Prose";
export const metadata: Metadata = { title: "Methodology" };
export default function Methodology() {
  return (
    <Prose
      title="Methodology and data sources"
      intro="How Isesengura turns a plain question into verified, evidence-backed analysis using NISR-shaped data."
    >
      <h2>From question to result</h2>
      <ol className="mb-4 ml-5 list-decimal space-y-1">
        <li>The natural language question is routed to the right engine (decision/career, clustering, regression, or forecasting).</li>
        <li>The Python ML service loads real-structure NISR CSVs (<code>model/data/real/</code>: LFS, EICV7, DHS, SAS, EMIS/REB, NESA, Establishment Census, WDA/HEC, LMIS).</li>
        <li>Verified computations run (no numbers are invented). Results are returned as an immutable <code>AnalyticalResult</code>.</li>
        <li>A deterministic rule-based planner maps the result to a <code>PresentationSpec</code> (charts/tables/maps/metrics/insights). The layout never changes the numbers.</li>
        <li>Everything is saved as an artifact (question, result, sources, spec, versions) and can be reopened unchanged.</li>
      </ol>

      <h2>Engines</h2>
      <ul>
        <li>
          <strong>Problem A — District labour underutilization (clustering).</strong> K-means (k=3) on normalized features: underemployment, unemployment, youth NEET, agriculture share, formal employment share, and secondary+ education share. Produces district clusters and profiles.
        </li>
        <li>
          <strong>Problem B — Youth NEET predictors (regression).</strong> Panel OLS on district×year observations with year fixed effects, ridge stabilization, and leave-one-district-out cross-validation. Reports coefficients, R²/adjusted R², Q²/RMSE, and feature importance. Coefficients show association, not causation; n is small.
        </li>
        <li>
          <strong>Problem C — Sector employment trends &amp; forecast (forecasting).</strong> Linear trend per sector with 95% prediction intervals; backtested on held-out years.
        </li>
        <li>
          <strong>Decision / Career.</strong> Compares options (crops/careers) using NISR-aligned indicators with transparent criteria, scores, and sources. The system ranks options; it never makes the final decision.
        </li>
      </ul>

      <h2>Data sources</h2>
      <p>
        District-level indicators come from NISR Labour Force Survey (2019–2024), EICV7, DHS, Seasonal Agricultural Survey, EMIS/REB, NESA, Establishment Census (2020/2023), WDA/Rwanda Polytechnic, HEC, and LMIS/KORA where available. See <code>model/docs/SAMPLE_DATA.md</code> for column references.
      </p>

      <h2>Limits &amp; principles</h2>
      <ul>
        <li><strong>No invention:</strong> Missing data is not treated as zero; unsupported questions are declined with explanation.</li>
        <li><strong>Transparency:</strong> Every result lists sources, operations, caveats, and versions.</li>
        <li><strong>Separation of concerns:</strong> Models compute numbers; the LLM (if used) only plans layout/explains — never generates statistics.</li>
        <li><strong>Reproducibility:</strong> Analytical results are immutable; presentation customizations are versioned separately.</li>
      </ul>
    </Prose>
  );
}
