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
            recordedAt: {
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
        orderBy: { recordedAt: "asc" },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        trackableId: z.string(),
        value: z.number(),
        recordedAt: z.string().optional(),
        data: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const recordedAt = input.recordedAt ? new Date(input.recordedAt) : new Date();
      const localDate = recordedAt.toISOString().split('T')[0];

      return await ctx.db.record.create({
        data: {
          trackable: { connect: { id: input.trackableId } },
          value: input.value,
          recordedAt: recordedAt,
          localDate: localDate,
          data: input.data as never,
        },
      });
    }),
});
