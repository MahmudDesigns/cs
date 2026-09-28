"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, homePathForRole } from "@/lib/session";

export type AuthState = { error?: string } | null;

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email and password are required." };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return { error: "No account found with that email." };
  if (user.status === "suspended")
    return { error: "This account has been suspended. Contact the administrator." };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "Incorrect password. Please try again." };

  await createSession({ userId: user.id, role: user.role });
  redirect(homePathForRole(user.role));
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "landlord" ? "landlord" : "student";
  const phone = String(formData.get("phone") ?? "").trim();
  const university = String(formData.get("university") ?? "").trim();

  if (!name || !email || !password) return { error: "Please fill in all required fields." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { error: "An account with this email already exists. Try signing in." };

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role,
      phone: phone || null,
      university: role === "student" ? university || null : null,
    })
    .returning();

  await createSession({ userId: user.id, role: user.role });
  redirect(homePathForRole(user.role));
}

export async function demoLogin(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const which = String(formData.get("demo") ?? "student");
  const email =
    which === "admin"
      ? "admin@campusstay.app"
      : which === "landlord"
        ? "landlord@campusstay.app"
        : "student@campusstay.app";

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return { error: "Demo account not found — the database may still be seeding." };
  await createSession({ userId: user.id, role: user.role });
  redirect(homePathForRole(user.role));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
