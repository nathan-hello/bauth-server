import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

const url =
  process.env.NODE_ENV === "development" ? "http://localhost:5173" : process.env.PRODUCTION_URL;
if (!url) {
  throw Error("process.env.PRODUCTION_URL was undefined");
}

export const authClient = createAuthClient({
  baseURL: url,
  plugins: [
    passkeyClient(),
  ],
});
