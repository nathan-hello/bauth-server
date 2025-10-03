import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./drizzle/db";
import {
  username,
  twoFactor,
  oneTimeToken,
  emailOTP,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : process.env.PRODUCTION_URL;
if (!url) {
  throw Error("process.env.PRODUCTION_URL was undefined");
}

export const auth = betterAuth({
  plugins: [
    passkey({ rpID: url, rpName: url }),
    username(),
    twoFactor(),
    emailOTP({
      sendVerificationOTP: async (data, request) => {},
      sendVerificationOnSignUp: true,
    }),
    oneTimeToken()
  ],
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
  },
        emailVerification: {
                autoSignInAfterVerification: true,
                sendVerificationEmail: async (data, request) => {},
                sendOnSignUp: true,
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
    encryptOAuthTokens: true,
  },
  cors: {
    origin: [url],
    credentials: true,
  },
});
