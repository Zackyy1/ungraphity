import {
  TrackableType,
  TrackablePeriod,
  TrackableVisibility,
  TrackablePersistence,
} from "@prisma/client";

// Enums that aren't exported by Prisma (used in JSON fields, not as model field types)
export enum GoalKind {
  ABSOLUTE = "ABSOLUTE",
  PER_PERIOD = "PER_PERIOD",
  STREAK = "STREAK",
}

export enum GoalDirection {
  AT_LEAST = "AT_LEAST",
  AT_MOST = "AT_MOST",
}

// Goal configuration types
export interface TrackableGoal {
  kind: GoalKind;
  target: number;
  direction: GoalDirection;
}

// Reminder configuration types
export type ReminderSchedule = "once-daily" | "multi-daily" | "none";

export interface TrackableReminder {
  schedule: ReminderSchedule;
  times: string[]; // Array of time strings like ["09:00", "12:00"]
  muteWhenCompleted: boolean;
}

// Template types for compound trackables
export type CompoundTemplate = Record<string, unknown>

// Record data types
export type CompoundRecordData = Record<string, unknown>

// Export Prisma enums for convenience
export {
  TrackableType,
  TrackablePeriod,
  TrackableVisibility,
  TrackablePersistence,
};

// Helper type for quick adds
export type QuickAdds = number[];

