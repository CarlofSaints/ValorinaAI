import Topbar from "@/components/Topbar";
import InviteUser from "@/components/InviteUser";
import { TEAM } from "@/lib/team";

const roleClass: Record<string, string> = {
  Administrator: "badge-gold",
  Consultant: "badge-navy",
  Sales: "badge-navy",
  Analyst: "badge-navy",
  "Client (Read-only)": "badge-gray",
};

const lastActive: Record<string, string> = {
  "jerome@valoraadvisory.co.za": "Online now",
  "kerrelisa@valoraadvisory.co.za": "12 min ago",
  "omar@valoraadvisory.co.za": "1 hr ago",
  "jihane@valoraadvisory.co.za": "Yesterday",
};

export default function UsersPage() {
  const rolesInUse = new Set(TEAM.map((u) => u.role)).size;

  return (
    <>
      <Topbar title="Users" crumb="Workspace / Users" />
      <div className="content">
        <div className="page-head">
          <div>
            <h2>Users</h2>
            <p>
              Everyone with access to the Valorina workspace. Invite colleagues,
              assign a role, and control what each person can see and do.
            </p>
          </div>
          <InviteUser />
        </div>

        <div className="stat-row">
          <div className="stat">
            <div className="label">Total users</div>
            <div className="value">{TEAM.length}</div>
            <div className="delta">Valora Advisory team</div>
          </div>
          <div className="stat">
            <div className="label">Active</div>
            <div className="value">{TEAM.length}</div>
            <div className="delta">All accounts enabled</div>
          </div>
          <div className="stat">
            <div className="label">Roles in use</div>
            <div className="value">{rolesInUse}</div>
            <div className="delta">Admin, Consultant, Sales…</div>
          </div>
          <div className="stat">
            <div className="label">Seats available</div>
            <div className="value">{20 - TEAM.length}</div>
            <div className="delta">of 20 on current plan</div>
          </div>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {TEAM.map((u) => (
                <tr key={u.email}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar" style={{ background: u.color }}>
                        {u.initials}
                      </div>
                      <div>
                        <div className="user-name">{u.name}</div>
                        <div className="user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${roleClass[u.role] || "badge-navy"}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className="badge badge-green">
                      <span className="dot" /> Active
                    </span>
                  </td>
                  <td style={{ color: "var(--ink-soft)", fontSize: 13 }}>
                    {lastActive[u.email] || "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "6px 12px" }}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
