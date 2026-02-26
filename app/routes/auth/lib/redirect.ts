import { auth } from "@server/auth";
import { redirect } from "react-router";
import { Telemetry } from "@server/telemetry";

const tel = new Telemetry("auth.redirect");

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
      tel.info("REDIRECT", { reason: "session_exists", caller, "req.url": request.url, "redirect.url": error.url });
      throw error;
    }
    return;
  }
}
