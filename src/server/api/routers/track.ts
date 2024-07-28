import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const trackRouter = createTRPCRouter({
  getMyTrackables: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.trackable.findMany({
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
        icon: z.string().min(1).max(2).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.trackable.create({
        data: {
          name: input.name,
          user: { connect: { id: ctx.session.user.id } },
          icon: input.icon ?? '',
          color: input.color,
        },
      });
    }),
});
