import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  isSuspended: boolean;
  isLoggedIn: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "uninews-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.isLoggedIn || session.isSuspended) return null;
  return {
    userId: session.userId,
    username: session.username,
    displayName: session.displayName,
    avatarUrl: session.avatarUrl,
    isAdmin: session.isAdmin || false,
    isSuspended: session.isSuspended || false,
  };
}
