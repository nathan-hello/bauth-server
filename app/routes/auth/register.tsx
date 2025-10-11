import { PasswordRegisterForm, type TwoFactorEmailState, type TwoFactorTotpState } from "./components/password";
import { getAuthError, type AuthError } from "./errors/auth-error";
import type { Route } from "./+types/register";
import { auth, validateUsername } from "@server/auth";
import { useCopy } from "./lib/copy";
import { data, redirect } from "react-router";

type TwoFactorData = {
  totp: TwoFactorTotpState;
  email: TwoFactorEmailState;
};

export default function ({ loaderData, actionData }: Route.ComponentProps) {
  const copy = useCopy();

  const two_factor = actionData?.two_factor ?? loaderData?.two_factor;

  const step = actionData?.step ?? loaderData?.step ?? "start";
  const state = actionData?.state ?? loaderData?.state;

  return (
    <>
      <title>{copy.meta.register.title}</title>
      <PasswordRegisterForm step={step} state={state} two_factor={two_factor} />
    </>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const two_factor = getCookie(request);

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session && two_factor) {
      return { step: "verify" as const, state: { email: session.user.email }, two_factor };
    }
    if (session) {
      throw redirect("/");
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
  }
}

type ActionReturn = {
  step: "start" | "verify";
  state: { email?: string; errors?: AuthError[] };
  two_factor?: { email: Partial<TwoFactorEmailState>; totp: Partial<TwoFactorTotpState> };
};

export async function action({
  request,
}: Route.ActionArgs): Promise<ActionReturn | ReturnType<typeof data<ActionReturn>> | undefined> {
  const form = await request.formData();

  const username = form.get("username")?.toString();
  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();
  const repeat = form.get("repeat")?.toString();
  const code_totp = form.get("code_totp")?.toString();
  const code_email = form.get("code_email")?.toString();
  const action = form.get("action")?.toString();
  const resend_email = form.get("resend_email")?.toString();

  const existingCookie = getCookie(request);

  try {
    if (!action) {
      throw Error("no action");
    }
    if (!email) {
      throw Error("no email");
    }
    if (action === "register") {
      const errs = ParseRegister({ username, email, password, repeat });
      if (errs) {
        return { step: "start", state: { email: email, errors: errs } };
      }

      if (!username || !email || !password || !repeat) {
        return {
          step: "start",
          state: {
            email: email,
            errors: [{ type: "INVALID_EMAIL_OR_PASSWORD" }],
          },
        };
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

      const cookieValue = signUpHeaders.get("set-cookie")?.split(";")[0];
      if (!cookieValue) {
        throw Error("could not parse cookie");
      }

      // Force enableTwoFactor to generate a totp
      const authenticatedHeaders = new Headers(request.headers);
      authenticatedHeaders.set("cookie", cookieValue);

      // This doesn't actually force 2fa on login. That only happens after verification.
      const { totpURI: totpUri, backupCodes } = await auth.api.enableTwoFactor({
        body: { password: password },
        headers: authenticatedHeaders,
      });

      // twoFactor.otpOptions.sendOTP
      await auth.api.sendTwoFactorOTP({
        body: { trustDevice: true },
        headers: authenticatedHeaders,
      });

      const updates = { totp: { backupCodes, totpUri } };
      const cookieString = setCookie(existingCookie, updates);
      const newData = getCookieFromString(cookieString);

      signUpHeaders.append("Set-Cookie", cookieString);

      return data(
        {
          step: "verify",
          state: { email },
          two_factor: newData,
        },
        {
          headers: signUpHeaders,
        },
      );
    }

    if (action === "verify") {
      if (code_totp) {
        await auth.api.verifyTOTP({ body: { code: code_totp, trustDevice: true }, headers: request.headers });

        const updates = { totp: { verified: true } };
        const cookieString = setCookie(existingCookie, updates);
        const newData = getCookieFromString(cookieString);

        return data(
          {
            step: "verify",
            state: { email: email },
            two_factor: newData,
          },
          {
            headers: {
              "Set-Cookie": cookieString,
            },
          },
        );
      }

      if (code_email) {
        await auth.api.verifyTwoFactorOTP({ body: { code: code_email, trustDevice: true }, headers: request.headers });

        const updates = { email: { verified: true } };
        const cookieString = setCookie(existingCookie, updates);
        const newData = getCookieFromString(cookieString);

        return data(
          {
            step: "verify",
            state: { email: email },
            two_factor: newData,
          },
          {
            headers: {
              "Set-Cookie": cookieString,
            },
          },
        );
      }
      if (resend_email) {
        // await auth.api.sendTwoFactorOTP({
        //   body: { trustDevice: true },
        //   headers: request.headers,
        // });
      }
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    const step = action?.startsWith("verify") ? "verify" : "start";
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

const COOKIE_NAME = "register_2fa_data";
const COOKIE_MAX_AGE = 60 * 30; // 30 minutes

function getCookie(request: Request): TwoFactorData | undefined {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return;

  try {
    const value = cookie.substring(COOKIE_NAME.length + 1);
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded);
  } catch {
    return;
  }
}

function setCookie(
  existingData: TwoFactorData | undefined,
  updates: {
    totp?: Partial<TwoFactorTotpState>;
    email?: Partial<TwoFactorEmailState>;
  },
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

function hasAnyHeaders(headers: Headers): boolean {
  return [...headers].length > 0;
}

export function headers({ actionHeaders, loaderHeaders }: Route.HeadersArgs) {
  return hasAnyHeaders(actionHeaders) ? actionHeaders : loaderHeaders;
}
