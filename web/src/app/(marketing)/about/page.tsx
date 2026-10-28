import type { Metadata } from "next";
import Link from "next/link";
import Prose from "@/components/Prose";
export const metadata: Metadata = { title: "About" };
export default function About() {
  return (
    <Prose title="About Isesengura" intro="Isesengura (Kinyarwanda for “analysis”) turns questions about Rwanda’s public data into workspaces you can keep.">
      <h2>Why we built it</h2>
      <p>Official statistics are most useful when people can explore them without writing queries or waiting for a report. A chatbot answers with a paragraph. A static dashboard answers one question. Isesengura builds an interactive analytical workspace for the question you actually asked, then saves it.</p>
      <h2>What makes it different</h2>
      <ul>
        <li><strong>Results and presentation are separate.</strong> The analysis engine computes demo results from generated proxy values. A planner only describes how to show them. Changing a chart type or layout never changes a number.</li>
        <li><strong>No generated code runs.</strong> The AI proposes a structured specification. The product validates it and draws it with its own components.</li>
        <li><strong>Work is kept.</strong> Every analysis is saved with its layout, sources and version history.</li>
        <li><strong>Accessible by design.</strong> Keyboard use, screen-reader summaries, data tables, high contrast and optional voice, with typed input always available.</li>
      </ul>
      <h2>Where it stands</h2>
      <p>This build was created for the 2026 NISR Big Data Hackathon. Read the <Link href="/methodology">methodology</Link> and <Link href="/ai-transparency">AI transparency</Link> pages for details, or <Link href="/contact">get in touch</Link>.</p>
    </Prose>
  );
}
