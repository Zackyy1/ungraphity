import {
  TrackableType,
  TrackablePeriod,
  TrackableVisibility,
  TrackablePersistence,
  GoalKind,
  GoalDirection,
} from "@prisma/client";

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
export interface CompoundTemplate {
  [key: string]: unknown; // Flexible structure defined by user
}

// Record data types
export interface CompoundRecordData {
  [key: string]: unknown; // Flexible structure matching the template
}

// Export enums for convenience
export {
  TrackableType,
  TrackablePeriod,
  TrackableVisibility,
  TrackablePersistence,
  GoalKind,
  GoalDirection,
};

// Helper type for quick adds
export type QuickAdds = number[];

