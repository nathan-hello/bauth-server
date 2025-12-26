import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./drizzle/db";
import { username, twoFactor, emailOTP } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";

const url = process.env.PRODUCTION_URL;
if (!url) {
  throw Error("process.env.PRODUCTION_URL was undefined");
}

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw Error("process.env.BETTER_AUTH_SECRET was undefined");
}

export const BA_COOKIE_PREFIX = "asdf";

export function validateUsername(username: string) {
  if (username === "admin") {
    return false;
  }
  return /^[a-zA-Z0-9_-]+$/.test(username);
}

export const auth = betterAuth({
  secret: secret,
  plugins: [
    passkey({ rpID: url, rpName: url }),
    username({
      usernameValidator: validateUsername,
      displayUsernameValidator: validateUsername,
    }),
    twoFactor({
      otpOptions: {
        storeOTP: "plain",
        sendOTP: async (data, request) => {
          console.log("plugins.twofactor.otpoptions.sendotp:");
          console.log(new Date());
          console.table({
            email: data.user.email,
            token: data.otp,
          });
          console.log("otp:");
          console.log(data.otp);
        },
      },
    }),
    // This is JUST for signing in without a password
    // Email OTP is also used in twofactor for the 2FA
    // version of an email being sent to the user
    emailOTP({
      expiresIn: 60 * 15,
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: async (data, request) => {
        console.log("plugins.emailotp.sendverificationotp");
        console.table({
          email: data.email,
          type: data.type,
          token: data.otp,
        });
        console.log("otp:");
        console.log(data.otp);
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {},
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  advanced: {
    cookiePrefix: BA_COOKIE_PREFIX,
  },
  onAPIError: {
    onError: (error, ctx) => {
      console.log("[onAPIError]: API got error:");
      console.log(error);
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async (data, request) => {
      console.log("emailverification.sendverificationemail");
      console.table(data);
      console.log("url:");
      console.log(data.url);
    },
  },
  trustedOrigins: [url, "https://localhost:5173", "http://localhost:5173"],
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
