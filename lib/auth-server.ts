import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE, Session } from "./session";
import { can } from "./roles-store";

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  return verifySession(c.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(): Promise<Session | null> {
  const s = await getSession();
  return s && s.role === "Administrator" ? s : null;
}

// Returns the session only if the caller's role holds the given permission.
export async function requirePermission(permId: string): Promise<Session | null> {
  const s = await getSession();
  if (!s) return null;
  return (await can(s.role, permId)) ? s : null;
}
