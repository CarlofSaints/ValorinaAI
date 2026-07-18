"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      const next = new URLSearchParams(window.location.search).get("next") || "/ask";
      window.location.href = next;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg, var(--navy-900), var(--navy-850))",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <Image src="/valora-logo.png" alt="Valora Advisory" width={72} height={74} style={{ borderRadius: 12, margin: "0 auto" }} priority />
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: "0.14em", marginTop: 14 }}>
            VALOR<span style={{ color: "var(--gold)" }}>IAN</span>
          </div>
          <div style={{ color: "var(--gold)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            AI Business Analyst
          </div>
        </div>

        <form onSubmit={submit} className="card" style={{ padding: 26 }}>
          <h1 style={{ fontSize: 17, marginBottom: 4 }}>Sign in</h1>
          <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 18 }}>
            Valora Advisory internal workspace.
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required placeholder="you@valoraadvisory.co.za" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && (
            <div style={{ fontSize: 12.5, padding: "9px 12px", borderRadius: 8, background: "rgba(220,38,38,0.08)", color: "#b91c1c", border: "1px solid rgba(220,38,38,0.25)", marginBottom: 14 }}>
              ⚠ {error}
            </div>
          )}

          <button type="submit" className="btn btn-gold" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
