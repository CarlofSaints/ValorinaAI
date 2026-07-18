import { NextRequest, NextResponse } from "next/server";
import { introspectBoard, hasMondayToken } from "@/lib/monday";

export const runtime = "nodejs";

// Setup helper: given a board id, return its columns + one sample item so we
// can build the field mapping. Guarded by the webhook secret.
export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const secret = params.get("secret");
  const boardId = params.get("id");

  // Temporary diagnostic (no value leak): confirm the secret env is wired.
  if (secret === "__diag__") {
    const env = process.env.MONDAY_WEBHOOK_SECRET;
    return NextResponse.json({
      hasSecret: Boolean(env),
      secretLen: env ? env.length : 0,
      hasToken: Boolean(process.env.MONDAY_API_TOKEN),
    });
  }

  if (!process.env.MONDAY_WEBHOOK_SECRET || secret !== process.env.MONDAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasMondayToken()) {
    return NextResponse.json({ error: "MONDAY_API_TOKEN not set" }, { status: 400 });
  }
  if (!boardId) {
    return NextResponse.json({ error: "Missing board id (?id=)" }, { status: 400 });
  }

  try {
    const board = await introspectBoard(boardId);
    if (!board) return NextResponse.json({ error: "Board not found" }, { status: 404 });
    return NextResponse.json(board);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Introspection failed" },
      { status: 500 }
    );
  }
}
