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
  updateStreakStartDate: protectedProcedure
    .input(
      z.object({
        trackableId: z.string(),
        startDate: z.string(), // ISO string
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the trackable
      const trackable = await ctx.db.trackable.findUnique({
        where: { id: input.trackableId },
        select: { userId: true },
      });

      if (!trackable || trackable.userId !== ctx.session.user.id) {
        throw new Error("Trackable not found");
      }

      const startDate = new Date(input.startDate);
      const localDate = startDate.toISOString().split('T')[0];

      // Find the most recent break record (value === -1)
      const existingBreakRecord = await ctx.db.record.findFirst({
        where: {
          trackableId: input.trackableId,
          value: -1,
        },
        orderBy: {
          recordedAt: 'desc',
        },
      });

      if (existingBreakRecord) {
        // Update existing break record
        return await ctx.db.record.update({
          where: { id: existingBreakRecord.id },
          data: {
            recordedAt: startDate,
            localDate: localDate,
          },
        });
      } else {
        // Create new break record
        return await ctx.db.record.create({
          data: {
            trackable: { connect: { id: input.trackableId } },
            value: -1,
            recordedAt: startDate,
            localDate: localDate,
          },
        });
      }
    }),
});
