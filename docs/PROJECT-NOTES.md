# Valorina AI — Project Notes

**Client:** Valora Advisory (valoraadvisory.co.za)
**Contact:** Jerome Sagathevan — CEO / Founder — jerome@valoraadvisory.co.za — 081 463 7342
**Our side:** OuterJoin (Carl Dos Santos)
**Product working name:** **Valorina** — the AI Business Analyst, given a name to bring it to life.
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
- P.S. in the email proposed naming the BA **"Valorina"**.
- Proposal PDF (local): `eXceler8\OuterJoin - Clients\LEADS\VALORA\Valora-AI-Business-Analyst-Proposal - OUTERJOIN.pdf`

## 5. Remembered from meeting(s) with client

- **Meeting Agent:** they want an agent that can **sit in and listen to meetings and respond to questions when asked.** (Captured as the flagship idea on the Idea Canvas.)
- _[TODO: several other requests discussed that Carl couldn't fully recall — confirm with Jerome and log here.]_

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
