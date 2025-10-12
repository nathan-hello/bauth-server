import { PasswordRegisterForm } from "./components/password";
import { getAuthError, AuthError } from "./errors/auth-error";
import type { Route } from "./+types/register";
import { auth, validateUsername } from "@server/auth";
import { useCopy } from "./lib/copy";
import { data, redirect } from "react-router";
import { throwRedirectIfSessionExists } from "./lib/redirect";

export default function ({ actionData }: Route.ComponentProps) {
  const copy = useCopy();

  return (
    <>
      <title>{copy.meta.register.title}</title>
      <PasswordRegisterForm state={actionData?.state} />
    </>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  await throwRedirectIfSessionExists({ request });
}

type ActionReturn = {
  state: { email?: string; errors?: AuthError[] };
};

export async function action({
  request,
}: Route.ActionArgs): Promise<ActionReturn | ReturnType<typeof data<ActionReturn>> | undefined> {
  const form = await request.formData();

  const username = form.get("username")?.toString();
  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();
  const repeat = form.get("repeat")?.toString();
  const action = form.get("action")?.toString() ?? "register";

  try {
    if (!email) {
      return;
    }
    if (action === "register") {
      const errs = ParseRegister({ username, email, password, repeat });
      if (errs) {
        return { state: { email: email, errors: errs } };
      }

      if (!username || !email || !password || !repeat) {
        throw new AuthError({ type: "INVALID_EMAIL_OR_PASSWORD" });
      }

      const { headers: signUpHeaders } = await auth.api.signUpEmail({
        body: {
          username,
          password,
          email,
          name: username,
          displayUsername: username,
        },
        headers: request.headers,
        returnHeaders: true,
      });

      throw redirect("/auth/dashboard", { headers: signUpHeaders });
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    const aerr = getAuthError(error);

    return {
      state: {
        email: email,
        errors: aerr,
      },
    };
  }
}

function ParseRegister(data: Record<string, string | undefined>): AuthError[] | undefined {
  const errors: AuthError[] = [];
  if (!data.email) {
    errors.push({ type: "INVALID_EMAIL" });
  }
  if (!data.password) {
    errors.push({ type: "INVALID_PASSWORD" });
  }
  if (!data.username || !validateUsername(data.username)) {
    errors.push({ type: "INVALID_USERNAME" });
  }

  if (!data.repeat || data.password !== data.repeat) {
    errors.push({ type: "password_mismatch" });
  }

  if (errors.length > 0) {
    return errors;
  }

  return;
}
