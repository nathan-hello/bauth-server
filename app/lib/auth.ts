import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

const url =
  process.env.NODE_ENV === "development" ? "http://localhost:5173" : CLIENT_PRODUCTION_URL;

export const authClient = createAuthClient({
  baseURL: url,
  plugins: [passkeyClient()],
});
