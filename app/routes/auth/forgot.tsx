import { auth } from "@server/auth";
import type { Route } from "./+types/forgot";
import { PasswordForgotForm, type AuthState, type ForgotPasswordFormProps } from "./components/password";
import { getAuthError, type AuthError } from "./errors/auth-error";
import { redirect } from "react-router";
import { APIError } from "better-auth";

export function meta() {
  return [{ title: "Forgot Password" }, { name: "description", content: "Reset your password." }, {}];
}

type Action = ForgotPasswordFormProps | undefined;

export async function action({ request }: Route.ActionArgs): Promise<Action> {
  const form = await request.formData();
  const step = form.get("step")?.toString();
  const email = form.get("email")?.toString();
  const code = form.get("code")?.toString();
  const resend = form.get("resend")?.toString();
  const password = form.get("password")?.toString();
  const repeat = form.get("repeat")?.toString();
  if (!step || (step !== "start" && step !== "code" && step !== "update" && step !== "try-again")) {
    return {
      state: { errors: [{ type: "generic_error" }] },
      step: "start",
    };
  }

  try {
    if (step === "start" || resend === "true") {
      return await stepStart({ request, email });
    }
    if (step === "try-again") {
      throw redirect("/auth/login");
    }
    if (step === "code") {
      return await stepCode({ request, email, code });
    }
    if (step === "update") {
      await stepUpdatePassword({ request, email, password, repeat, code });
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    if (error instanceof APIError && error.body?.code === "TOO_MANY_ATTEMPTS") {
      return { step: "try-again", state: { email: "", errors: [{ type: "TOO_MANY_ATTEMPTS" }] } };
    } else {
      const errors = getAuthError(error);
      return { step, state: { email, errors } };
    }
  }

  return undefined;
}

async function stepStart({ request, email }: { request: Request; email: string | undefined }): Promise<Action> {
  if (!email) {
    return { step: "start", state: {} };
  }
  const ok = await auth.api.forgetPasswordEmailOTP({
    body: { email: email },
    headers: request.headers,
  });
  if (!ok) {
    throw Error("Server was not able to send verification email.");
  }
  return { step: "code", state: { email: email } };
}

type StepCodeArgs = {
  request: Request;
  email: string | undefined;
  code: string | undefined;
};
async function stepCode({ request, email, code }: StepCodeArgs): Promise<Action> {
  if (!email) {
    throw Error("otp_failed");
  }
  if (!code) {
    throw Error("code_invalid");
  }
  const ok = await auth.api.checkVerificationOTP({
    body: { email, otp: code, type: "forget-password" },
    headers: request.headers,
  });
  if (!ok) {
    throw Error("otp_failed");
  }
  return { step: "update", state: { email } };
}

type StepUpdateArgs = {
  request: Request;
  email: string | undefined;
  password: string | undefined;
  repeat: string | undefined;
  code: string | undefined;
};
async function stepUpdatePassword({ request, password, repeat, email, code }: StepUpdateArgs) {
  if (!password || !repeat || password !== repeat) {
    throw Error("password_mismatch");
  }
  if (!email || !code) {
    throw Error("generic_error");
  }

  const { headers, response } = await auth.api.resetPasswordEmailOTP({
    headers: request.headers,
    body: { email: email, password: password, otp: code },
    returnHeaders: true,
  });
  if (!response.success) {
    throw Error("generic_error");
  }

  throw redirect("/auth/account", { headers });
}

export default function ({ actionData }: Route.ComponentProps) {
  return <PasswordForgotForm state={actionData?.state} step={actionData?.step ?? "start"} />;
}
