"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const nav = [
  {
    href: "/idea-canvas",
    label: "Idea Canvas",
    icon: (
      <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z" />
    ),
  },
  {
    href: "/assessments",
    label: "Assessments",
    icon: (
      <>
        <path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    href: "/users",
    label: "Users",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M16 6.5a3 3 0 0 1 0 5.6M17 20a5.5 5.5 0 0 0-2.5-4.6" />
      </>
    ),
  },
  {
    href: "/roles",
    label: "Roles & Permissions",
    icon: (
      <>
        <path d="M12 2.5l7 3v5c0 4.6-3 8.4-7 10.5-4-2.1-7-5.9-7-10.5v-5l7-3z" />
        <path d="M9 11.5l2 2 4-4" />
      </>
    ),
  },
  {
    href: "/knowledge",
    label: "Knowledge Base",
    icon: <path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" />,
  },
];

const future = [
  {
    label: "Meeting Agent",
    icon: <path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4zM5 11a7 7 0 0 0 14 0M12 18v3" />,
  },
  {
    label: "Jira Sync",
    icon: (
      <>
        <path d="M4 12h10M4 7h13M4 17h7" />
        <circle cx="18.5" cy="16.5" r="2.6" />
      </>
    ),
  },
  {
    label: "Monday.com Sync",
    icon: (
      <>
        <circle cx="6" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
      </>
    ),
  },
  {
    label: "Client Diagnostics",
    icon: <path d="M4 5h16M4 12h16M4 19h10" />,
  },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <div className="brand">
        <Image
          src="/valora-logo.png"
          alt="Valora Advisory"
          width={224}
          height={230}
          className="brand-logo"
          priority
        />
        <div className="brand-name">
          VALOR<span>IAN</span>
        </div>
        <div className="brand-tag">AI Business Analyst</div>
      </div>

      <nav className="nav">
        <div className="nav-label">Workspace</div>
        {nav.map((n) => {
          const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`nav-item${active ? " active" : ""}`}
            >
              <svg
                className="ico"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {n.icon}
              </svg>
              {n.label}
            </Link>
          );
        })}

        <div className="nav-label">Roadmap</div>
        {future.map((f) => (
          <div key={f.label} className="nav-item" style={{ opacity: 0.5, cursor: "default" }}>
            <svg
              className="ico"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {f.icon}
            </svg>
            {f.label}
            <span
              style={{
                marginLeft: "auto",
                fontSize: 9,
                letterSpacing: "0.08em",
                color: "#6b7d94",
                border: "1px solid #2a3c56",
                padding: "1px 5px",
                borderRadius: 4,
              }}
            >
              SOON
            </span>
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "#b8c4d4",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
        <strong>Valora Advisory</strong>
        <br />
        Turning Insight into Impact
      </div>
    </aside>
  );
}
