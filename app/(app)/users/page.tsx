"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import InviteUser from "@/components/InviteUser";

interface PublicUser {
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

const ROLES = ["Administrator", "Consultant", "Sales", "Analyst", "Client (Read-only)"];

const roleClass: Record<string, string> = {
  Administrator: "badge-gold",
  "Client (Read-only)": "badge-gray",
};

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || "") + (p[1]?.[0] || p[0]?.[1] || "")).toUpperCase();
}
function colorFor(name: string) {
  const colors = ["#0f2542", "#8a6d1f", "#157f3b", "#b45309", "#7c3aed", "#0e7490"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export default function UsersPage() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [me, setMe] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Consultant");
  const [password, setPassword] = useState("");
  const [mustChange, setMustChange] = useState(true);
  const [resetInfo, setResetInfo] = useState<{ email: string; password: string; msg: string } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("Consultant");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      setUsers(json.users || []);
      setMe(json.me || null);
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = me?.role === "Administrator";

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, role, password, mustChangePassword: mustChange }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setStatus({
        ok: true,
        msg: `${name || email} added. ${json.emailStatus || "Share their password securely."}`,
      });
      setName("");
      setEmail("");
      setPassword("");
      setRole("Consultant");
      setMustChange(true);
      refresh();
    } catch (err) {
      setStatus({ ok: false, msg: err instanceof Error ? err.message : "Failed" });
    } finally {
      setBusy(false);
    }
  }

  async function remove(u: PublicUser) {
    if (!confirm(`Remove ${u.name}? They will no longer be able to sign in.`)) return;
    const res = await fetch(`/api/users?email=${encodeURIComponent(u.email)}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((x) => x.email !== u.email));
    else {
      const j = await res.json();
      alert(j.error || "Could not remove user");
    }
  }

  async function resetPw(u: PublicUser) {
    if (!confirm(`Reset ${u.name}'s password? A new auto-generated password will be set and they'll be required to change it on next sign-in.`)) return;
    setResetInfo(null);
    const res = await fetch("/api/users/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: u.email }),
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || "Reset failed");
      return;
    }
    setResetInfo({ email: u.email, password: json.password, msg: json.emailStatus || "" });
  }

  function startEdit(u: PublicUser) {
    setEditing(u.email);
    setEditName(u.name);
    setEditRole(u.role);
  }
  async function saveEdit(u: PublicUser) {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: u.email, name: editName, role: editRole }),
    });
    if (res.ok) {
      setEditing(null);
      refresh();
    } else {
      const j = await res.json();
      alert(j.error || "Update failed");
    }
  }

  return (
    <>
      <Topbar title="Users" crumb="Workspace / Users" />
      <div className="content">
        <div className="page-head">
          <div>
            <h2>Users</h2>
            <p>
              People who can sign in to the Valorian workspace. Admins can add a
              user and set their password here, or send an email invite.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {isAdmin && (
              <button className="btn btn-gold" onClick={() => setOpen((o) => !o)}>
                + Add user
              </button>
            )}
            <InviteUser />
          </div>
        </div>

        {isAdmin && open && (
          <form className="card" style={{ padding: 22, marginBottom: 20 }} onSubmit={addUser}>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Add a user &amp; set their password</h3>
            <div className="two-col">
              <div className="field">
                <label>Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jerome Sagathevan" />
              </div>
              <div className="field">
                <label>Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jerome@valoraadvisory.co.za" />
              </div>
            </div>
            <div className="two-col">
              <div className="field">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Password * <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(min 8 chars)</span></label>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="set a password to share" />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)", marginBottom: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={mustChange} onChange={(e) => setMustChange(e.target.checked)} />
              Require password change on first sign-in
            </label>
            <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 12 }}>
              The password is shown here so you can copy and share it securely. It&apos;s stored only as a salted hash.
              A welcome email with these details is sent to the user (redirected to the test inbox until go-live).
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Adding…" : "Add user"}
            </button>
            {status && (
              <div style={{ marginTop: 12, fontSize: 12.5, padding: "9px 12px", borderRadius: 8, background: status.ok ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)", color: status.ok ? "#157f3b" : "#b91c1c", border: `1px solid ${status.ok ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"}` }}>
                {status.ok ? "✓ " : "⚠ "}{status.msg}
              </div>
            )}
          </form>
        )}

        {resetInfo && (
          <div className="card" style={{ padding: 16, marginBottom: 16, borderLeft: "3px solid var(--gold)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>New password for {resetInfo.email}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <code style={{ background: "#f5f6f8", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }}>{resetInfo.password}</code>
              <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => navigator.clipboard.writeText(resetInfo.password)}>Copy</button>
              <button className="del-idea" style={{ padding: "6px 8px" }} onClick={() => setResetInfo(null)}>Dismiss</button>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 8 }}>
              They&apos;ll be required to change it on next sign-in. {resetInfo.msg}
            </div>
          </div>
        )}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Added</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ color: "var(--ink-faint)" }}>Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} style={{ color: "var(--ink-faint)", textAlign: "center", padding: 30 }}>No users yet.</td></tr>
              ) : (
                users.map((u) => {
                  const isEditing = editing === u.email;
                  return (
                    <tr key={u.email}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar" style={{ background: colorFor(u.name) }}>{initials(u.name)}</div>
                          <div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                style={{ padding: "5px 8px", border: "1px solid var(--border-strong)", borderRadius: 6, fontSize: 13, width: 200 }}
                              />
                            ) : (
                              <div className="user-name">
                                {u.name}
                                {me?.email === u.email && <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}> (you)</span>}
                              </div>
                            )}
                            <div className="user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {isEditing ? (
                          <select value={editRole} onChange={(e) => setEditRole(e.target.value)} style={{ padding: "5px 8px", border: "1px solid var(--border-strong)", borderRadius: 6, fontSize: 13 }}>
                            {ROLES.map((r) => (<option key={r}>{r}</option>))}
                          </select>
                        ) : (
                          <span className={`badge ${roleClass[u.role] || "badge-navy"}`}>{u.role}</span>
                        )}
                      </td>
                      <td style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          {isEditing ? (
                            <>
                              <button className="btn btn-primary" style={{ padding: "6px 12px", marginRight: 6 }} onClick={() => saveEdit(u)}>Save</button>
                              <button className="btn btn-ghost" style={{ padding: "6px 10px" }} onClick={() => setEditing(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-ghost" style={{ padding: "6px 10px", marginRight: 6 }} onClick={() => startEdit(u)}>Edit</button>
                              <button className="btn btn-ghost" style={{ padding: "6px 10px", marginRight: 6 }} onClick={() => resetPw(u)}>Reset PW</button>
                              {me?.email !== u.email && (
                                <button className="del-idea" style={{ padding: "6px 8px" }} onClick={() => remove(u)}>Remove</button>
                              )}
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
