import { router } from "@server/trpc";
import routerHealth from "@server/trpc/router.health";
import routerAuth from "@server/trpc/router.auth";

export const appRouter = router({
  health: routerHealth,
  auth: routerAuth,
});

export type AppRouter = typeof appRouter;
