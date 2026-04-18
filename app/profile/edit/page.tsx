

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EditForm } from "./edit-form-client";

export default async function EditProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return <div>Login required</div>;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionUser.userId))
    .limit(1);

  if (!user) return <div>User not found</div>;

  return (
    <div
      className="container-news animate-fade-in"
      style={{
        paddingTop: "2rem",
        paddingBottom: "4rem",
        maxWidth: 540,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "2rem",
        }}
      >
        Edit Profile
      </h1>

      <EditForm user={user} />
    </div>
  );
}
