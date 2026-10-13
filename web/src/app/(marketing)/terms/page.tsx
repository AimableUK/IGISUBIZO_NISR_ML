import type { Metadata } from "next";
import Link from "next/link";
import Prose from "@/components/Prose";
export const metadata: Metadata = { title: "Terms of service" };
export default function Terms() {
  return (
    <Prose title="Terms of service" intro="The rules for using Isesengura." updated="October 2026">
      <p><em>Template notice for operators: have a lawyer review and complete these terms (operator name, governing law, jurisdiction) before launch.</em></p>
      <h2>Using the service</h2>
      <p>You may use Isesengura to explore public data and to create and keep analytical workspaces. You agree to give accurate account information, keep your password secure, and not misuse the service, for example by attempting to break its security, overload it, or submit unlawful content.</p>
      <h2>Sample data and accuracy</h2>
      <p>Results depend on the source, the method shown in each workspace and the caveats listed there. Check them before relying on a figure.</p>
      <h2>AI-assisted presentation</h2>
      <p>An AI system may suggest how a workspace is laid out. It does not compute the numbers shown. You remain responsible for how you interpret and use results. See <Link href="/ai-transparency">AI transparency</Link>.</p>
      <h2>Your content</h2>
      <p>You keep ownership of the questions you ask and the customizations you make. You give us permission to store and display them to you in order to provide the service. Underlying datasets remain subject to their publishers’ licences, shown with each source.</p>
      <h2>Availability</h2>
      <p>We try to keep the service available but do not promise uninterrupted access. We may change or withdraw features, and will try to give notice when a change affects saved work.</p>
      <h2>Liability</h2>
      <p>To the extent the law allows, the operators are not liable for losses that result from decisions made using the service. Nothing here limits liability that cannot lawfully be limited.</p>
      <h2>Ending your account</h2>
      <p>You can stop using the service at any time and ask us to delete your account through the <Link href="/contact">contact page</Link>. We may suspend accounts that break these terms.</p>
    </Prose>
  );
}
