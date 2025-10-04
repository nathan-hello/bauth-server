import { auth } from "@server/auth";
import type { Route } from "./+types/login";
import { PasswordLoginForm, type AuthState } from "./components/password";
import { redirect } from "react-router";
import { getAuthError } from "./errors/auth-error";

export function meta() {
  return [{ title: "Forgot Password" }, { name: "description", content: "Reset your password." }, {}];
}

export default function ({ actionData }: Route.ComponentProps) {

  return (
    <PasswordLoginForm
      state={actionData}
    />
  );
}

export async function action({ request }: Route.ActionArgs): Promise<AuthState> {
  const form = await request.formData();

  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();

  if (!email || !password) {
    return {
      email: email || "",
      errors: [{ type: "INVALID_EMAIL_OR_PASSWORD" }],
    };
  }
  return await login({ request, email, password });
}

async function login({
  request,
  email,
  password,
}: {
  email: string;
  password: string;
  request: Request;
}): Promise<AuthState> {
  try {
    // Determine if input is email or username based on @ symbol
    const isEmail = email.includes("@");

    const { headers, response } = await (isEmail
      ? auth.api.signInEmail({
          headers: request.headers,
          body: {
            email: email,
            password: password,
          },
          returnHeaders: true,
        })
      : auth.api.signInUsername({
          headers: request.headers,
          body: {
            username: email,
            password: password,
          },
          returnHeaders: true,
        }));

    if (response && "twoFactorRedirect" in response) {
      throw redirect("/auth/2fa", { headers });
    }

    throw redirect("/chat", { headers });
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
