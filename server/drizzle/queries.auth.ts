import { db } from "@server/drizzle/db";
import { userProfile } from "@server/drizzle/schema.profile";
import { eq } from "drizzle-orm";

export async function getProfile({ id }: { id: string }) {
  return await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, id),
  });
}
