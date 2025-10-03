import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./drizzle/db";
import {
  jwt,
  username,
  twoFactor,
  oneTimeToken,
  emailOTP,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { url } from "@/lib/url";

export const auth = betterAuth({
  plugins: [
    passkey({ rpID: url, rpName: url }),
    username(),
    twoFactor(),
    emailOTP({
      sendVerificationOTP: async (data, request) => {},
      sendVerificationOnSignUp: true,
    }),
    oneTimeToken(),
    jwt(),
  ],
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
