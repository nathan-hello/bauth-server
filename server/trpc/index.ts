// import { authRouter } from "./routers/auth";
import { auth } from "@server/auth";
import { initTRPC } from "@trpc/server";

// Context setup
export interface CreateContextOptions {
  headers: Headers;
}

export async function createTRPCContext(opts: CreateContextOptions) {
  const { headers } = opts;

  const authUser = await auth.api.getSession(opts);

  return {
    headers,
    auth,
    user: {
      auth: authUser,
    },
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
