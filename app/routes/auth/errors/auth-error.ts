import { ERROR_COPY } from "../lib/copy";
import { APIError } from "better-auth";
import type { auth } from "@server/auth";

export type AuthApiErrors = keyof (typeof auth)["$ERROR_CODES"];

export type TAuthError =
  | {
      type:
        | "totp_uri_not_found"
        | "password_mismatch"
        // TODO: but in betterauth issue about this.
        // The auth["$ERROR_CODES"] don't specify "_IS"
        | "USERNAME_IS_TOO_SHORT"
        | "USERNAME_IS_TOO_LONG"
        | "USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER"
        | "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
        | "INVALID_OTP_CODE"
        | AuthApiErrors;
    }
  | {
      type: "generic_error";
      message?: string;
    };

export class AuthError {
  type: TAuthError["type"];
  message?: string;

  constructor(e: TAuthError["type"] | TAuthError) {
    if (typeof e === "string") {
      this.type = e;
    } else {
      this.type = e.type;

      if ("message" in e) {
        this.message = e.message;
      }
    }
  }
}

export function getAuthError(e: string | Error | unknown | AuthError[]): AuthError[] {
  let error: string;

  if (e instanceof AuthError) {
    return [e];
  }

  if (Array.isArray(e) && e.every((i) => i instanceof AuthError)) {
    return e;
  }

  // get the better-auth errors first. their "code" is what gets indexed into the copy object to get the text for the screen
  if (e instanceof APIError) {
    error = e.body?.code ?? "generic_error";
  } else if (e && typeof e === "object" && "message" in e && typeof e.message === "string") {
    error = e.message;
  } else if (typeof e === "string" && e in ERROR_COPY) {
    error = e;
  } else {
    error = "generic_error";
  }

  // Check if the error message matches any known error codes
  if (error in ERROR_COPY) {
    return [{ type: error }] as AuthError[];
  }

  return [
    {
      type: "generic_error",
      message: error,
    },
  ];
}
