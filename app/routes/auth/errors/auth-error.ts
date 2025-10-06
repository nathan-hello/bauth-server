import { ERROR_COPY } from "../lib/copy";
import { APIError } from "better-auth";
import type { auth } from "@server/auth";

export type AuthApiErrors = keyof typeof auth["$ERROR_CODES"]

export type AuthError =
  | {
      type:
        | "password_mismatch"
        | AuthApiErrors
    }
  | { type: "generic_error"; message?: string };

export function getAuthError(e: string | Error | unknown): AuthError[] {
  let error: string;

  console.error(e);

  // get the better-auth errors first. their "code" is what gets indexed into the copy object to get the text for the screen
  if (e instanceof APIError) {
    error = e.body?.code ?? "generic_error";
  } else if (e && typeof e === "object" && "message" in e && typeof e.message === "string") {
    error = e.message;
  } else if (typeof e === "string" && e in ERROR_COPY) {
    error = e
  } else {
    error = "generic_error";
  }

  console.error(error);

  // Check if the error message matches any known error codes
  if (error in ERROR_COPY) {
    return [{ type: error }] as AuthError[];
  }

  return [{ type: "generic_error", message: error }];
}
