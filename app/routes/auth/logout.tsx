import { redirect } from "react-router";
import { useCopy } from "./lib/copy";
import type { Route } from "./+types/logout";
import { auth } from "@server/auth";
import { getAuthError, type AuthError } from "./errors/auth-error";
import { APIError } from "better-auth";
import { PasswordSignOut } from "./components/password";

export default function ({ actionData }: Route.ComponentProps) {
  const copy = useCopy();

  return (
    <div data-component="center">
      <title>{copy.meta.login.title}</title>
      <PasswordSignOut
        state={{
          email: "",
          errors: actionData,
        }}
      />
    </div>
  );
}

export async function loader({ request }: Route.LoaderArgs): Promise<AuthError[] | undefined> {
  try {
    const { headers, response } = await auth.api.signOut({
      headers: request.headers,
      returnHeaders: true,
    });
    if (response.success === false) {
      throw Error("generic_error");
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

    const errors = getAuthError(error);
    return errors;
  }
}
