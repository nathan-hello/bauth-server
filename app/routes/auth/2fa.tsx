import { auth, BA_COOKIE_PREFIX } from "@server/auth";
import type { Route } from "./+types/2fa";
import { getAuthError } from "./errors/auth-error";
import { redirect } from "react-router";
import { throwRedirectIfSessionExists } from "./lib/redirect";
import { TwoFactorVerification } from "./components/2fa";
import { parse } from "cookie";
import { Telemetry, safeRequestAttrs } from "@server/telemetry";

const tel = new Telemetry("route.2fa");

export default function ({ actionData }: Route.ComponentProps) {
  return <TwoFactorVerification state={actionData} />;
}

export async function loader({ request }: Route.LoaderArgs) {
  tel.info("GOT_LOADER", safeRequestAttrs(request));
  await throwRedirectIfSessionExists({
    request,
    caller: "/auth/2fa",
  });

  const cookies = request.headers.get("cookie");
  if (!cookies) {
    tel.info("REDIRECT", { reason: "no_cookies", ...safeRequestAttrs(request) });
    throw redirect("/auth/login");
  }
  const parsed = parse(cookies);
  const cookieKey = BA_COOKIE_PREFIX + ".two_factor";

  if (!parsed[cookieKey]) {
    tel.info("REDIRECT", { reason: "missing_2fa_cookie", cookie: cookieKey, ...safeRequestAttrs(request) });
    throw redirect("/auth/login");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  tel.info("GOT_ACTION", safeRequestAttrs(request, form));

  const action = form.get("action")?.toString();

  if (action === "switch-totp") {
    return { verificationType: "totp" as const };
  }

  if (action === "switch-email") {
    await auth.api.sendTwoFactorOTP({
      body: { trustDevice: true },
      headers: request.headers,
    });
    return { verificationType: "email" as const };
  }

  if (action === "resend-email") {
    return await resendEmail(form, request);
  }

  if (action === "verify-totp") {
    return await verifyTotp(form, request);
  }

  if (action === "verify-email") {
    return await verifyEmail(form, request);
  }
}

async function resendEmail(_form: FormData, request: Request) {
  try {
    const { status } = await auth.api.sendTwoFactorOTP({
      body: { trustDevice: true },
      headers: request.headers,
    });
    return { verificationType: "email" as const, resentEmail: status };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
  }
}

async function verifyTotp(form: FormData, request: Request) {
  const code = form.get("code")?.toString();
  if (!code) {
    return;
  }
  try {
    const { headers } = await auth.api.verifyTOTP({
      headers: request.headers,
      body: { code, trustDevice: true },
      returnHeaders: true,
    });

    throw redirect("/", { headers });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    tel.error("VERIFY_TOTP_FAILED", { error: error instanceof Error ? error.message : String(error) });

    const aerr = getAuthError(error);
    return {
      verificationType: "totp" as const,
      errors: aerr,
    };
  }
}

async function verifyEmail(form: FormData, request: Request) {
  const code = form.get("code")?.toString();
  if (!code) {
    return;
  }
  try {
    const { headers } = await auth.api.verifyTwoFactorOTP({
      headers: request.headers,
      body: { code, trustDevice: true },
      returnHeaders: true,
    });

    throw redirect("/", { headers });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    const aerr = getAuthError(error);
    return {
      verificationType: "email" as const,
      errors: aerr,
    };
  }
}
