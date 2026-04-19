"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import * as z from "zod";

const SignupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(1, "Display name required").max(100),
  collegeYears: z.coerce.number().min(1).max(6),
  registrationNo: z.string().optional(),
  enrollmentNo: z.string().optional(),
});

const LoginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    displayName: formData.get("displayName") as string,
    collegeYears: formData.get("collegeYears") as string,
    registrationNo: (formData.get("registrationNo") as string) || undefined,
    enrollmentNo: (formData.get("enrollmentNo") as string) || undefined,
  };

  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  // Check if username taken
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, parsed.data.username))
    .limit(1);

  if (existing.length > 0) {
    return { error: "Username already taken" };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const [newUser] = await db
    .insert(users)
    .values({
      username: parsed.data.username,
      passwordHash,
      displayName: parsed.data.displayName,
      collegeYears: parsed.data.collegeYears,
      registrationNo: parsed.data.registrationNo || null,
      enrollmentNo: parsed.data.enrollmentNo || null,
    })
    .returning();

  // Create session
  const session = await getSession();
  session.userId = newUser.id;
  session.username = newUser.username;
  session.displayName = newUser.displayName;
  session.avatarUrl = newUser.avatarUrl;
  session.isAdmin = newUser.isAdmin;
  session.isSuspended = newUser.isSuspended;
  session.isLoggedIn = true;
  await session.save();

  redirect("/");
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };
  const redirectTo = (formData.get("redirectTo") as string) || "/";

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, parsed.data.username))
    .limit(1);

  if (!user) {
    return { error: "Invalid username or password" };
  }

  if (user.isSuspended) {
    return { error: "Your account has been suspended by an administrator." };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid username or password" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.displayName = user.displayName;
  session.avatarUrl = user.avatarUrl;
  session.isAdmin = user.isAdmin;
  session.isSuspended = user.isSuspended;
  session.isLoggedIn = true;
  await session.save();

  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
