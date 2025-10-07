import { PasswordRegisterForm, type AuthState } from "./components/password";
import { redirect } from "react-router";
import { getAuthError, type AuthError } from "./errors/auth-error";
import type { Route } from "./+types/register";
import { auth, validateUsername } from "@server/auth";
import { throwRedirectIfSessionExists } from "./lib/redirect";

export default function ({ actionData }: Route.ComponentProps) {
  return <PasswordRegisterForm state={actionData} />;
}

export async function loader({ request }: Route.LoaderArgs) {
  await throwRedirectIfSessionExists({ request });
}

export async function action({
  request,
}: Route.ActionArgs): Promise<AuthState | undefined> {
  const form = await request.formData();

  const username = form.get("username")?.toString();
  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();
  const repeat = form.get("repeat")?.toString();

  const errs = ParseRegister({ username, email, password, repeat });
  if (errs !== null) {
    return { email: email, errors: errs };
  }

  if (!username || !email || !password || !repeat) {
    return {
      email: email,
      errors: [{ type: "INVALID_EMAIL_OR_PASSWORD" }],
    };
  }

  try {
    const { headers, response } = await auth.api.signUpEmail({
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

    console.log(headers.toJSON());

    if (response && "twoFactorRedirect" in response) {
      throw redirect("/auth/2fa", { headers });
    }

    throw redirect("/", { headers });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    const aerr = getAuthError(error);

    return {
      email: email,
      errors: aerr,
    };
  }
}

function ParseRegister(
  data: Record<string, string | undefined>,
): AuthError[] | null {
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

  return null;
}
