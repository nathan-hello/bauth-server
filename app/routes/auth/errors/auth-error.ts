import type { authClient } from "@/lib/auth";
import { ERROR_COPY } from "../lib/copy";

export type AuthError =
  | {
      type:
        | "code_invalid"
        | "password_mismatch"
        | "username_invalid"
        | keyof typeof authClient.$ERROR_CODES;
    }
  | { type: "generic_error"; message?: string };

export function getAuthError(err: string | Error): AuthError {
  const str = err instanceof Error ? err.message : err;
  if (str in ERROR_COPY) {
    return { type: err } as AuthError;
  }
  return { type: "generic_error", message: str };
}
