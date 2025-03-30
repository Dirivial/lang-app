import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { Language } from "~/server/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";
import { desc, eq } from "drizzle-orm";

export const languageRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Language.findMany({
      orderBy: desc(Language.id),
      limit: 10,
    });
  }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Language.findFirst({
        where: eq(Language.id, input.id),
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        code: z
          .string()
          .max(5)
          .describe(
            "e.g. 'sv', 'de', 'en' (as in svenska, deutsch and 'english'",
          ),
        name: z.string().max(50),
        isRtl: z
          .boolean()
          .default(false)
          .describe("If the language reads 'right-to-left'"),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Language).values(input);
    }),
  delete: protectedProcedure.input(z.number()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Language).where(eq(Language.id, input));
  }),
} satisfies TRPCRouterRecord;
