import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const trackRouter = createTRPCRouter({
  getMyTrackables: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.trackable.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        color: z.string().min(1).max(7),
        icon: z.string().min(0).max(2).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.trackable.create({
        data: {
          name: input.name,
          user: { connect: { id: ctx.session.user.id } },
          icon: input.icon ?? "",
          color: input.color,
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is the owner of this trackable
      const trackable = await ctx.db.trackable.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!trackable || trackable.userId !== ctx.session.user.id) {
        throw new Error("Trackable not found");
      }

      return await ctx.db.trackable.delete({
        where: {
          id: input.id,
        },
      });
    }),
  getTrackableById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Check if user is the owner of this trackable
      const trackable = await ctx.db.trackable.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!trackable || trackable.userId !== ctx.session.user.id) {
        throw new Error("Trackable not found");
      }
      return await ctx.db.trackable.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
});
