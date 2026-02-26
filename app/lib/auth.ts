import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { dotenv } from "@server/index";

const url = dotenv.NODE_ENV === "development" ? "http://localhost:5173" : dotenv.PRODUCTION_URL;

export const authClient = createAuthClient({
  baseURL: url,
  plugins: [passkeyClient()],
});
