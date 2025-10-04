import {
  PasswordRegisterForm,
  type AuthState,
  type PasswordRegisterFormData,
} from "./components/password";
import { redirect, useNavigate, createCookie } from "react-router";
import { type AuthError } from "./errors/auth-error";
import type { Route } from "./+types/register";
import { auth, BA_COOKIE_PREFIX } from "@server/auth";
import { throwRedirectSessionToken } from "./cookies/session";

export function meta() {
  return [{ title: "Sign Up" }];
}

export default function ({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();

  return (
    <PasswordRegisterForm
      state={actionData}
      onSkipClick={() => navigate("/")}
      onLoginClick={() => navigate("/auth/login")}
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
    return { type: "start", email: email, errors: errs };
  }

  if (!username || !email || !password || !repeat) {
    return {
      type: "start",
      email: email,
      errors: [{ type: "INVALID_EMAIL_OR_PASSWORD" }],
    };
  }

  const r = await auth.api.signUpEmail({
    body: {
      username,
      password,
      email,
      name: username,
      displayUsername: username,
    },
    headers: request.headers 
  });

  if (r.token === null) {
    return { type: "start", email: email, errors: [{ type: "generic_error" }] };
  }

  await throwRedirectSessionToken(r.token);
  return undefined
}

function ParseRegister(data: PasswordRegisterFormData): AuthError[] | null {
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
