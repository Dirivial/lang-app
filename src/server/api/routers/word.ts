import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../trpc";
import { coreWordTypeEnum, NounDetails, Word } from "~/server/db/schema";

export const wordRouter = {
  createMany: protectedProcedure
    .input(
      z
        .object({
          text: z.string(),
          languageId: z.number(),
          definitions: z.string().array(),
          type: z.enum(coreWordTypeEnum.enumValues),
          examples: z.string().array(),
          source: z.string(),
          gender: z.string(),
        })
        .array(),
    )
    .mutation(async ({ ctx, input }) => {
      for (const v of input) {
        const word = await ctx.db
          .insert(Word)
          .values(v)
          .returning({ id: Word.id });
        const wordId = word.at(0)?.id;
        if (wordId !== undefined) {
          const casething = await ctx.db
            .insert(NounDetails)
            .values({ gender: v.gender, wordId: wordId })
            .returning({ id: Word.id });
        }
      }
      return;
    }),
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
