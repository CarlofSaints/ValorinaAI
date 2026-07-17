import Topbar from "@/components/Topbar";
import { VALORA } from "@/lib/valora";

export default function KnowledgePage() {
  return (
    <>
      <Topbar title="Knowledge Base" crumb="Workspace / Knowledge Base" />
      <div className="content">
        <div className="page-head">
          <div>
            <h2>Knowledge Base</h2>
            <p>
              Valora Advisory&apos;s profile, methodology and service lines — the
              grounding context Valorina draws on to sound like Valora, run
              diagnostics its way, and stay aligned to how the firm actually
              works.
            </p>
          </div>
        </div>

        <div className="notice">
          🧠 Digested from {VALORA.source}. This is the same context that feeds
          Valorina&apos;s AI — keep it current and the assistant stays on-brand.
        </div>

        {/* Positioning */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div className="badge badge-gold" style={{ marginBottom: 12 }}>
            Who Valora is
          </div>
          <div style={{ fontSize: 20, fontWeight: 680, letterSpacing: "-0.02em", marginBottom: 6 }}>
            {VALORA.tagline}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, maxWidth: 720 }}>
            {VALORA.positioning}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 12 }}>
            {VALORA.reach}
          </div>
        </div>

        {/* Proof points */}
        <div className="stat-row">
          {VALORA.proofPoints.map((p) => (
            <div className="stat" key={p.label}>
              <div className="value" style={{ color: "var(--navy-800)" }}>{p.value}</div>
              <div className="delta">{p.label}</div>
            </div>
          ))}
        </div>

        {/* The cycle */}
        <SectionTitle>The Valora cycle — “a disciplined cycle, executed in the open”</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 14,
            marginBottom: 26,
          }}
        >
          {VALORA.cycle.map((c, i) => (
            <div className="card" key={c.step} style={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "var(--navy-800)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
                <strong style={{ fontSize: 14 }}>{c.step}</strong>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                {c.text}
              </div>
            </div>
          ))}
        </div>

        {/* Services */}
        <SectionTitle>Service lines</SectionTitle>
        <div className="role-grid" style={{ marginBottom: 26 }}>
          {VALORA.services.map((s) => (
            <div className="card" key={s.name} style={{ padding: 18 }}>
              <strong style={{ fontSize: 13.5 }}>{s.name}</strong>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5, marginTop: 6 }}>
                {s.text}
              </div>
            </div>
          ))}
        </div>

        {/* Agent catalogue */}
        <SectionTitle>
          AI agent catalogue{" "}
          <span style={{ fontWeight: 400, color: "var(--ink-faint)", fontSize: 13 }}>
            — Valora&apos;s own published agents; the shape Valorina grows into
          </span>
        </SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 26,
          }}
        >
          {VALORA.agentCatalogue.map((a) => (
            <div className="card" key={a.name} style={{ padding: 15, display: "flex", gap: 11 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "var(--gold-soft)",
                  color: "#8a6d1f",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  fontSize: 14,
                }}
              >
                ✦
              </div>
              <div>
                <strong style={{ fontSize: 13 }}>{a.name}</strong>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.45, marginTop: 2 }}>
                  {a.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Integrations */}
        <SectionTitle>Integrations — systems of record</SectionTitle>
        <div className="role-grid" style={{ marginBottom: 26 }}>
          {VALORA.integrations.map((it) => (
            <div className="card" key={it.name} style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <strong style={{ fontSize: 14 }}>{it.name}</strong>
                <span className="badge badge-navy" style={{ fontSize: 10 }}>{it.role}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5, marginTop: 8 }}>
                {it.text}
              </div>
              <span className="badge badge-gold" style={{ marginTop: 12, fontSize: 10 }}>
                <span className="dot" /> Planned integration
              </span>
            </div>
          ))}
        </div>

        {/* Differentiators */}
        <SectionTitle>What makes Valora different</SectionTitle>
        <div className="card" style={{ padding: 20 }}>
          {VALORA.differentiators.map((d) => (
            <div
              key={d}
              style={{
                display: "flex",
                gap: 10,
                padding: "9px 0",
                borderBottom: "1px solid var(--border)",
                fontSize: 13,
                color: "var(--ink-soft)",
              }}
            >
              <span className="check">✓</span>
              {d}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--ink-faint)",
        fontWeight: 700,
        margin: "4px 0 12px",
      }}
    >
      {children}
    </div>
  );
}
