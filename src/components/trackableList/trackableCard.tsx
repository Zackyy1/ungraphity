"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Heading } from "../ui/heading";
import { calculateAutomaticValue, formatAutomaticValue } from "@/lib/trackableUtils";
import { api } from "@/trpc/react";

interface TrackableCardProps {
  id: string;
  name: string;
  icon?: string;
  color: string;
  type: string;
  period: string;
  unit?: string | null;
  automation?: string | null;
  step?: number | null;
  createdAt: Date;
  scenarioId?: string | null;
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
  color,
  type,
  period,
  unit,
  automation,
  step,
  createdAt,
  scenarioId,
  goal,
}: TrackableCardProps) => {
  const isAutomatic = automation === "automatic-increment";

  // Fetch records to calculate accurate value (including breaks)
  const { data: records = [] } = api.record.getRecordsByTrackableId.useQuery(
    { id },
    { enabled: isAutomatic },
  );

  const currentValue = useMemo(() => {
    if (!isAutomatic) return null;

    // Find the most recent "break" record
    const breakRecord = records
      .filter((r) => r.value === -1)
      .sort(
        (a, b) =>
          new Date(b.recordedAt || b.date || 0).getTime() -
          new Date(a.recordedAt || a.date || 0).getTime(),
      )[0];

    const startDate = breakRecord
      ? breakRecord.recordedAt || breakRecord.date
      : null;

    return calculateAutomaticValue(createdAt, period, step || 1, startDate);
  }, [isAutomatic, records, createdAt, period, step]);

  const goalProgress = useMemo(() => {
    if (!goal || currentValue === null) return null;
    
    const progress = (currentValue / goal.target) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [goal, currentValue]);

  const href = scenarioId ? `/scenarios/${scenarioId}/${id}` : `/tracker/${id}`;

  return (
    <Link
      href={href}
      className="group block transform rounded-lg border-2 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      style={{
        borderColor: `hsl(var(--${color}))`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <Heading
              element="h3"
              className="text-xl font-medium"
              style={{
                color: `hsl(var(--${color}))`,
              }}
            >
              {name}
            </Heading>
          </div>

          {isAutomatic && currentValue !== null && (
            <div className="mt-3">
              <p
                className="text-3xl font-bold"
                style={{ color: `hsl(var(--${color}))` }}
              >
                {formatAutomaticValue(currentValue, period, unit)}
              </p>
              {goal && (
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${goalProgress}%`,
                        backgroundColor: `hsl(var(--${color}))`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Goal: {goal.target} {unit || period.toLowerCase()}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isAutomatic && (
            <p className="mt-2 text-sm text-muted-foreground">
              {type === "COUNTER"
                ? "Counter"
                : type === "QUANTITY"
                  ? `Quantity (${unit || "units"})`
                  : type === "BOOLEAN"
                    ? "Yes/No"
                    : "Complex"}
              {" • "}
              {period === "DAILY"
                ? "Daily"
                : period === "WEEKLY"
                  ? "Weekly"
                  : period === "MONTHLY"
                    ? "Monthly"
                    : "Lifetime"}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

