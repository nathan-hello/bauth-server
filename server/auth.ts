import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./drizzle/db";
import { jwt, username } from "better-auth/plugins";
import {passkey} from "better-auth/plugins/passkey"

const prodUrl = process.env.PRODUCTION_URL;

if (!prodUrl) {
  throw Error(".env: `PRODUCTION_URL` is required");
}

const devUrl = "http://localhost:5173";

const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl

export const auth = betterAuth({
  plugins: [jwt(), username(), passkey({rpID: url, rpName: url})],
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "pg" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
  },
  trustedOrigins: [url],
  account: {
    accountLinking: {
      enabled: true,
      allowUnlinkingAll: true,
      allowDifferentEmails: true,
      updateUserInfoOnLink: true,
    },
    updateAccountOnSignIn: true,
  },
  cors: {
    origin: [url],
    credentials: true,
  },
});
