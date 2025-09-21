import { publicProcedure, router } from "@server/trpc";
import routerHealth from "@server/trpc/router.health";

export const appRouter = router({
  health: routerHealth,
  user: publicProcedure.query(({ ctx }) => {
    return {
      user: ctx.user.auth?.user,
      isAuthenticated: !!ctx.user.auth,
    };
  }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
