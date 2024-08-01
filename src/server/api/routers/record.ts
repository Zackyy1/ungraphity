import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const recordRouter = createTRPCRouter({
  // Get records with custom ID as input
  getRecordsByTrackableId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        dateRange: z
          .object({
            from: z.string(),
            to: z.string(),
          })
          .optional(),

        // Pagination
        skip: z.number().optional(),
        take: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const optionals = input.dateRange
        ? {
            date: {
              gte: new Date(input.dateRange?.from).toISOString(),
              lte: new Date(input.dateRange?.to).toISOString(),
            },
          }
        : {};

      return await ctx.db.record.findMany({
        where: {
          trackableId: input.id,
          ...optionals,
        },
        // sort
        orderBy: { date: "asc" },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        trackableId: z.string(),
        date: z.date(),
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
          date: input.date,
        },
      });
    }),
});
