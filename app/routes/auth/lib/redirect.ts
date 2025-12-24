import { auth } from "@server/auth";
import { redirect } from "react-router";

export async function throwRedirectIfSessionExists({ request }: { request: Request }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (session !== null) {
      throw redirect("/");
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    return;
  }
}
