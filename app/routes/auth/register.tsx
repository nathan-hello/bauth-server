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
import { data } from "react-router";


type TwoFactorData = {
  totp: TwoFactorTotpState;
  email: TwoFactorEmailState;
};

export default function ({ loaderData, actionData }: Route.ComponentProps) {
  const copy = useCopy();

  const two_factor = actionData?.two_factor ?? loaderData?.two_factor;
  return (
    <>
      <title>{copy.meta.register.title}</title>
      <PasswordRegisterForm step={actionData?.step ?? "start"} state={actionData?.state} two_factor={two_factor} />;
    </>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  await throwRedirectIfSessionExists({ request });
  
  const two_factor = getCookie(request);
  return { two_factor };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();
  const code = form.get("code")?.toString();
  const action = form.get("action")?.toString();

  const existingCookie = getCookie(request);

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
        return { step: "start" as const, state: { errors: r.errors } };
      }
      if (!password) {
        throw Error("generic_error");
      }
      const { totpURI: totpUri, backupCodes } = await auth.api.enableTwoFactor({
        body: { password: password },
        headers: request.headers,
      });
      await auth.api.sendTwoFactorOTP({ body: { trustDevice: true }, headers: request.headers });

      const updates = { totp: { backupCodes, totpUri } };
      const cookieString = setCookie(existingCookie, updates);
      const newData = getCookieFromString(cookieString);

      return data(
        {
          step: "verify" as const,
          state: { email: r.email },
          two_factor: newData,
        },
        {
          headers: {
            "Set-Cookie": cookieString,
          },
        }
      );
    }
    if (action === "verify:totp") {
      if (!code) {
        throw Error("INVALID_CODE");
      }
      await auth.api.verifyTOTP({ body: { code, trustDevice: true }, headers: request.headers });
      
      const updates = { totp: { verified: true } };
      const cookieString = setCookie(existingCookie, updates);
      const newData = getCookieFromString(cookieString);

      return data(
        {
          step: "verify" as const,
          state: { email: email },
          two_factor: newData,
        },
        {
          headers: {
            "Set-Cookie": cookieString,
          },
        }
      );
    }

    if (action === "verify:email") {
      if (!code) {
        throw Error("INVALID_CODE");
      }
      await auth.api.verifyTwoFactorOTP({ body: { code, trustDevice: true }, headers: request.headers });
      
      const updates = { email: { verified: true } };
      const cookieString = setCookie(existingCookie, updates);
      const newData = getCookieFromString(cookieString);

      return data(
        {
          step: "verify" as const,
          state: { email: email },
          two_factor: newData,
        },
        {
          headers: {
            "Set-Cookie": cookieString,
          },
        }
      );
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    const step = action === "start" ? ("start" as const) : ("verify" as const);
    const aerr = getAuthError(error);

    return {
      step,
      state: {
        email: email,
        errors: aerr,
      },
      two_factor: existingCookie,
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

  return 
}

const COOKIE_NAME = "register_2fa_data";
const COOKIE_MAX_AGE = 60 * 30; // 30 minutes

function getCookie(request: Request): TwoFactorData | undefined {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return ;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return ;

  try {
    const value = cookie.substring(COOKIE_NAME.length + 1);
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded);
  } catch {
    return ;
  }
}

function setCookie(
  existingData: TwoFactorData | undefined,
  updates: {
    totp?: Partial<TwoFactorTotpState>;
    email?: Partial<TwoFactorEmailState>;
  }
): string {
  const empty: TwoFactorData = {
    email: { verified: false },
    totp: { verified: false, totpUri: "", backupCodes: [] },
  };

  const data: TwoFactorData = existingData
    ? {
        totp: { ...existingData.totp, ...updates.totp },
        email: { ...existingData.email, ...updates.email },
      }
    : {
        totp: { ...empty.totp, ...updates.totp },
        email: { ...empty.email, ...updates.email },
      };

  const value = encodeURIComponent(JSON.stringify(data));
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
}

function getCookieFromString(cookieString: string): TwoFactorData {
  const value = cookieString.split(";")[0].substring(COOKIE_NAME.length + 1);
  const decoded = decodeURIComponent(value);
  return JSON.parse(decoded);
}
