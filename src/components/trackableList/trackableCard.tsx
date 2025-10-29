"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Heading } from "../ui/heading";
import { calculateAutomaticValue, formatAutomaticValue } from "@/lib/trackableUtils";
import { api } from "@/trpc/react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { NewRecordForm } from "../trackableDetailView/trackableContextButton/newRecordForm";
import { PlusIcon } from "@radix-ui/react-icons";

interface TrackableCardProps {
  id: string;
  name: string;
  icon?: string;
  type: string;
  period: string;
  unit?: string | null;
  automation?: string | null;
  step?: number | null;
  createdAt: Date;
  scenarioId?: string | null;
  quickAdds?: number[] | null;
  persistence?: string | null;
  goal?: {
    kind: string;
    target: number;
    direction: string;
  } | null;
}

export const TrackableCard = ({
  id,
  name,
  icon,
  type: _type,
  period,
  unit,
  automation,
  step,
  createdAt,
  scenarioId,
  quickAdds: _quickAdds,
  persistence,
  goal,
}: TrackableCardProps) => {
  const isAutomatic = automation === "automatic-increment";
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Fetch scenario data to get the color
  const { data: scenarios = [] } = api.scenario.getMyScenarios.useQuery();
  const scenario = scenarios.find(s => s.id === scenarioId);
  const color = scenario?.color ?? "gray-500"; // fallback color

  // Fetch records to calculate current value and progress
  const { data: records = [] } = api.record.getRecordsByTrackableId.useQuery(
    { id },
    { enabled: true },
  );

  const currentValue = useMemo(() => {
    if (isAutomatic) {
      // Find the most recent "break" record
      const breakRecord = records
        .filter((r) => r.value === -1)
        .sort(
          (a, b) =>
            new Date(b.recordedAt).getTime() -
            new Date(a.recordedAt).getTime(),
        )[0];

      const startDate = breakRecord
        ? breakRecord.recordedAt
        : null;

      return calculateAutomaticValue(createdAt, period, step ?? 1, startDate);
    } else {
      // For manual trackables, calculate current period value
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // Get today's records
      const todayRecords = records.filter(record => {
        const recordDate = record.recordedAt?.toISOString().split('T')[0];
        return recordDate === today;
      });

      // Sum up today's values
      return todayRecords.reduce((sum, record) => sum + (record.value ?? 0), 0);
    }
  }, [isAutomatic, records, createdAt, period, step]);

  const goalProgress = useMemo(() => {
    if (!goal || currentValue === null) return null;

    const progress = (currentValue / goal.target) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [goal, currentValue]);


  // Check if goal is completed for current period
  const isGoalCompleted = useMemo(() => {
    if (!goal || currentValue === null) return false;
    return currentValue >= goal.target;
  }, [goal, currentValue]);

  // Check if this card should be hidden (hide-on-fill + goal completed)
  const shouldHide = useMemo(() => {
    return persistence === "HIDE_ON_FILL" && isGoalCompleted;
  }, [persistence, isGoalCompleted]);

  // Animation state for completion
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  // Trigger completion animation when goal is completed
  React.useEffect(() => {
    if (isGoalCompleted && !showCompletionAnimation) {
      setShowCompletionAnimation(true);
      // Hide the animation after 2 seconds
      setTimeout(() => setShowCompletionAnimation(false), 2000);
    }
  }, [isGoalCompleted, showCompletionAnimation]);

  // Don't render if should be hidden
  if (shouldHide) {
    return null;
  }

  const href = scenarioId ? `/scenarios/${scenarioId}/${id}` : `/tracker/${id}`;

  return (
    <div className="group relative transform rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg overflow-hidden"
      style={{
        borderColor: `hsl(var(--${color}))`,
      }}
    >
      {/* Completion Animation */}
      {showCompletionAnimation && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl animate-bounce">🎉</div>
            <div className="text-lg font-bold text-green-600">Goal Completed!</div>
          </div>
        </div>
      )}

      {/* Background fill based on goal progress - covers entire card height */}
      {goalProgress !== null && (
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: `linear-gradient(to right, hsl(var(--${color}) / 0.15) ${goalProgress}%, transparent ${goalProgress}%)`,
          }}
        />
      )}

      <div className="relative p-3">
        <div className="flex items-center justify-between">
          <Link href={href} className="flex-1">
            <div className="flex items-center gap-2">
              {icon && <span className="text-lg">{icon}</span>}
              <Heading
                element="h3"
                className="text-lg font-medium"
                style={{
                  color: `hsl(var(--${color}))`,
                }}
              >
                {name}
              </Heading>
            </div>

            {/* Current value display */}
            <div className="mt-2">
              <p
                className="text-2xl font-bold"
                style={{ color: `hsl(var(--${color}))` }}
              >
                {currentValue !== null ? (
                  isAutomatic ?
                    formatAutomaticValue(currentValue, period, unit) :
                    `${currentValue}${unit ? ` ${unit}` : ''}`
                ) : (
                  "0"
                )}
              </p>
            </div>
          </Link>

          {/* Quick Add Button - outside the Link */}
          <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="ml-2 h-8 w-8 p-0"
                style={{
                  borderColor: `hsl(var(--${color}))`,
                  color: `hsl(var(--${color}))`,
                }}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Record - {name}</DialogTitle>
              </DialogHeader>
              <NewRecordForm trackableId={id} onSuccess={() => setIsQuickAddOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

