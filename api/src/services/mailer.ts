import axios from "axios";
import { env } from "../env";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string };

/** Sends through Brevo. Without an API key (local dev) the message is printed so links can be followed. */
export async function sendMail(mail: Mail): Promise<void> {
  if (!env.BREVO_API_KEY) {
    console.info(`\n[mail:dev] to=${mail.to} subject="${mail.subject}"\n${mail.text}\n`);
    return;
  }
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: env.BREVO_SENDER_NAME, email: env.BREVO_SENDER_EMAIL },
      to: [{ email: mail.to }],
      replyTo: mail.replyTo ? { email: mail.replyTo } : undefined,
      subject: mail.subject,
      htmlContent: mail.html,
      textContent: mail.text,
    },
    { headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json" }, timeout: 10_000 },
  );
}

const shell = (title: string, body: string) =>
  `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#253D2C"><h2 style="color:#2E6F40">${esc(title)}</h2>${body}<p style="color:#5b6f60;font-size:12px">Isesengura - Rwanda Analytical Workspace</p></div>`;

export const templates = {
  verify: (name: string, url: string): Omit<Mail, "to"> => ({
    subject: "Confirm your email for Isesengura",
    html: shell("Confirm your email", `<p>Hello ${esc(name)},</p><p>Confirm your address to start saving analyses.</p><p><a href="${esc(url)}" style="background:#2E6F40;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Confirm email</a></p><p>Or paste this link: ${esc(url)}</p>`),
    text: `Hello ${name},\nConfirm your email: ${url}`,
  }),
  reset: (name: string, url: string): Omit<Mail, "to"> => ({
    subject: "Reset your Isesengura password",
    html: shell("Reset your password", `<p>Hello ${esc(name)},</p><p><a href="${esc(url)}" style="background:#2E6F40;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Choose a new password</a></p><p>If you did not ask for this, ignore this message.</p>`),
    text: `Hello ${name},\nReset your password: ${url}\nIf you did not ask for this, ignore this message.`,
  }),
  contact: (name: string, email: string, message: string): Omit<Mail, "to"> => ({
    subject: `Contact form: ${name}`,
    replyTo: email,
    html: shell("New contact message", `<p><b>${esc(name)}</b> &lt;${esc(email)}&gt;</p><p style="white-space:pre-wrap">${esc(message)}</p>`),
    text: `From ${name} <${email}>\n\n${message}`,
  }),
};
