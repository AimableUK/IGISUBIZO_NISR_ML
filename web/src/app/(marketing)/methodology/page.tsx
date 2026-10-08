import type { Metadata } from "next";
import Prose from "@/components/Prose";
export const metadata: Metadata = { title: "Methodology" };
export default function Methodology() {
  return (
    <Prose title="Methodology and data sources" intro="How a question becomes verified numbers, and what this build does and does not contain.">
      <h2>Sample data in this build</h2>
      <p>This build contains generated sample series for two indicators (youth employment rate and secondary school net enrolment) across Rwanda’s 30 districts for 2021–2025. They exist so the product can be built and tested end to end. <strong>They are not NISR statistics</strong> and every workspace says so.</p>
      <h2>From question to result</h2>
      <ol className="mb-4 ml-5 list-decimal space-y-1">
        <li>The question is mapped to an indicator, an operation (compare, trend, rank or summary), an optional set of districts and a period.</li>
        <li>If it cannot be interpreted, or asks for something unsupported, you are told why and nothing is invented.</li>
        <li>District values are read for the period, ranked and summarised. National figures are simple, unweighted means across districts.</li>
        <li>The result is stored with its sources, a log of the operations performed and its caveats.</li>
      </ol>
      <h2>Reproducibility</h2>
      <p>The analytical result is stored once and never rewritten. Layout changes create new versions that point at the same result. If the engine or a dataset has changed since an analysis was computed, the workspace shows a notice and still displays the original result.</p>
      <h2>Moving to official data</h2>
      <p>Replacing the sample engine with official sources only requires producing the same analytical-result structure. Sources, publishers, licences and dataset versions will appear next to each workspace.</p>
    </Prose>
  );
}
