import "server-only";
import { put, get } from "@vercel/blob";
import { hashPassword, verifyPassword } from "./auth-password";

// Blob-backed user store (no DB yet). Single private JSON manifest.
const PATH = "auth/users.json";

export interface AppUser {
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  createdAt: string;
  mustChangePassword?: boolean;
}

export type PublicUser = Omit<AppUser, "passwordHash">;

function strip(u: AppUser): PublicUser {
  const { passwordHash, ...rest } = u;
  void passwordHash;
  return rest;
}

async function readAll(): Promise<AppUser[]> {
  try {
    // useCache:false — auth correctness needs read-after-write consistency;
    // the default cache would serve a stale user list right after adding someone.
    const res = await get(PATH, { access: "private", useCache: false });
    if (!res || res.statusCode !== 200) return [];
    const text = await new Response(res.stream).text();
    return JSON.parse(text) as AppUser[];
  } catch {
    return [];
  }
}

async function writeAll(users: AppUser[]) {
  await put(PATH, JSON.stringify(users, null, 2), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  });
}

export async function countUsers(): Promise<number> {
  return (await readAll()).length;
}

export async function listUsers(): Promise<PublicUser[]> {
  return (await readAll()).map(strip).sort((a, b) => a.name.localeCompare(b.name));
}

export async function findUser(email: string): Promise<AppUser | null> {
  const e = email.trim().toLowerCase();
  return (await readAll()).find((u) => u.email.toLowerCase() === e) || null;
}

export async function addUser(input: {
  email: string;
  name: string;
  role: string;
  password: string;
  mustChangePassword?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Invalid email." };
  if ((input.password || "").length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  const users = await readAll();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, error: "A user with that email already exists." };
  }
  users.push({
    email,
    name: input.name.trim() || email,
    role: input.role || "Consultant",
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
    mustChangePassword: input.mustChangePassword ?? false,
  });
  await writeAll(users);
  return { ok: true };
}

// Admin sets a new password AND forces the user to change it on next login.
export async function adminResetPassword(email: string, password: string): Promise<boolean> {
  const users = await readAll();
  const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) return false;
  u.passwordHash = hashPassword(password);
  u.mustChangePassword = true;
  await writeAll(users);
  return true;
}

// The user chooses their own new password — clears the force-change flag.
export async function userChangePassword(email: string, password: string): Promise<boolean> {
  const users = await readAll();
  const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) return false;
  u.passwordHash = hashPassword(password);
  u.mustChangePassword = false;
  await writeAll(users);
  return true;
}

export async function updateUser(
  email: string,
  changes: { name?: string; role?: string }
): Promise<{ ok: boolean; error?: string }> {
  const users = await readAll();
  const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) return { ok: false, error: "User not found." };
  if (typeof changes.name === "string" && changes.name.trim()) u.name = changes.name.trim();
  if (typeof changes.role === "string" && changes.role.trim()) u.role = changes.role.trim();
  await writeAll(users);
  return { ok: true };
}

export async function deleteUser(email: string): Promise<void> {
  const users = await readAll();
  await writeAll(users.filter((u) => u.email.toLowerCase() !== email.trim().toLowerCase()));
}

export async function verifyLogin(email: string, password: string): Promise<AppUser | null> {
  const u = await findUser(email);
  if (!u) return null;
  return verifyPassword(password, u.passwordHash) ? u : null;
}
