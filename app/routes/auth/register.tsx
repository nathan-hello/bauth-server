import {
  PasswordRegisterForm,
  type AuthState,
} from "./components/password";
import { redirect } from "react-router";
import { getAuthError, type AuthError } from "./errors/auth-error";
import type { Route } from "./+types/register";
import { auth } from "@server/auth";

export function meta() {
  return [{ title: "Sign Up" }];
}

export default function ({ actionData }: Route.ComponentProps) {

  return (
    <PasswordRegisterForm
      state={actionData}
    />
  );
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
  if (username) {
    const r = await auth.api.isUsernameAvailable({
      headers: request.headers,
      body: { username: username },
    });
    if (!r.available) {
      return {
        email: email,
        errors: [{ type: "username_taken" }],
      };
    }
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

    if (response && "twoFactorRedirect" in response) {
      throw redirect("/auth/2fa", { headers });
    }

    throw redirect("/auth/account", { headers });
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

function ParseRegister(data: any): AuthError[] | null {
  const errors: AuthError[] = [];
  if (!data.email) {
    errors.push({ type: "INVALID_EMAIL" });
  }
  if (!data.password) {
    errors.push({ type: "INVALID_PASSWORD" });
  }
  if (!data.username) {
    errors.push({ type: "username_invalid" });
  }

  // We don't want to show "password invalid" and "password mismatch" at the same time.
  // So, return early before that check
  if (errors.length > 0) {
    return errors;
  }

  if (!data.repeat || data.password !== data.repeat) {
    errors.push({ type: "password_mismatch" });
  }

  if (errors.length > 0) {
    return errors;
  }

  return null;
}
