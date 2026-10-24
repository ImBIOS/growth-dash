import { protectedProcedure, publicProcedure, router } from "../index";
import { growthRouter } from "./growth";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  growth: growthRouter,
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
});
export type AppRouter = typeof appRouter;
