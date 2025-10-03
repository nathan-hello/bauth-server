import { auth, AUTH_REDIRECT_AFTER_SUCESS } from "@server/auth";
import { publicProcedure, router, protectedProcedure } from ".";
import { z } from "zod/v4";
import { ZodError } from "better-auth";

export default router({
  getTotpCodeFromSecret: protectedProcedure
    .input(z.object({ secret: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const res = await auth.api.generateTOTP({
        headers: ctx.headers,
        body: { secret: input.secret },
      });
      return res;
    }),
  disableTotp: protectedProcedure
    .input(z.object({ secret: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await auth.api.disableTwoFactor({
        body: { password: input.secret },
        headers: ctx.headers,
      });
    }),
  enableTotp: protectedProcedure
    .input(z.object({ secret: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await auth.api.enableTwoFactor({
        body: { password: input.secret },
        headers: ctx.headers,
      });
    }),
  changeEmail: protectedProcedure
    .input(
      z.object({
        newEmail: z.email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await auth.api.changeEmail({
        headers: ctx.headers,
        body: { newEmail: input.newEmail },
      });
    }),
  resendEmailVerification: protectedProcedure.mutation(async ({ ctx }) => {
    return await auth.api.sendVerificationEmail({
      body: { email: ctx.user.email, callbackURL: AUTH_REDIRECT_AFTER_SUCESS },
    });
  }),
  generateBackupCodes: protectedProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await auth.api.generateBackupCodes({
        body: { password: input.password },
        headers: ctx.headers,
      });
    }),
  logoutEverywhere: protectedProcedure.mutation(async ({ ctx }) => {
    return await auth.api.revokeOtherSessions({ headers: ctx.headers });
  }),
  viewTotpSecret: protectedProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await auth.api.getTOTPURI({
        headers: ctx.headers,
        body: { password: input.password },
      });
    }),
});
