"use client";

import { useEffect, useRef, useState } from "react";

type OrbState = "idle" | "listening" | "thinking" | "speaking";

const EXAMPLES = [
  "Where is Acme Mining in the assessment process?",
  "Draft a first-draft proposal for Acme Mining",
  "Summarise the key pain points for our newest client",
  "What diagnostic questions should I ask a procurement team?",
];

export default function AskValorian() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<OrbState>("idle");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  function orb(state: OrbState) {
    setStatus(state);
    iframeRef.current?.contentWindow?.postMessage({ orbState: state }, "*");
  }

  // Return the orb to idle shortly after mount (in case it defaults elsewhere).
  useEffect(() => {
    const t = setTimeout(() => orb("idle"), 1200);
    return () => clearTimeout(t);
  }, []);

  async function ask(q: string) {
    const query = q.trim();
    if (!query || busy) return;
    setBusy(true);
    setAnswer(null);
    setPreview(false);
    orb("thinking");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: query }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      orb("speaking");
      setPreview(Boolean(json.preview));
      setAnswer(json.answer || "");
      // settle back to idle after "speaking"
      setTimeout(() => orb("idle"), 2600);
    } catch (e) {
      orb("idle");
      setAnswer(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const statusLabel: Record<OrbState, string> = {
    idle: "Ready when you are",
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "Valorian",
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 62px)",
        background: "radial-gradient(1200px 500px at 50% -5%, #12294a 0%, #0a1a2f 55%, #081426 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 20px 48px",
      }}
    >
      {/* Orb stage */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 560,
          height: 380,
          overflow: "hidden",
          marginTop: 6,
        }}
      >
        <iframe
          ref={iframeRef}
          src="/valorian-orb.html"
          title="Valorian"
          style={{ width: "100%", height: "100%", border: "none", background: "transparent" }}
        />
      </div>

      {/* Heading */}
      <div style={{ textAlign: "center", marginTop: 2 }}>
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", margin: 0 }}>
          Ask Valor<span style={{ color: "var(--gold)" }}>ian</span>
        </h1>
        <div
          style={{
            color: status === "thinking" ? "var(--gold-bright)" : "#8ea0b5",
            fontSize: 13,
            marginTop: 6,
            letterSpacing: "0.04em",
            transition: "color .2s",
          }}
        >
          {statusLabel[status]}
        </div>
      </div>

      {/* Ask box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        style={{ width: "100%", maxWidth: 640, marginTop: 20 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(200,162,76,0.35)",
            borderRadius: 14,
            padding: "8px 8px 8px 16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question or give a command…"
            disabled={busy}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 15,
              fontFamily: "inherit",
            }}
          />
          <button
            type="button"
            title="Voice input — coming soon"
            disabled
            aria-label="Voice input coming soon"
            style={{
              background: "transparent",
              border: "none",
              padding: "6px",
              cursor: "not-allowed",
              opacity: 0.4,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9fb0c3" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
          <button
            type="submit"
            disabled={busy || !question.trim()}
            className="btn btn-gold"
            style={{ padding: "10px 18px", opacity: busy || !question.trim() ? 0.6 : 1 }}
          >
            {busy ? "…" : "Ask"}
          </button>
        </div>
      </form>

      {/* Example chips */}
      {!answer && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 16, maxWidth: 680 }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setQuestion(ex);
                ask(ex);
              }}
              disabled={busy}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#b8c4d4",
                borderRadius: 999,
                padding: "7px 14px",
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div
          style={{
            width: "100%",
            maxWidth: 680,
            marginTop: 22,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
            padding: "18px 20px",
          }}
        >
          {preview && (
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--gold-bright)",
                marginBottom: 8,
              }}
            >
              Preview mode
            </div>
          )}
          <div style={{ color: "#e8edf3", fontSize: 14.5, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{answer}</div>
          <button
            onClick={() => {
              setAnswer(null);
              setQuestion("");
              orb("idle");
            }}
            style={{ marginTop: 14, background: "transparent", border: "none", color: "#8ea0b5", fontSize: 12.5, cursor: "pointer" }}
          >
            Ask something else
          </button>
        </div>
      )}
    </div>
  );
}
