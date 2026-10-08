import type { Metadata } from "next";
import Prose from "@/components/Prose";
export const metadata: Metadata = { title: "AI transparency" };
export default function AiTransparency() {
  return (
    <Prose title="AI transparency" intro="Where AI is used in Isesengura, where it is not, and how it is kept in check.">
      <h2>What the AI does</h2>
      <p>An AI planner may propose a <em>presentation specification</em>: which components to show (for example a bar chart, a map and a table) and how to arrange them. It sees only the structure of an analytical result, such as dataset and column names, and not your personal details.</p>
      <h2>What the AI does not do</h2>
      <ul>
        <li>It does not calculate, estimate or write any statistic. Numbers, rankings and insight sentences come from the analysis engine.</li>
        <li>It does not write code or HTML. Its output is data that is strictly validated, and only supported component types can render.</li>
        <li>It cannot reference data that does not exist. A specification that points at a missing dataset, column or metric is rejected and replaced by a deterministic planner.</li>
      </ul>
      <h2>How you can check</h2>
      <p>Each workspace lists its sources, the steps used to produce its numbers and its caveats. Every chart has a data table and a text summary. The planner version is recorded with each saved version, and the Playground lets you read and edit the specification itself.</p>
      <h2>Limits</h2>
      <p>The planner can choose a layout you find unhelpful. Rearrange it or edit it in the Playground. Questions the engine cannot interpret are declined with an explanation instead of being guessed at.</p>
    </Prose>
  );
}
