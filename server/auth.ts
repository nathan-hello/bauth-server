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

export const auth = betterAuth({
  plugins: [
    passkey({ rpID: VITE_URL, rpName: VITE_URL }),
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
  trustedOrigins: [VITE_URL],
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
    origin: [VITE_URL],
    credentials: true,
  },
});
