// Session cookie signing/verification using Web Crypto (HMAC-SHA256) so it
// works in BOTH edge middleware and node route handlers. No node-only imports.

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
const enc = new TextEncoder();

export interface Session {
  email: string;
  name: string;
  role: string;
  exp: number;
  mustChange?: boolean;
}

function toB64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function fromB64Url(b: string): string {
  const s = b.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(s)));
}
function bytesToB64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(payload: Omit<Session, "exp"> & { exp?: number }): Promise<string> {
  const full: Session = {
    ...payload,
    exp: payload.exp ?? Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const body = toB64Url(JSON.stringify(full));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(body));
  return `${body}.${bytesToB64Url(sig)}`;
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  try {
    const expected = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(body));
    if (bytesToB64Url(expected) !== sig) return null;
    const payload = JSON.parse(fromB64Url(body)) as Session;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "valorian_session";
