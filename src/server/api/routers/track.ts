import { z } from "zod";
import {
  TrackableType,
  TrackablePeriod,
  TrackableVisibility,
  TrackablePersistence,
} from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// Validation schemas for JSON fields
const goalSchema = z
  .object({
    kind: z.enum(["ABSOLUTE", "PER_PERIOD", "STREAK"]),
    target: z.number().positive(),
    direction: z.enum(["AT_LEAST", "AT_MOST"]),
  })
  .optional();

const reminderSchema = z
  .object({
    schedule: z.enum(["once-daily", "multi-daily", "none"]),
    times: z.array(z.string()),
    muteWhenCompleted: z.boolean(),
  })
  .optional();

const quickAddsSchema = z.array(z.number()).optional();

const templateSchema = z.record(z.unknown()).optional();

export const trackRouter = createTRPCRouter({
  getMyTrackables: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.trackable.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  getTrackablesByScenarioId: protectedProcedure
    .input(
      z.object({
        scenarioId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.trackable.findMany({
        where: {
          userId: ctx.session.user.id,
          scenarioId: input.scenarioId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  hasTrackables: protectedProcedure.query(async ({ ctx }) => {
    return (
      (await ctx.db.trackable.count({
        where: {
          userId: ctx.session.user.id,
        },
      })) > 0
    );
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(500).optional(),
        icon: z.string().min(0).max(2).optional(),
        scenarioId: z.string().optional(),
        type: z.nativeEnum(TrackableType),
        unit: z.string().max(50).optional(),
        step: z.number().positive().optional(),
        period: z.nativeEnum(TrackablePeriod),
        goal: goalSchema,
        quickAdds: quickAddsSchema,
        visibility: z.nativeEnum(TrackableVisibility),
        persistence: z.nativeEnum(TrackablePersistence),
        automation: z.string().max(100).optional(),
        reminder: reminderSchema,
        template: templateSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get scenario color if scenarioId is provided
        let scenarioColor = "gray-500"; // default fallback color
        if (input.scenarioId) {
          const scenario = await ctx.db.scenario.findUnique({
            where: { id: input.scenarioId },
            select: { color: true },
          });
          if (scenario) {
            scenarioColor = scenario.color;
          }
        }

        // Build data object, omitting undefined values
        const data: Record<string, unknown> = {
          name: input.name,
          user: { connect: { id: ctx.session.user.id } },
          icon: input.icon ?? "",
          color: scenarioColor, // Use scenario color for legacy support
          type: input.type,
          period: input.period,
          visibility: input.visibility,
          persistence: input.persistence,
        };

        // Only add optional fields if they have values
        if (input.description) data.description = input.description;
        if (input.scenarioId) data.scenario = { connect: { id: input.scenarioId } };
        if (input.unit) data.unit = input.unit;
        if (input.step !== undefined && input.step !== null) data.step = input.step;
        if (input.goal) data.goal = input.goal;
        if (input.quickAdds && input.quickAdds.length > 0) data.quickAdds = input.quickAdds;
        if (input.automation) data.automation = input.automation;
        if (input.reminder) data.reminder = input.reminder;
        if (input.template) data.template = input.template;

        console.log("Creating trackable with data:", JSON.stringify(data, null, 2));

        return await ctx.db.trackable.create({
          data: data as never,
        });
      } catch (error) {
        console.error("Error creating trackable:", error);
        throw error;
      }
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
