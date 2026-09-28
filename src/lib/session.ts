import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "campusstay_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "campusstay-dev-secret-change-in-production"
);

export type SessionPayload = {
  userId: string;
  role: "student" | "landlord" | "admin";
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "string" || typeof payload.role !== "string") return null;
    return { userId: payload.userId, role: payload.role as SessionPayload["role"] };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user || user.status === "suspended") return null;
  return user;
}

export function homePathForRole(role: SessionPayload["role"]): string {
  return role === "admin" ? "/admin" : role === "landlord" ? "/landlord" : "/student";
}

export async function requireRole(...roles: SessionPayload["role"][]): Promise<User> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!roles.includes(session.role)) redirect(homePathForRole(session.role));
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
