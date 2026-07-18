# Valorian AI — Project Notes

**Client:** Valora Advisory (valoraadvisory.co.za)
**Contact:** Jerome Sagathevan — CEO / Founder — jerome@valoraadvisory.co.za — 081 463 7342
**Our side:** OuterJoin (Carl Dos Santos)
**Product working name:** **Valorian** — the AI Business Analyst, given a name to bring it to life.
**Repo:** https://github.com/CarlofSaints/ValorinaAI
**Status:** Rebuilding project context after laptop theft (Jul 2026) wiped prior chats. This repo is now the single source of truth for notes + code.

> ⚠️ These notes were reconstructed from memory + the sent proposal + the client brief. Fill gaps with Jerome in the next session.

---

## 1. Project objective (from client brief)

Build an **internal AI Business Analyst** — a semi-custom AI workspace that supports Valora's consulting and sales teams by automating first-draft analytical tasks, preparing diagnostics, and standardising internal knowledge management. It's meant to be a core part of Valora's delivery & sales model: improve efficiency, reduce cost, strengthen diagnostic and proposal-prep capability.

## 2. Scope of work (client brief — 8 areas)

1. **Client Diagnostic Support** — document review, background summaries, pain-point identification, diagnostic questionnaires.
2. **Process Review Tools** — spot bottlenecks, inefficiencies, approval-chain issues, reporting delays.
3. **Report Drafting** — first drafts of diagnostic reports, quick-win recommendations, improvement roadmaps, client summaries.
4. **Proposal & Pitch Support** — draft proposals, pricing explanations, follow-up emails, presentation outlines.
5. **KPI & Dashboard Recommendations** — templates for procurement, inventory, maintenance, finance dashboards.
6. **Salesperson Support** — meeting prep, objection handling, CRM notes, structured follow-up.
7. **Knowledge Base** — diagnostic templates, proposal formats, case-study examples, sector-specific pain points.
8. **Workflow Automation** — integrate shared folders, forms, CRM notes, document templates.

## 3. Development requirements (client brief)

- Semi-custom AI workspace connected to internal templates and workflows.
- Secure handling of client and internal data.
- Able to scale into a more advanced diagnostic toolkit later.
- **Valora retains clear ownership of templates, business logic and methodology** (their IP).
- Ongoing support and maintenance options.

## 4. What we proposed (sent to Jerome)

- Engagement structured in **phases**, led by a **paid Discovery & Scoping session**.
- Rationale given to client: scope spans 8 broad areas; the scoping session turns that into a concrete, costed, sign-off-able plan **that Valora owns outright** — usable even if they don't proceed with us (they'd have a proper spec doc for other providers).
- **Only firm figure = the Discovery fee.** Build + support costs are indicative ranges until scoped.
- Positioning: "the AI is the engine, your knowledge is what makes it valuable" — IP stays with Valora.
- P.S. in the email proposed naming the BA **"Valorian"**.
- Proposal PDF (local): `eXceler8\OuterJoin - Clients\LEADS\VALORA\Valora-AI-Business-Analyst-Proposal - OUTERJOIN.pdf`

## 5. Remembered from meeting(s) with client

- **Meeting Agent:** they want an agent that can **sit in and listen to meetings and respond to questions when asked.** (Captured as a flagship idea on the Idea Canvas.)
- **CRMs = Jira AND Monday.com.** Valorian must integrate with both via API and (for Jira) **live inside Jira as its own user** — reading/creating issues, commenting, syncing ideas/tickets both ways. Treat them as systems of record; keep the two in step. (Both captured as high-priority ideas on the Idea Canvas + roadmap items in the sidebar.)
  - _Jira scope: Jira Cloud REST API + OAuth/app; a dedicated Jira account (or Atlassian Connect/Forge app) for the agent; field mapping Valorian ideas ↔ Jira issue types; webhooks for two-way sync._
  - _Monday.com scope: Monday API (GraphQL) + API token/OAuth; map boards/items/columns to Valorian ideas/tickets; webhooks for two-way sync._
- _[TODO: other requests discussed that Carl couldn't fully recall — confirm with Jerome and log here.]_

## 5a. Valora company profile (digested from valoraadvisory.co.za)

Stored in the app under **Knowledge Base** (`/knowledge`, `lib/valora.ts`) — this is the grounding context for the AI. Highlights:

- **Positioning:** "a consulting and implementation firm — built to close the gap between strategy and execution." Most firms hand over a strategy and leave; Valora pairs senior advisory with hands-on delivery. Taglines: _"Turning Insight into Impact"_ / _"Turning Operational Challenges Into Measurable Business Value."_
- **The cycle (their approach):** Diagnose → Design → Implement → Measure — "a disciplined cycle, executed in the open." (Aligns tightly with the brief's diagnostic/report focus.)
- **Service lines (7):** Business Process Optimization; Workflow Automation & Optimization; Systems Integration & Implementation; Data Analytics & Reporting; Cost Optimization Strategies; Carbon Footprint & ESG Reporting Support; AI Integration & Automation (every client gets a bespoke "AI Roadmap").
- **They already sell AI agents** — published catalogue: AI Receptionist, Sales AI, Finance AI, HR AI, Operations AI, Knowledge AI, Document AI, Executive AI. **Valorian should be positioned as their internal instance of exactly this** — strong alignment.
- **Proof points they cite:** 40%+ avg process improvement · 30% avg cost reduction · 24/7 agents · 10+ industries · ~1,000 AI engineers in their network. Sector-agnostic (mining, manufacturing, retail, financial services mentioned).
- **Tone:** professional yet accessible; confident, pragmatic, outcomes-focused; "outcomes on the P&L, not on a pilot dashboard."

## 5b. Client's detailed capability spec — "Main Tasks the AI Business Analyst Can Perform" (received from client, 17 Jul 2026)

Verbatim-faithful capture of what the client wants Valorian to do. This supersedes the vaguer memory of "other asks" — treat as the authoritative task list.

> 🎯 **CURRENT FOCUS (per Carl, 17 Jul): A and E.** Build depth on **A. Client Diagnostic Preparation** and **E. Proposal & Pitch Support** first; B/C/D/F/G/H come later. The Assessments intake feature already feeds A (structured client data in); the AI diagnostic-prep + proposal-draft generation (needs Anthropic key + the lead's website/online info) is the priority next build.

**A. Client Diagnostic Preparation** — review client materials (company profiles, reports, SOPs, policies, spreadsheets, process descriptions, meeting notes, previous presentations) and prepare: client background summaries; key business issues; possible operational pain points; suggested diagnostic questions; department-specific interview guides; initial risk areas; possible improvement themes. → Prepare faster before meeting a client / running a diagnostic.

**B. Process Review & Bottleneck Identification** — review "as-is" processes and flag: duplicated steps; manual workflows; unclear approval chains; reporting delays; weak accountability points; repeated data entry; possible control gaps; slow handovers between departments; potential cost leakage. Especially in procurement, finance, HR, operations, maintenance, inventory, reporting, project management.

**C. Diagnostic Question Generation** — structured diagnostic questions per client/department. E.g. Procurement: supplier onboarding, approval processes, PO tracking, payment terms, stock availability, cost visibility, supplier performance, procurement cycle time. Reporting: KPI ownership, reporting frequency, data sources, dashboard availability, Excel dependency, manual report prep, report accuracy, management decision-making. Supports both sales and analyst teams.

**D. Report Drafting** — first drafts of: diagnostic reports; bottleneck maps; quick-win recommendations; improvement roadmaps; implementation plans; client summaries; monthly performance reports; internal briefing notes. Humans review/refine; saves significant time.

**E. Proposal & Pitch Support** — draft: client-specific proposals; pilot implementation scopes; pricing explanations; meeting follow-up emails; executive summaries; sector-specific talking points; client presentation outlines. Important for the salesperson to respond quickly and professionally.

**F. KPI & Dashboard Recommendations** — suggest KPIs + dashboard structures from the client's problem. Procurement: procurement cycle time, pending approvals, supplier lead time, overdue deliveries, top suppliers by spend, emergency purchases, PO status. Inventory: stock availability, slow-moving items, stockouts, reorder levels, safety stock, consumption trends. Maintenance: downtime, maintenance turnaround time, open work orders, recurring failures, spare parts availability. Finance: cost trends, overdue payments, budget variance, cash-flow pressure points. → Prepare dashboard concepts before involving technical delivery.

**G. Salesperson Support** — support the Business Development & Solutions Consultant to prep for meetings: industry-specific client questions; objection-handling responses; follow-up emails; CRM notes; meeting summaries; client qualification notes; draft proposals; commercial next-step recommendations. NB the client explicitly wants the salesperson to be "more than a normal salesperson" — understand client problems and position Valora's solutions intelligently.

**H. Knowledge Base for Valora** — over time become the internal knowledge base for Valora's methodology: diagnostic templates; proposal templates; sector-specific pain points; pricing guidance; objection-handling language; client meeting questions; sample deliverables; case study formats; dashboard examples; improvement roadmap templates. → Standardize delivery, avoid reinventing the wheel per client.

_These map cleanly onto the build so far: the Idea Canvas (capture), the Assessments/intake feature (A + C — client diagnostic gathering), and the Knowledge Base (H). D/E/F/G are the AI-generation surfaces to build once an Anthropic key + RAG are in._

## 5c. Security / auth roadmap

- **Done:** per-user login (Blob-backed users, scrypt hashes, HMAC session cookie), route protection via middleware, admin add/remove/reset users, welcome email with credentials, **force-password-change on first login** (flag in session cookie + re-issued on change → no redirect loop; Blob live-read avoids the env-var lag that looped Defy-Field-Execute).
- **Eventually — MFA (client wants, staged):** (1) email confirmation to verify a new user's email; (2) OTP via email; (3) OTP via SMS; (4) authenticator-app TOTP (Authy / Microsoft Authenticator). Build in that order.
- **Also pending:** a self-service change-password entry point for already-logged-in users (currently only forced-change or admin reset); real email go-live (`EMAIL_GO_LIVE=true`, set via Vercel dashboard not PowerShell) so credential/welcome emails actually reach users.

## 6. Open questions for next session

- Confirm the full list of asks from the earlier meeting (memory gaps).
- Which of the 8 scope areas are Phase 1 vs later?
- Data security / hosting constraints (POPIA — SA data protection; where can client docs live?).
- Preferred integrations (shared folders = SharePoint / Google Drive? CRM in use?).
- Sign-off + timeline for the paid Discovery session.

---

## 7. This prototype (what's in the repo)

A branded Next.js workspace demo to show Jerome direction and momentum:

- **Idea Canvas** — capture ideas with owner, date, priority, custom tags, image/file uploads. Persists in-browser for the demo. Seeded with the real asks (Meeting Agent, diagnostics, proposals, knowledge base).
- **Users** — team + client access overview (demo data).
- **Roles & Permissions** — Admin / Consultant / Sales / Analyst / Client-read-only, mapped to capabilities. Reflects "secure handling of data" + Valora IP ownership.
- **Roadmap items** shown in the sidebar (Meeting Agent, Client Diagnostics, Knowledge Base) to signal where this goes next.

Branding pulled from valoraadvisory.co.za + email signature: **navy (#0a1a2f) + gold (#c8a24c)**, tagline "Turning Insight into Impact".

_Prototype only — not the production architecture. No client data stored server-side yet._
