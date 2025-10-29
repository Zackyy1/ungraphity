import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const scenarioRouter = createTRPCRouter({
  getMyScenarios: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.scenario.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        _count: {
          select: { trackables: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        color: z.string().min(1).max(50),
        icon: z.string().min(0).max(2).optional(),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.scenario.create({
        data: {
          name: input.name,
          user: { connect: { id: ctx.session.user.id } },
          icon: input.icon ?? "",
          color: input.color,
          description: input.description ?? "",
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
      const scenario = await ctx.db.scenario.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!scenario || scenario.userId !== ctx.session.user.id) {
        throw new Error("Scenario not found");
      }

      return await ctx.db.scenario.delete({
        where: {
          id: input.id,
        },
      });
    }),
  getScenarioById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const scenario = await ctx.db.scenario.findUnique({
        where: {
          id: input.id,
        },
        include: {
          trackables: true,
          _count: {
            select: { trackables: true },
          },
        },
      });
      if (!scenario || scenario.userId !== ctx.session.user.id) {
        throw new Error("Scenario not found");
      }
      return scenario;
    }),
});

