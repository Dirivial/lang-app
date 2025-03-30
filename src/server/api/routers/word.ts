import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../trpc";

export const wordRouter = {
  search: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(({ ctx, input }) => {
      // TODO: Add language filtering
      return ctx.db.query.Word.findMany({
        where: (words, { ilike }) => ilike(words.text, input.text),
        limit: 10,
        columns: {
          id: true,
          text: true,
          languageId: true,
        },
      });
    }),
} satisfies TRPCRouterRecord;
