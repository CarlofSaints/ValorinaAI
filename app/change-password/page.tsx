"use client";

import { useState } from "react";
import Image from "next/image";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      window.location.href = "/idea-canvas";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(180deg, var(--navy-900), var(--navy-850))", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <Image src="/valora-logo.png" alt="Valora Advisory" width={64} height={66} style={{ borderRadius: 12, margin: "0 auto" }} priority />
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: "0.14em", marginTop: 12 }}>
            VALOR<span style={{ color: "var(--gold)" }}>IAN</span>
          </div>
        </div>
        <form onSubmit={submit} className="card" style={{ padding: 26 }}>
          <h1 style={{ fontSize: 17, marginBottom: 4 }}>Set a new password</h1>
          <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 18 }}>
            Please choose your own password to continue.
          </div>
          <div className="field">
            <label>Current / temporary password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>New password (min 8 chars)</label>
            <input type="password" value={newPassword} onChange={(e) => setNew(e.target.value)} required minLength={8} />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
          </div>
          {error && (
            <div style={{ fontSize: 12.5, padding: "9px 12px", borderRadius: 8, background: "rgba(220,38,38,0.08)", color: "#b91c1c", border: "1px solid rgba(220,38,38,0.25)", marginBottom: 14 }}>
              ⚠ {error}
            </div>
          )}
          <button type="submit" className="btn btn-gold" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
            {busy ? "Saving…" : "Save & continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
