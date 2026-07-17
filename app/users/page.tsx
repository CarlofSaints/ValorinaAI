import Topbar from "@/components/Topbar";

const users = [
  { name: "Jerome Sagathevan", email: "jerome@valoraadvisory.co.za", role: "Administrator", roleClass: "badge-gold", status: "Active", last: "Online now", color: "#0f2542", initials: "JS" },
  { name: "Priya Naidoo", email: "priya@valoraadvisory.co.za", role: "Consultant", roleClass: "badge-navy", status: "Active", last: "12 min ago", color: "#8a6d1f", initials: "PN" },
  { name: "Thabo Molefe", email: "thabo@valoraadvisory.co.za", role: "Consultant", roleClass: "badge-navy", status: "Active", last: "1 hr ago", color: "#157f3b", initials: "TM" },
  { name: "Amina Patel", email: "amina@valoraadvisory.co.za", role: "Sales", roleClass: "badge-navy", status: "Active", last: "Yesterday", color: "#b45309", initials: "AP" },
  { name: "Sipho Dlamini", email: "sipho@valoraadvisory.co.za", role: "Analyst", roleClass: "badge-navy", status: "Active", last: "2 days ago", color: "#7c3aed", initials: "SD" },
  { name: "Client — Acme Retail", email: "ops@acmeretail.co.za", role: "Client (Read-only)", roleClass: "badge-gray", status: "Invited", last: "Pending", color: "#64748b", initials: "AR" },
];

export default function UsersPage() {
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
          <button className="btn btn-gold">+ Invite user</button>
        </div>

        <div className="stat-row">
          <div className="stat">
            <div className="label">Total users</div>
            <div className="value">6</div>
            <div className="delta">5 internal · 1 client</div>
          </div>
          <div className="stat">
            <div className="label">Active</div>
            <div className="value">5</div>
            <div className="delta">1 pending invite</div>
          </div>
          <div className="stat">
            <div className="label">Roles in use</div>
            <div className="value">5</div>
            <div className="delta">Admin, Consultant, Sales…</div>
          </div>
          <div className="stat">
            <div className="label">Seats available</div>
            <div className="value">14</div>
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
              {users.map((u) => (
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
                    <span className={`badge ${u.roleClass}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.status === "Active" ? "badge-green" : "badge-gray"}`}>
                      <span className="dot" /> {u.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--ink-soft)", fontSize: 13 }}>{u.last}</td>
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
