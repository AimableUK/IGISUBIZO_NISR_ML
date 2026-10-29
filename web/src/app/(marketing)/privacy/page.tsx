import type { Metadata } from "next";
import Link from "next/link";
import Prose from "@/components/Prose";
export const metadata: Metadata = { title: "Privacy policy" };
export default function Privacy() {
  return (
    <Prose title="Privacy policy" intro="What Isesengura collects, why, and the choices you have." updated="October 2026">
      <p><em>Template notice for operators: have this text reviewed against Rwanda’s Law No. 058/2021 on the protection of personal data and privacy, and any other law that applies to you, before launch.</em></p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> your name, email address and a securely hashed password. If you add one, your profile photo.</li>
        <li><strong>Your work:</strong> the questions you ask, the analytical results, the workspace layouts and the versions you save.</li>
        <li><strong>Contact messages:</strong> what you send through the contact form.</li>
        <li><strong>Technical data:</strong> session cookies, IP address and browser type, used to keep you signed in and protect the service.</li>
      </ul>
      <h2>How we use it</h2>
      <p>To run your account, produce and save your analyses, send transactional email (confirmations and password resets), answer your messages, and keep the service secure. We do not sell personal data and we do not show advertising.</p>
      <h2>Voice input</h2>
      <p>Voice input is optional. Speech recognition is performed by your browser’s speech service, which may send audio to that browser vendor. Isesengura receives only the text transcript that appears in the question box. You can always type instead.</p>
      <h2>AI processing</h2>
      <p>The optional workspace planner receives analysis structure to suggest a layout. In the study-and-career adviser, messages and recent conversation are sent to Anthropic only if you turn on “AI-assisted replies”; otherwise the app uses guided rules. Adviser conversation history stays in the page session and is not saved as an analysis. Do not enter sensitive personal information. See <Link href="/ai-transparency">AI transparency</Link>.</p>
      <h2>Service providers</h2>
      <p>We use providers for email delivery (Brevo), image hosting for profile photos (ImageKit), hosting, and—when you opt in to AI-assisted adviser replies—AI processing (Anthropic). They process data to provide those services.</p>
      <h2>Cookies</h2>
      <p>We use one essential session cookie and store your display preferences (theme, text size, contrast, motion) in your browser. We do not use advertising or cross-site tracking cookies.</p>
      <h2>Retention and your rights</h2>
      <p>You can delete any saved analysis from History. You may ask us to access, correct, export or delete your personal data, or to close your account, through the <Link href="/contact">contact page</Link>. Expired sessions and verification tokens are removed automatically every day.</p>
      <h2>Changes</h2>
      <p>If we change this policy in a way that matters, we will say so on this page and update the date above.</p>
    </Prose>
  );
}
