import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE, Session } from "./session";

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  return verifySession(c.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(): Promise<Session | null> {
  const s = await getSession();
  return s && s.role === "Administrator" ? s : null;
}
