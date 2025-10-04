import { auth } from "@server/auth";
import type { Route } from "./+types/login";
import { PasswordRegisterForm, type AuthState } from "./components/password";
import { redirect, useNavigate } from "react-router";
import { throwRedirectSessionToken } from "./cookies/session";
import { APIError } from "better-auth";
import { getAuthError } from "./errors/auth-error";

export function meta() {
  return [
    { title: "Forgot Password" },
    { name: "description", content: "Reset your password." },
    {},
  ];
}

export default function ({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();

  return (
    <PasswordRegisterForm
      state={{ type: "start", email: "" }}
      onLoginClick={() => navigate("/auth/signin")}
    />
  );
}

export async function action({
  request,
}: Route.ActionArgs): Promise<AuthState> {
  const form = await request.formData();

  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();

  if (!email || !password) {
    return {
      type: "start",
      email: email || "",
      errors: [{ type: "INVALID_EMAIL_OR_PASSWORD" }],
    };
  }
  if (email.includes("@")) {
    let errState = await loginEmail({ request, email, password });
    if (errState) {
      return errState;
    }
  } else {
    let errState = await loginUsername({ request, email, password });
    if (errState) {
      return errState;
    }
  }
}

async function loginEmail({
  request,
  email,
  password,
}: {
  email: string;
  password: string;
  request: Request;
}): Promise<AuthState> {
  try {
    const { headers, response } = await auth.api.signInEmail({
      headers: request.headers,
      body: {
        email: email,
        password: password,
      },
      returnHeaders: true,
    });

    if ("twoFactorRedirect" in response) {
      throw redirect("/auth/2fa", { headers });
    }

    // If no redirect but successful, still redirect to chat
    throw redirect("/chat", { headers });
  } catch (error) {
    // Check if it's a redirect (which should be thrown)
    if (
      error instanceof Response &&
      error.status >= 300 &&
      error.status < 400
    ) {
      throw error;
    }

    const aerr = getAuthError(error);

    return {
      type: "start",
      email: email,
      errors: aerr,
    };
  }
}

async function loginUsername({
  request,
  email,
  password,
}: {
  email: string;
  password: string;
  request: Request;
}): Promise<AuthState> {
  try {
    const { headers, response } = await auth.api.signInUsername({
      headers: request.headers,
      body: {
        username: email,
        password: password,
      },
      returnHeaders: true,
    });

    if (response && "twoFactorRedirect" in response) {
      throw redirect("/auth/2fa", { headers });
    }


    // If no redirect but successful, still redirect to chat
    throw redirect("/chat", { headers });
  } catch (error) {
    // Check if it's a redirect (which should be thrown)
    if (
      error instanceof Response &&
      error.status >= 300 &&
      error.status < 400
    ) {
      throw error;
    }

    const aerr = getAuthError(error);

    return {
      type: "start",
      email: email,
      errors: aerr,
    };
  }
}
