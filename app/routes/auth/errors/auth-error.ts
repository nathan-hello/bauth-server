import { ERROR_COPY } from "../lib/copy";
import { APIError } from "better-auth";
import type { auth } from "@server/auth";

export type AuthApiErrors = keyof (typeof auth)["$ERROR_CODES"];

export type AuthErrorCode =
  | "totp_uri_not_found"
  | "password_mismatch"
  | "otp_failed"
  | "code_invalid"
  // Better Auth codes that don't match $ERROR_CODES exactly
  | "USERNAME_IS_TOO_SHORT"
  | "USERNAME_IS_TOO_LONG"
  | "USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER"
  | "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
  | "INVALID_OTP_CODE"
  | AuthApiErrors
  | "generic_error";

/** Serializable error sent to the client. Only carries a typed code, never internal details. */
export type AuthError = {
  type: AuthErrorCode;
};

/**
 * Throwable error with a typed code and optional internal detail.
 * `code` maps to a user-facing message via ERROR_COPY.
 * `message` (inherited from Error) is for server-side logging only — never sent to the client.
 */
export class AppError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, internal?: string) {
    super(internal ?? code);
    this.code = code;
    this.name = "AppError";
  }
}

/** Converts any caught error into serializable AuthError[] for the client. */
export function getAuthError(e: unknown): AuthError[] {
  if (e instanceof AppError) {
    if (e.code === "generic_error") {
      console.error("[auth]", e.message);
    }
    return [{ type: e.code }];
  }

  if (e instanceof APIError) {
    const code = e.body?.code;
    if (typeof code === "string" && code in ERROR_COPY) {
      return [{ type: code as AuthErrorCode }];
    }
    console.error("[auth] Unrecognized APIError:", code, e.message);
    return [{ type: "generic_error" }];
  }

  console.error("[auth] Unexpected error:", e);
  return [{ type: "generic_error" }];
}
