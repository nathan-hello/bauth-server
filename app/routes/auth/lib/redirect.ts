import { auth } from "@server/auth";
import { redirect } from "react-router";

export async function throwRedirectIfSessionExists({
  request,
  caller,
}: {
  request: Request;
  caller: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (session !== null) {
      throw redirect("/");
    }
  } catch (error) {
    if (error instanceof Response) {
      console.log(`[${caller}]: Redirecting from ${request.url} to ${error.url}`);
      throw error;
    }
    return;
  }
}
