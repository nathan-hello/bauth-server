import type { authClient } from "@/lib/auth";
import { ERROR_COPY } from "../lib/copy";

export type AuthError =
  | {
      type:
        | "code_invalid"
        | "password_mismatch"
        | "username_invalid"
        | "username_taken"
        | "otp_failed"
        | keyof typeof authClient.$ERROR_CODES;
    }
  | { type: "generic_error"; message?: string };

export function getAuthError(err: string | Error | unknown): AuthError[] {
  let errorMessage: string;
  
  if (err instanceof Error) {
    errorMessage = err.message;
  } else if (typeof err === "string") {
    errorMessage = err;
  } else if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    errorMessage = err.message;
  } else {
    errorMessage = "An unknown error occurred";
  }
  
  // Check if the error message matches any known error codes
  if (errorMessage in ERROR_COPY) {
    return [{ type: errorMessage }] as AuthError[];
  }
  
  return [{ type: "generic_error", message: errorMessage }];
}
