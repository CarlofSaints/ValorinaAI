import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { VALORA } from "@/lib/valora";
import { listLeads } from "@/lib/assessment-store";

export const runtime = "nodejs";

const MODEL = "claude-opus-4-8";

function previewAnswer(question: string): string {
  return (
    `I'm Valorian — but my AI engine isn't switched on yet, so this is a preview.\n\n` +
    `Once an Anthropic API key is added, I'll answer "${question}" for real: grounded in Valora's ` +
    `methodology and knowledge base, and able to pull live client/assessment status, draft diagnostics, ` +
    `and build first-draft proposals.`
  );
}

async function buildContext(): Promise<string> {
  const services = VALORA.services.map((s) => `- ${s.name}`).join("\n");
  const cycle = VALORA.cycle.map((c) => c.step).join(" → ");
  let clients = "No client assessments on record yet.";
  try {
    const leads = await listLeads();
    if (leads.length) {
      clients = leads
        .map(
          (l) =>
            `- ${l.company}: ${l.status === "submitted" ? "assessment submitted" : "assessment sent, awaiting response"}` +
            (l.website ? ` (${l.website})` : "")
        )
        .join("\n");
    }
  } catch {
    /* store not ready — omit */
  }

  return `You are **Valorian**, Valora Advisory's internal AI Business Analyst, used by their consulting and sales teams.

ABOUT VALORA ADVISORY
${VALORA.positioning}
Tagline: "${VALORA.tagline}". Engagement cycle: ${cycle}.
Service lines:
${services}

CURRENT CLIENT ASSESSMENTS (live status):
${clients}

HOW TO RESPOND
- Be concise, practical and outcomes-focused — write in Valora's voice.
- For questions about where a client is "in the process", use the live assessment status above.
- For diagnostic prep or proposal/pitch drafts, produce a genuinely useful first draft the human team can refine.
- If you don't have enough information, say what you'd need. Never invent client facts.`;
}

export async function POST(req: NextRequest) {
  let question = "";
  try {
    const body = await req.json();
    question = String(body.question || "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!question) return NextResponse.json({ error: "Ask me something." }, { status: 400 });

  // Preview mode until the AI engine is connected.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ answer: previewAnswer(question), preview: true });
  }

  try {
    const client = new Anthropic();
    const system = await buildContext();
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system,
      messages: [{ role: "user", content: question }],
    });
    const answer = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return NextResponse.json({ answer: answer || "(no response)", preview: false });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Valorian could not respond." },
      { status: 500 }
    );
  }
}
