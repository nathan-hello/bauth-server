import { EmailOtp, Email2fa, EmailVerification } from "@/components/email";
import { Resend } from "resend";
import { Telemetry } from "./telemetry";
import { betterAuth } from "better-auth/minimal";
import { db } from "./drizzle/db";
import { dotenv } from "./env";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "@better-auth/passkey";
import { username, twoFactor, emailOTP } from "better-auth/plugins";

const resend = new Resend(dotenv.RESEND_ACCESS_TOKEN);
const fromEmail = "Nat/e <accounts@support.reluekiss.com>";

const tel = new Telemetry("auth.hooks");

export const BA_COOKIE_PREFIX = "reluekiss";

export function validateUsername(username: string) {
  if (username === "admin") {
    return false;
  }
  return /^[a-zA-Z0-9_-]+$/.test(username);
}

export const auth = betterAuth({
  baseURL: dotenv.PRODUCTION_URL,
  secret: dotenv.BETTER_AUTH_SECRET,
  plugins: [
    passkey({ rpID: dotenv.PRODUCTION_URL, rpName: dotenv.PRODUCTION_URL }),

    username({
      usernameValidator: validateUsername,
      displayUsernameValidator: validateUsername,
    }),

    twoFactor({
      issuer: dotenv.PRODUCTION_URL,
      otpOptions: {
        storeOTP: "plain",
        sendOTP: async (data, _request) => {
          tel.info("SEND_OTP", {
            "user.email": data.user.email,
            "user.id": data.user.id,
            channel: "totp",
          });
          const response = await resend.emails.send({
            from: fromEmail,
            to: data.user.email,
            subject: "One time passcode",
            react: Email2fa({ email: data.user.email, url: dotenv.PRODUCTION_URL, otp: data.otp }),
          });
          if (response.error) {
            tel.error("RESEND_ERROR", { error: response.error, headers: response.headers });
          } else {
            tel.info("RESEND_SUCCESS", { id: response.data.id, headers: response.headers });
          }
        },
      },
    }),

    // This is JUST for signing in without a password
    // Email OTP is also used in twofactor for the 2FA
    // version of an email being sent to the user
    emailOTP({
      expiresIn: 60 * 15,
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: async (data, _request) => {
        tel.info("SEND_OTP", { "user.email": data.email, type: data.type, channel: "email" });
        const response = await resend.emails.send({
          from: fromEmail,
          to: data.email,
          subject: "One time passcode",
          react: EmailOtp({ email: data.email, url: dotenv.PRODUCTION_URL, otp: data.otp }),
        });
        if (response.error) {
          tel.error("RESEND_ERROR", { error: response.error, headers: response.headers });
        } else {
          tel.info("RESEND_SUCCESS", { id: response.data.id, headers: response.headers });
        }
      },
    }),
  ],

  rateLimit: {
    window: 60,
    max: 100,
    storage: "database",
    customRules: {
      "/send-verification-email": { window: 300, max: 1 },
      "/email-otp/send-verification-otp": { window: 300, max: 1 },
      "/sign-in/email-otp": { window: 300, max: 1 },
      "/two-factor/*": { window: 300, max: 1 },
    },
  },

  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),

  advanced: {
    cookiePrefix: BA_COOKIE_PREFIX,
  },

  onAPIError: {
    onError: (error, _ctx) => {
      tel.error("API_ERROR", { error: error instanceof Error ? error.message : String(error) });
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
    sendVerificationEmail: async (data, _request) => {
      tel.info("SEND_VERIFICATION_EMAIL", {
        "user.email": data.user.email,
        "user.id": data.user.id,
      });
      const response = await resend.emails.send({
        from: fromEmail,
        to: data.user.email,
        subject: "Email verification",
        react: EmailVerification({
          email: data.user.email,
          url: dotenv.PRODUCTION_URL,
          verificationLink: data.url,
        }),
      });
      if (response.error) {
        tel.error("RESEND_ERROR", { error: response.error, headers: response.headers });
      } else {
        tel.info("RESEND_SUCCESS", { id: response.data.id, headers: response.headers });
      }
    },
  },

  trustedOrigins: [dotenv.PRODUCTION_URL, "https://localhost:5173", "http://localhost:5173"],

  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
    },
    updateAccountOnSignIn: true,
    encryptOAuthTokens: true,
  },

  cors: {
    origin: [dotenv.PRODUCTION_URL],
    credentials: true,
  },

  telemetry: { enabled: false },
});
