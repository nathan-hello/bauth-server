import { redirect } from "react-router";
import { useCopy } from "./lib/copy";
import type { Route } from "./+types/logout";
import { auth } from "@server/auth";
import { AppError, getAuthError, errorAttrs, type AuthError } from "./errors/auth-error";
import { APIError } from "better-auth";
import { PasswordSignOut } from "./components/password";
import { Card } from "./components/ui";
import { Telemetry, safeRequestAttrs } from "@server/telemetry";

const tel = new Telemetry("route.logout");

export default function ({ actionData }: Route.ComponentProps) {
  const copy = useCopy();

  return (
    <Card>
      <title>{copy.meta.login.title}</title>
      <PasswordSignOut
        state={{
          email: "",
          errors: actionData,
        }}
      />
    </Card>
  );
}

export async function loader({ request }: Route.LoaderArgs): Promise<AuthError[] | undefined> {
  tel.info("GOT_LOADER", safeRequestAttrs(request));
  try {
    const { headers, response } = await auth.api.signOut({
      headers: request.headers,
      returnHeaders: true,
    });
    if (response.success === false) {
      throw new AppError("generic_error", "signOut returned success=false");
    }
    throw redirect("/", { headers });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    if (error instanceof APIError) {
      if (error.body?.code === "FAILED_TO_GET_SESSION") {
        throw redirect("/");
      }
    }

    tel.error("LOGOUT_ERROR", errorAttrs(error));
    const errors = getAuthError(error);
    return errors;
  }
}
