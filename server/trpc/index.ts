// import { authRouter } from "./routers/auth";
import { auth } from "@server/auth";
import { initTRPC, TRPCError } from "@trpc/server";

// Context setup
export interface CreateContextOptions {
  headers: Headers;
}

export async function createTRPCContext(opts: CreateContextOptions) {
  const { headers } = opts;

  const session = await auth.api.getSession(opts);

  return {
    headers,
    auth,
    session,
  };
}
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

export const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
