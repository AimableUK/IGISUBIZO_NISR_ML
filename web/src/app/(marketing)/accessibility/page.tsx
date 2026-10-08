import type { Metadata } from "next";
import Link from "next/link";
import Prose from "@/components/Prose";
export const metadata: Metadata = { title: "Accessibility" };
export default function Accessibility() {
  return (
    <Prose title="Accessibility statement" intro="Isesengura is designed so that people with different abilities can use every part of it." updated="October 2026">
      <h2>What we build in</h2>
      <ul>
        <li><strong>Keyboard:</strong> everything works without a mouse, with a visible focus ring and a skip link. Resizing and reordering have button alternatives to dragging.</li>
        <li><strong>Screen readers:</strong> semantic headings and landmarks, labelled controls, a text summary for every chart and an accessible data table behind every chart and map.</li>
        <li><strong>Vision:</strong> day and night themes, a high-contrast mode, text sizes up to 130%, and charts that never rely on colour alone (line styles, markers and printed values differ).</li>
        <li><strong>Hearing:</strong> nothing requires sound. Voice transcripts are visible, and read-aloud shows the same text on screen. Notifications are visual.</li>
        <li><strong>Motion:</strong> animations respect your system setting, and there is a reduce-motion switch in the display menu.</li>
        <li><strong>Voice is optional:</strong> typed input is always available.</li>
      </ul>
      <h2>Known limits</h2>
      <p>The district map is a schematic tile map rather than a geographic one, so that every district is large enough to read and operate. Browser speech recognition is not available in all browsers and may not recognise Kinyarwanda.</p>
      <h2>Tell us about a barrier</h2>
      <p>If something does not work for you, <Link href="/contact">contact us</Link> and say what you were trying to do and what assistive technology you use. We treat accessibility problems as bugs.</p>
    </Prose>
  );
}
