"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { type Trackable } from "@prisma/client";

// Local enum definitions for type safety
enum TrackableType {
  COUNTER = "COUNTER",
  QUANTITY = "QUANTITY",
  BOOLEAN = "BOOLEAN",
  COMPOUND = "COMPOUND",
}

enum TrackablePeriod {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  NONE = "NONE",
}

enum TrackableVisibility {
  DASHBOARD = "DASHBOARD",
  HIDDEN = "HIDDEN",
}

enum TrackablePersistence {
  PERSISTENT = "PERSISTENT",
  HIDE_ON_FILL = "HIDE_ON_FILL",
}

enum GoalKind {
  ABSOLUTE = "ABSOLUTE",
  PER_PERIOD = "PER_PERIOD",
  STREAK = "STREAK",
}

enum GoalDirection {
  AT_LEAST = "AT_LEAST",
  AT_MOST = "AT_MOST",
}

interface EditTrackableDialogProps {
  trackableId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditTrackableDialog = ({
  trackableId,
  open,
  onOpenChange,
  onSuccess,
}: EditTrackableDialogProps) => {
  const router = useRouter();
  const utils = api.useUtils();

  // Fetch trackable data
  const { data: trackable, isLoading } = api.track.getTrackableById.useQuery(
    { id: trackableId },
    { enabled: open && !!trackableId }
  );

  // Fetch scenarios for selection
  const { data: scenarios = [] } = api.scenario.getMyScenarios.useQuery();

  // Basic fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [type, setType] = useState<TrackableType>(TrackableType.COUNTER);
  const [period, setPeriod] = useState<TrackablePeriod>(TrackablePeriod.DAILY);
  const [visibility, setVisibility] = useState<TrackableVisibility>(
    TrackableVisibility.DASHBOARD,
  );
  const [persistence, setPersistence] = useState<TrackablePersistence>(
    TrackablePersistence.PERSISTENT,
  );
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");

  // Type-specific fields
  const [unit, setUnit] = useState("");
  const [step, setStep] = useState("");
  const [automation, setAutomation] = useState<string>("manual");

  // Goal configuration
  const [hasGoal, setHasGoal] = useState(false);
  const [goalKind, setGoalKind] = useState<GoalKind>(GoalKind.PER_PERIOD);
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDirection, setGoalDirection] = useState<GoalDirection>(
    GoalDirection.AT_LEAST,
  );

  // Quick adds
  const [quickAddsInput, setQuickAddsInput] = useState("");

  // Chart type
  const [chartType, setChartType] = useState<"area" | "line" | "bar" | "composed">("area");

  // Reminder
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderSchedule, setReminderSchedule] = useState<
    "once-daily" | "multi-daily" | "none"
  >("once-daily");
  const [reminderTimes, setReminderTimes] = useState("09:00");
  const [muteWhenCompleted, setMuteWhenCompleted] = useState(true);

  // Populate form when trackable data loads
  useEffect(() => {
    if (trackable && open) {
      setName(trackable.name || "");
      setDescription(trackable.description || "");
      setIcon(trackable.icon || "");
      setType((trackable.type as TrackableType) || TrackableType.COUNTER);
      setPeriod((trackable.period as TrackablePeriod) || TrackablePeriod.DAILY);
      setVisibility((trackable.visibility as TrackableVisibility) || TrackableVisibility.DASHBOARD);
      setPersistence((trackable.persistence as TrackablePersistence) || TrackablePersistence.PERSISTENT);
      setSelectedScenarioId(trackable.scenarioId || "");
      setUnit(trackable.unit || "");
      setStep(trackable.step?.toString() || "");
      setAutomation(trackable.automation || "manual");
      setChartType((trackable.chartType as "area" | "line" | "bar" | "composed") || "area");

      // Parse goal
      if (trackable.goal && typeof trackable.goal === "object") {
        const goal = trackable.goal as { kind?: string; target?: number; direction?: string };
        if (goal.kind && goal.target) {
          setHasGoal(true);
          setGoalKind((goal.kind as GoalKind) || GoalKind.PER_PERIOD);
          setGoalTarget(goal.target.toString());
          setGoalDirection((goal.direction as GoalDirection) || GoalDirection.AT_LEAST);
        }
      } else {
        setHasGoal(false);
        setGoalTarget("");
      }

      // Parse quickAdds
      if (trackable.quickAdds && Array.isArray(trackable.quickAdds)) {
        setQuickAddsInput(trackable.quickAdds.join(", "));
      } else {
        setQuickAddsInput("");
      }

      // Parse reminder
      if (trackable.reminder && typeof trackable.reminder === "object") {
        const reminder = trackable.reminder as {
          schedule?: string;
          times?: string[];
          muteWhenCompleted?: boolean;
        };
        if (reminder.schedule) {
          setHasReminder(true);
          setReminderSchedule((reminder.schedule as "once-daily" | "multi-daily" | "none") || "once-daily");
          setReminderTimes(reminder.times?.join(", ") || "09:00");
          setMuteWhenCompleted(reminder.muteWhenCompleted ?? true);
        }
      } else {
        setHasReminder(false);
        setReminderTimes("09:00");
      }
    }
  }, [trackable, open]);

  const updateTrackable = api.track.update.useMutation({
    onSuccess: async () => {
      toast.success("Trackable updated successfully!");
      // Invalidate relevant queries
      await utils.track.getTrackableById.invalidate({ id: trackableId });
      await utils.track.getMyTrackables.invalidate();
      await utils.track.getTrackablesByScenarioId.invalidate();
      onOpenChange(false);
      onSuccess?.();
      // Refresh the page to get updated server-side data
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update trackable");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a trackable name");
      return;
    }

    // Validate goal if enabled
    if (hasGoal && (!goalTarget || isNaN(parseFloat(goalTarget)))) {
      toast.error("Please enter a valid goal target");
      return;
    }

    const quickAdds = quickAddsInput
      ? quickAddsInput
          .split(",")
          .map((v) => parseFloat(v.trim()))
          .filter((v) => !isNaN(v))
      : null;

    const goal =
      hasGoal && goalTarget
        ? {
            kind: goalKind as "ABSOLUTE" | "PER_PERIOD" | "STREAK",
            target: parseFloat(goalTarget),
            direction: goalDirection as "AT_LEAST" | "AT_MOST",
          }
        : null;

    const reminder = hasReminder
      ? {
          schedule: reminderSchedule,
          times: reminderTimes
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0),
          muteWhenCompleted,
        }
      : null;

    const mutationData = {
      id: trackableId,
      name: name.trim(),
      description: description.trim() || null,
      icon: icon.trim() || "",
      scenarioId: selectedScenarioId || null,
      type: type as "COUNTER" | "QUANTITY" | "BOOLEAN" | "COMPOUND",
      unit: unit.trim() || null,
      step: step ? parseFloat(step) : null,
      period: period as "DAILY" | "WEEKLY" | "MONTHLY" | "NONE",
      goal,
      quickAdds: quickAdds && quickAdds.length > 0 ? quickAdds : null,
      visibility: visibility as "DASHBOARD" | "HIDDEN",
      persistence: persistence as "PERSISTENT" | "HIDE_ON_FILL",
      automation: automation !== "manual" ? automation : null,
      reminder,
      template: null,
      chartType: chartType || undefined,
    };

    updateTrackable.mutate(mutationData);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Trackable</DialogTitle>
            <DialogDescription>Loading trackable data...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Trackable</DialogTitle>
            <DialogDescription>
              Update your trackable settings. All fields are optional except name.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4">
              <h3 className="font-semibold">Basic Information</h3>
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Water Intake, Push-ups, Pages Read"
                  maxLength={255}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon (emoji)</Label>
                  <Input
                    id="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="💧"
                    maxLength={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="scenario">Scenario</Label>
                  <select
                    id="scenario"
                    value={selectedScenarioId}
                    onChange={(e) => setSelectedScenarioId(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">No Scenario</option>
                    {scenarios.map((scenario) => (
                      <option key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Type & Configuration */}
            <div className="grid gap-4">
              <h3 className="font-semibold">Type & Configuration</h3>
              <div className="grid gap-2">
                <Label htmlFor="type">Trackable Type *</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as TrackableType)}
                  className="rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value={TrackableType.COUNTER}>
                    Counter (count things)
                  </option>
                  <option value={TrackableType.QUANTITY}>
                    Quantity (measure with units)
                  </option>
                  <option value={TrackableType.BOOLEAN}>
                    Boolean (yes/no)
                  </option>
                  <option value={TrackableType.COMPOUND}>
                    Compound (complex data)
                  </option>
                </select>
              </div>

              {type === TrackableType.QUANTITY && (
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="ml, kg, steps, pages..."
                    maxLength={50}
                  />
                </div>
              )}

              {(type === TrackableType.COUNTER ||
                type === TrackableType.QUANTITY) && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="step">Step Size</Label>
                    <Input
                      id="step"
                      type="number"
                      value={step}
                      onChange={(e) => setStep(e.target.value)}
                      placeholder="1"
                      step="any"
                      min="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="automation">Automation</Label>
                    <select
                      id="automation"
                      value={automation}
                      onChange={(e) => setAutomation(e.target.value)}
                      className="rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="manual">Manual Entry</option>
                      <option value="automatic-increment">
                        Automatic Increment (e.g., days without smoking)
                      </option>
                    </select>
                    {automation === "automatic-increment" && (
                      <p className="text-xs text-muted-foreground">
                        Value will auto-calculate based on time elapsed since creation.
                        Use "Break Streak" to reset.
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="period">Period *</Label>
                <select
                  id="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as TrackablePeriod)}
                  className="rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value={TrackablePeriod.DAILY}>Daily</option>
                  <option value={TrackablePeriod.WEEKLY}>Weekly</option>
                  <option value={TrackablePeriod.MONTHLY}>Monthly</option>
                  <option value={TrackablePeriod.NONE}>None (lifetime)</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="chartType">Chart Type</Label>
                <select
                  id="chartType"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as "area" | "line" | "bar" | "composed")}
                  className="rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="area">Area Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="composed">Composed Chart</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Choose how to visualize your tracking data
                </p>
              </div>
            </div>

            <Separator />

            {/* Goal */}
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasGoal"
                  checked={hasGoal}
                  onChange={(e) => setHasGoal(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="hasGoal" className="cursor-pointer">
                  Set a Goal
                </Label>
              </div>

              {hasGoal && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="goalKind">Goal Type</Label>
                      <select
                        id="goalKind"
                        value={goalKind}
                        onChange={(e) =>
                          setGoalKind(e.target.value as GoalKind)
                        }
                        className="rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value={GoalKind.PER_PERIOD}>Per Period</option>
                        <option value={GoalKind.ABSOLUTE}>
                          Absolute (lifetime)
                        </option>
                        <option value={GoalKind.STREAK}>Streak</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="goalTarget">Target</Label>
                      <Input
                        id="goalTarget"
                        type="number"
                        value={goalTarget}
                        onChange={(e) => setGoalTarget(e.target.value)}
                        placeholder="100"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="goalDirection">Direction</Label>
                    <select
                      id="goalDirection"
                      value={goalDirection}
                      onChange={(e) =>
                        setGoalDirection(e.target.value as GoalDirection)
                      }
                      className="rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value={GoalDirection.AT_LEAST}>At Least</option>
                      <option value={GoalDirection.AT_MOST}>At Most</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Quick Adds */}
            <div className="grid gap-2">
              <Label htmlFor="quickAdds">Quick Add Values</Label>
              <Input
                id="quickAdds"
                value={quickAddsInput}
                onChange={(e) => setQuickAddsInput(e.target.value)}
                placeholder="250, 500, 1000 (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">
                Quick buttons for fast entry
              </p>
            </div>

            <Separator />

            {/* Display Settings */}
            <div className="grid gap-4">
              <h3 className="font-semibold">Display Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <select
                    id="visibility"
                    value={visibility}
                    onChange={(e) =>
                      setVisibility(e.target.value as TrackableVisibility)
                    }
                    className="rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value={TrackableVisibility.DASHBOARD}>
                      Dashboard
                    </option>
                    <option value={TrackableVisibility.HIDDEN}>Hidden</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="persistence">Persistence</Label>
                  <select
                    id="persistence"
                    value={persistence}
                    onChange={(e) =>
                      setPersistence(e.target.value as TrackablePersistence)
                    }
                    className="rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value={TrackablePersistence.PERSISTENT}>
                      Always Show
                    </option>
                    <option value={TrackablePersistence.HIDE_ON_FILL}>
                      Hide When Filled
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Reminders */}
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasReminder"
                  checked={hasReminder}
                  onChange={(e) => setHasReminder(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="hasReminder" className="cursor-pointer">
                  Set Reminders
                </Label>
              </div>

              {hasReminder && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="reminderSchedule">Schedule</Label>
                    <select
                      id="reminderSchedule"
                      value={reminderSchedule}
                      onChange={(e) =>
                        setReminderSchedule(
                          e.target.value as "once-daily" | "multi-daily",
                        )
                      }
                      className="rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="once-daily">Once Daily</option>
                      <option value="multi-daily">Multiple Times</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="reminderTimes">Times</Label>
                    <Input
                      id="reminderTimes"
                      value={reminderTimes}
                      onChange={(e) => setReminderTimes(e.target.value)}
                      placeholder="09:00, 12:00, 18:00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated times (HH:MM format)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="muteWhenCompleted"
                      checked={muteWhenCompleted}
                      onChange={(e) => setMuteWhenCompleted(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="muteWhenCompleted"
                      className="cursor-pointer text-sm"
                    >
                      Mute when goal completed
                    </Label>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTrackable.isPending}>
              {updateTrackable.isPending ? "Updating..." : "Update Trackable"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

