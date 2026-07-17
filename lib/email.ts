import { Resend } from "resend";

// Lazy: constructing Resend throws when the key is absent (e.g. at build time,
// where the Sensitive key isn't present). Only build it when actually sending.
function resendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

// From a verified domain (outerjoin.co.za). Overridable via env.
const FROM = process.env.EMAIL_FROM || "Valorian <valorian@outerjoin.co.za>";

// SAFETY GATE (fail-safe): every outbound email is redirected to a test inbox
// UNLESS EMAIL_GO_LIVE === "true". So the default state — including a missing or
// empty EMAIL_TEST_RECIPIENT — still cannot email real recipients. To actually
// go live you must deliberately set EMAIL_GO_LIVE=true.
const GO_LIVE = process.env.EMAIL_GO_LIVE === "true";
const TEST_RECIPIENT = GO_LIVE
  ? process.env.EMAIL_TEST_RECIPIENT || null // live: only gated if a test inbox is still set
  : process.env.EMAIL_TEST_RECIPIENT || "carl@outerjoin.co.za"; // not live: always gated

const BRAND = {
  navy: "#0a1a2f",
  gold: "#c8a24c",
};

export interface SendResult {
  ok: boolean;
  redirected: boolean;
  to: string;
  intended: string;
  id?: string;
  error?: string;
}

function shell(title: string, bodyHtml: string, gatedNote?: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f6f8;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#16233a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e4e7ec;border-radius:12px;overflow:hidden;">
    <div style="background:${BRAND.navy};padding:22px 28px;">
      <div style="font-size:20px;font-weight:700;letter-spacing:0.14em;color:#fff;">VALOR<span style="color:${BRAND.gold};">IAN</span></div>
      <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.gold};margin-top:3px;">AI Business Analyst</div>
    </div>
    <div style="padding:28px;">
      <h1 style="font-size:18px;margin:0 0 14px;">${title}</h1>
      ${bodyHtml}
    </div>
    ${
      gatedNote
        ? `<div style="padding:12px 28px;background:#fff8e6;border-top:1px solid #f0e2b8;font-size:11px;color:#8a6d1f;">${gatedNote}</div>`
        : ""
    }
    <div style="padding:16px 28px;background:#fafbfc;border-top:1px solid #e4e7ec;font-size:11px;color:#8a97a9;">
      Valora Advisory · Turning Insight into Impact · sent by Valorian
    </div>
  </div>
  </body></html>`;
}

async function deliver(
  intended: string,
  subject: string,
  buildHtml: (gatedNote?: string) => string
): Promise<SendResult> {
  const redirected = Boolean(TEST_RECIPIENT);
  const to = TEST_RECIPIENT || intended;
  const gatedNote = redirected
    ? `⚠️ Test mode: this email was intended for <strong>${intended}</strong> and redirected to you because EMAIL_TEST_RECIPIENT is set.`
    : undefined;
  const finalSubject = redirected ? `[TEST → ${intended}] ${subject}` : subject;

  try {
    const { data, error } = await resendClient().emails.send({
      from: FROM,
      to,
      subject: finalSubject,
      html: buildHtml(gatedNote),
    });
    if (error) {
      return { ok: false, redirected, to, intended, error: error.message };
    }
    return { ok: true, redirected, to, intended, id: data?.id };
  } catch (e) {
    return {
      ok: false,
      redirected,
      to,
      intended,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export function sendUserInviteEmail(params: {
  name: string;
  email: string;
  role: string;
}): Promise<SendResult> {
  const { name, email, role } = params;
  const subject = `You've been added to the Valorian workspace`;
  return deliver(email, subject, (gatedNote) =>
    shell(
      `Welcome to Valorian${name ? `, ${name.split(" ")[0]}` : ""}`,
      `<p style="font-size:14px;line-height:1.6;color:#4a5a72;">
         You've been added to Valora Advisory's <strong>Valorian</strong> AI Business Analyst workspace.
       </p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">
         <tr><td style="padding:8px 0;color:#8a97a9;width:90px;">Name</td><td style="padding:8px 0;font-weight:600;">${name || "—"}</td></tr>
         <tr><td style="padding:8px 0;color:#8a97a9;">Email</td><td style="padding:8px 0;font-weight:600;">${email}</td></tr>
         <tr><td style="padding:8px 0;color:#8a97a9;">Role</td><td style="padding:8px 0;font-weight:600;">${role}</td></tr>
       </table>
       <a href="https://valorina-ai.vercel.app" style="display:inline-block;background:${BRAND.gold};color:${BRAND.navy};font-weight:700;font-size:13px;text-decoration:none;padding:11px 20px;border-radius:9px;">Open the workspace →</a>`,
      gatedNote
    )
  );
}

export function sendAssessmentInviteEmail(params: {
  to: string;
  company: string;
  contactName: string;
  link: string;
}): Promise<SendResult> {
  const { to, company, contactName, link } = params;
  const subject = `Valora Advisory — Operational & ESG Pre-Kickoff Assessment`;
  return deliver(to, subject, (gatedNote) =>
    shell(
      `Your pre-kickoff assessment${contactName ? `, ${contactName.split(" ")[0]}` : ""}`,
      `<p style="font-size:14px;line-height:1.6;color:#4a5a72;">
         Ahead of ${company ? `<strong>${company}</strong>'s` : "your"} Discovery Workshop with Valora Advisory,
         please complete our short Operational &amp; ESG Pre-Kickoff Assessment. It captures the
         baseline we need so the workshop starts with the groundwork already done.
       </p>
       <p style="font-size:13px;line-height:1.6;color:#4a5a72;">
         It takes about 10 minutes. You can upload supporting documents directly in the form.
         All data is handled securely under our NDA.
       </p>
       <a href="${link}" style="display:inline-block;background:${BRAND.gold};color:${BRAND.navy};font-weight:700;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:9px;margin:6px 0;">Start the assessment →</a>
       <p style="font-size:12px;color:#8a97a9;margin-top:14px;">Or paste this link into your browser:<br/>${link}</p>`,
      gatedNote
    )
  );
}

export function sendIdeaCreatedEmail(params: {
  to: string;
  ownerName: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  createdBy?: string;
}): Promise<SendResult> {
  const { to, ownerName, title, description, priority, tags } = params;
  const subject = `New idea logged: ${title}`;
  return deliver(to, subject, (gatedNote) =>
    shell(
      `A new idea was captured`,
      `<p style="font-size:14px;line-height:1.6;color:#4a5a72;">
         An idea has been added to the Idea Canvas${ownerName ? ` and assigned to <strong>${ownerName}</strong>` : ""}.
       </p>
       <div style="border:1px solid #e4e7ec;border-top:3px solid ${BRAND.gold};border-radius:10px;padding:16px;margin:16px 0;">
         <div style="font-size:15px;font-weight:650;margin-bottom:6px;">${title}</div>
         ${description ? `<div style="font-size:13px;color:#4a5a72;line-height:1.5;">${description}</div>` : ""}
         <div style="margin-top:12px;font-size:12px;color:#8a97a9;">
           Priority: <strong style="color:#16233a;">${priority}</strong>
           ${tags.length ? ` · Tags: ${tags.map((t) => `#${t}`).join(" ")}` : ""}
         </div>
       </div>
       <a href="https://valorina-ai.vercel.app/idea-canvas" style="display:inline-block;background:${BRAND.navy};color:#fff;font-weight:700;font-size:13px;text-decoration:none;padding:11px 20px;border-radius:9px;">View on the board →</a>`,
      gatedNote
    )
  );
}
