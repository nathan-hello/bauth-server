import type { Route } from "./+types/register-2fa";
import type { Register2faProps, Register2faState } from "./components/two-factor";
import type { AuthError } from "./errors/auth-error";
import { RegisterTwoFactor } from "./components/two-factor";
import { useCopy } from "./lib/copy";
import { redirect } from "react-router";
import { getAuthError } from "./errors/auth-error";
import { auth } from "@server/auth";

const VERIFICATION_STATE_COOKIE = "register-2fa-state";
const TOTP_URI_COOKIE = "register-2fa-totp-uri";

type VerificationState = {
  totpVerified: boolean;
  emailVerified: boolean;
};

export default function ({ loaderData, actionData }: Route.ComponentProps) {
  const copy = useCopy();

  // Merge loader state with action state (action state takes precedence)
  const state: Register2faState | undefined =
    actionData ||
    (loaderData.type === "data"
      ? loaderData.state
      : undefined);

  return (
    <>
      <title>{copy.meta.register_2fa.title}</title>
      <RegisterTwoFactor
        totpUri={loaderData.type === "data" ? loaderData.totpUri : undefined}
        state={state}
      />
    </>
  );
}

type LoaderData =
  | { type: "data"; totpUri: string; state: Register2faState }
  | { type: "error"; errors: AuthError[] };

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const cookieHeader = request.headers.get("Cookie") || "";
  
  // Try to get TOTP URI from header first (coming from register), then from cookie
  let totpUri = request.headers.get("x-totp-uri");
  if (!totpUri) {
    totpUri = getTotpUriFromCookie(cookieHeader);
  }

  if (!totpUri) {
    return { type: "error", errors: [{ type: "totp_uri_not_found" }] };
  }

  // Get existing verification state from cookie
  const state = getVerificationStateFromCookie(cookieHeader);

  return {
    type: "data",
    totpUri,
    state: {
      totpVerified: state.totpVerified,
      emailVerified: state.emailVerified,
    },
  };
}

export async function action({ request }: Route.ActionArgs): Promise<Register2faState> {
  const form = await request.formData();
  const action = form.get("action")?.toString();
  const code = form.get("code")?.toString();
  const resend = form.get("resend")?.toString() === "true";

  // Get existing verification state from cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const existingState = getVerificationStateFromCookie(cookieHeader);

  // If both are already verified, redirect to home
  if (existingState.totpVerified && existingState.emailVerified) {
    throw redirect("/", {
      headers: {
        "Set-Cookie": `${VERIFICATION_STATE_COOKIE}=; Path=/; Max-Age=0`,
      },
    });
  }

  // Handle resend requests
  if (resend) {
    if (action === "email") {
      try {
        await auth.api.sendTwoFactorOTP({
          headers: request.headers,
        });
        return {
          errors: [{ type: "generic_error", message: "Verification code sent to your email" }],
          totpVerified: existingState.totpVerified,
          emailVerified: existingState.emailVerified,
        };
      } catch (error) {
        return {
          errors: getAuthError(error),
          totpVerified: existingState.totpVerified,
          emailVerified: existingState.emailVerified,
        };
      }
    }
    // TOTP doesn't need resend, just return current state
    return {
      errors: undefined,
      totpVerified: existingState.totpVerified,
      emailVerified: existingState.emailVerified,
    };
  }

  // Validate code input
  if (!code || code.length !== 6) {
    return {
      errors: [{ type: "INVALID_OTP_CODE" }],
      totpVerified: existingState.totpVerified,
      emailVerified: existingState.emailVerified,
    };
  }

  // Process verification based on action type
  const newState: VerificationState = { ...existingState };

  try {
    if (action === "totp") {
      // Verify TOTP

      if (response && "status" in response && response.status === true) {
        newState.totpVerified = true;
      }
    } else if (action === "email") {
      // Verify Email OTP
      const response = await auth.api.verifyEmailOTP({
        body: {
          code,
        },
        headers: request.headers,
      });

      if (response && "status" in response && response.status === "success") {
        newState.emailVerified = true;
      }
    } else {
      return {
        errors: [{ type: "generic_error", message: "Invalid action" }],
        totpVerified: existingState.totpVerified,
        emailVerified: existingState.emailVerified,
      };
    }

    // If both are now verified, redirect to home and clear the cookie
    if (newState.totpVerified && newState.emailVerified) {
      throw redirect("/", {
        headers: {
          "Set-Cookie": `${VERIFICATION_STATE_COOKIE}=; Path=/; Max-Age=0`,
        },
      });
    }

    // Get TOTP URI to persist it in cookie
    const cookieHeader = request.headers.get("Cookie") || "";
    const totpUri = request.headers.get("x-totp-uri") || getTotpUriFromCookie(cookieHeader);

    // Successfully verified one factor, redirect to reload with updated cookies
    const headers = new Headers();
    headers.append("Set-Cookie", setVerificationStateCookie(newState));
    if (totpUri) {
      headers.append("Set-Cookie", setTotpUriCookie(totpUri));
    }
    
    throw redirect("/auth/register/2fa", { headers });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    return {
      errors: getAuthError(error),
      totpVerified: existingState.totpVerified,
      emailVerified: existingState.emailVerified,
    };
  }
}

function getVerificationStateFromCookie(cookieHeader: string): VerificationState {
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const stateCookie = cookies.find((c) => c.startsWith(`${VERIFICATION_STATE_COOKIE}=`));

  if (!stateCookie) {
    return { totpVerified: false, emailVerified: false };
  }

  try {
    const value = stateCookie.split("=")[1];
    const decoded = JSON.parse(decodeURIComponent(value)) as VerificationState;
    return {
      totpVerified: decoded.totpVerified || false,
      emailVerified: decoded.emailVerified || false,
    };
  } catch {
    return { totpVerified: false, emailVerified: false };
  }
}

function setVerificationStateCookie(state: VerificationState): string {
  const value = encodeURIComponent(JSON.stringify(state));
  // Cookie expires in 1 hour
  const maxAge = 60 * 60;
  return `${VERIFICATION_STATE_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

function getTotpUriFromCookie(cookieHeader: string): string | null {
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const totpCookie = cookies.find((c) => c.startsWith(`${TOTP_URI_COOKIE}=`));

  if (!totpCookie) {
    return null;
  }

  try {
    const value = totpCookie.split("=")[1];
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function setTotpUriCookie(totpUri: string): string {
  const value = encodeURIComponent(totpUri);
  // Cookie expires in 1 hour
  const maxAge = 60 * 60;
  return `${TOTP_URI_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

