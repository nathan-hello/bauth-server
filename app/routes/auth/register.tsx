import {
  PasswordRegisterForm,
  type AuthState,
  type TwoFactorEmailState,
  type TwoFactorTotpState,
} from "./components/password";
import { getAuthError, type AuthError } from "./errors/auth-error";
import type { Route } from "./+types/register";
import { auth, validateUsername } from "@server/auth";
import { throwRedirectIfSessionExists } from "./lib/redirect";
import { useCopy } from "./lib/copy";

export default function ({ actionData }: Route.ComponentProps) {
  const copy = useCopy();

  const two_factor = clientPersistTotpData({ email: actionData?.email, totp: actionData?.totp });
  return (
    <>
      <title>{copy.meta.register.title}</title>
      <PasswordRegisterForm step={actionData?.step ?? "start"} state={actionData?.state} two_factor={two_factor} />;
    </>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  await throwRedirectIfSessionExists({ request });
}

function clientPersistTotpData(two_factor: {
  totp: Partial<TwoFactorTotpState> | undefined;
  email: Partial<TwoFactorEmailState> | undefined;
}) {
  const session_storage_key = "register_2fa_data";
  const exists = sessionStorage.getItem(session_storage_key);
  if (!exists) {
    const empty: { totp: TwoFactorTotpState; email: TwoFactorEmailState } = {
      email: { verified: false },
      totp: { verified: false, totpUri: "", backupCodes: [] },
    };

    sessionStorage.setItem(session_storage_key, JSON.stringify({ ...empty, ...two_factor }));
  } else {
    const data = JSON.parse(exists);
    sessionStorage.setItem(session_storage_key, JSON.stringify({ ...data, ...two_factor }));
  }

  const data = sessionStorage.getItem(session_storage_key);
  if (!data) {
    return;
  }
  return JSON.parse(data) as { totp: TwoFactorTotpState; email: TwoFactorEmailState };
}

export async function action({ request }: Route.ActionArgs): Promise<
  | {
      step: "start" | "verify";
      state?: AuthState;
      totp?: Partial<TwoFactorTotpState>;
      email?: Partial<TwoFactorEmailState>;
    }
  | undefined
> {
  const form = await request.formData();

  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();
  const code = form.get("code")?.toString();
  const action = form.get("action")?.toString();

  try {
    if (!action) {
      throw Error("generic_error");
    }
    if (!email) {
      throw Error("generic_error");
    }
    if (action === "register") {
      const r = await ActionRegister({ request });
      if (r.errors) {
        return { step: "start", state: { errors: r.errors } };
      }
      if (!password) {
        throw Error("generic_error");
      }
      const { totpURI: totpUri, backupCodes } = await auth.api.enableTwoFactor({
        body: { password: password },
        headers: request.headers,
      });
      await auth.api.sendTwoFactorOTP({ body: { trustDevice: true }, headers: request.headers });

      return {
        step: "verify",
        state: { email: r.email },
        totp: { backupCodes, totpUri },
      };
    }
    if (action === "verify:totp") {
      if (!code) {
        throw Error("INVALID_CODE");
      }
      await auth.api.verifyTOTP({ body: { code, trustDevice: true }, headers: request.headers });
      return { step: "verify", state: { email: email }, totp: { verified: true } };
    }

    if (action === "verify:email") {
      if (!code) {
        throw Error("INVALID_CODE");
      }
      await auth.api.verifyTwoFactorOTP({ body: { code, trustDevice: true }, headers: request.headers });
      return { step: "verify", state: { email: email }, email: { verified: true } };
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    const step = action === "start" ? "start" : "verify";
    const aerr = getAuthError(error);

    return {
      step,
      state: {
        email: email,
        errors: aerr,
      },
    };
  }
}

async function ActionRegister({ request }: { request: Request }): Promise<AuthState> {
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

  await auth.api.signUpEmail({
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

  return { email: email };
}

function ParseRegister(data: Record<string, string | undefined>): AuthError[] | null {
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
