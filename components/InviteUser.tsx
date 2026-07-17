"use client";

import { useState } from "react";
import { inviteUserAction } from "@/app/actions";

const ROLES = ["Administrator", "Consultant", "Sales", "Analyst", "Client (Read-only)"];

export default function InviteUser() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await inviteUserAction(fd);
      setStatus({ ok: res.ok, msg: res.message });
      if (res.ok) e.currentTarget.reset();
    } catch {
      setStatus({ ok: false, msg: "Something went wrong sending the invite." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <button className="btn btn-gold" onClick={() => setOpen((o) => !o)}>
        + Invite user
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: 340,
            padding: 18,
            zIndex: 20,
            boxShadow: "0 12px 40px rgba(16,37,66,0.18)",
          }}
        >
          <h3 style={{ fontSize: 15, marginBottom: 3 }}>Invite a user</h3>
          <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 14 }}>
            They&apos;ll receive a Valorian welcome email.
          </div>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Name</label>
              <input type="text" name="name" placeholder="Full name" />
            </div>
            <div className="field">
              <label>Email *</label>
              <input type="email" name="email" placeholder="name@valoraadvisory.co.za" required />
            </div>
            <div className="field">
              <label>Role</label>
              <select name="role" defaultValue="Consultant">
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {sending ? "Sending…" : "Send invite"}
            </button>
          </form>
          {status && (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                padding: "9px 12px",
                borderRadius: 8,
                background: status.ok ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
                color: status.ok ? "#157f3b" : "#b91c1c",
                border: `1px solid ${status.ok ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"}`,
              }}
            >
              {status.ok ? "✓ " : "⚠ "}
              {status.msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
