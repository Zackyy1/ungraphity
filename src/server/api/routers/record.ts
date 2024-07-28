import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const recordRouter = createTRPCRouter({
  // Get records with custom ID as input
  getRecordsByTrackableId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.record.findMany({
        where: {
          trackableId: input.id,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        trackableId: z.string(),
        value: z
          .number()
          .or(z.string())
          .transform((v) => {
            if (typeof v === "string") {
              return Number(v);
            }
            return v;
          }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.record.create({
        data: {
          trackable: { connect: { id: input.trackableId } },
          value: Number(input.value),
        },
      });
    }),
});
