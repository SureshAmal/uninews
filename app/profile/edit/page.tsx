

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
    <div className="container-news animate-fade-in pt-8 pb-16 max-w-[540px] mx-auto">
      <h1 className="font-heading text-[2rem] font-bold mb-8">
        Edit Profile
      </h1>

      <EditForm user={user} />
    </div>
  );
}
