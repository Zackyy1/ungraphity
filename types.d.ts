// IDs are ULIDs. Times are ISO 8601 in user's timezone offset.

type Scenario = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  trackableIds: string[];
  isArchived: boolean;
};

type Trackable = {
  id: string;
  scenarioId: string;
  name: string;
  description?: string;

  // Presentation
  visibility: "dashboard" | "hidden";
  persistence: "persistent" | "hide-on-fill"; // card stays after input or hides for the period
  sortOrder?: number;

  // Measurement
  valueType:
    | "counter"
    | "boolean"
    | "quantity"
    | "duration"
    | "rating"
    | "enum"
    | "compound";
  unit?: string; // e.g., ml, kg, pages
  step?: number; // minimal UI increment
  decimals?: number; // 0 for integers

  // Periodization for goals and completion
  period:
    | "none"
    | "daily"
    | "weekly"
    | "monthly"
    | "rolling-7d"
    | "rolling-30d";

  // Goals (optional)
  goal?: Goal;

  // Quick input
  quickAdds?: number[]; // e.g., [250, 750, 1000]

  // Reminders
  reminder?: Reminder;

  // Automation
  automation?: Automation;

  // Derived metrics
  computedFrom?: Computation; // optional formula from other trackables
  isArchived: boolean;
};

type Goal = {
  kind: "absolute" | "per-period" | "streak";
  target: number; // e.g., 2000 ml, 30 pages, 365 days
  direction: "at-least" | "at-most"; // default "at-least"
};

type Reminder = {
  schedule: "none" | "once-daily" | "multi-daily" | "weekly" | "custom-cron";
  times?: string[]; // "08:00", "12:00"
  daysOfWeek?: number[]; // 1=Mon..7=Sun
  snoozeMinutes?: number; // default 30
  muteWhenCompleted: boolean; // per period
};

type Automation = {
  type: "automatic-increment" | "import" | "webhook";
  // automatic-increment: adds +1 per completed day if no relapse flag
  // import/webhook: external data sources (steps, weight, water, etc.)
};

type Computation = {
  formula: string;
  inputs: string[]; // trackable IDs
};

type Record = {
  id: string;
  trackableId: string;
  at: string; // timestamp
  // For simple types:
  value?: number | boolean | string;
  // For compound entries (e.g., gym sets):
  payload?: any; // JSON object validated by trackable template
  note?: string;
  source: "manual" | "auto" | "import";
};
