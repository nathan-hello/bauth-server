import { publicProcedure, router } from ".";

export default router({
  check: publicProcedure.query(() => {
    console.log(new Date().toISOString());
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),
});
