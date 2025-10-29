"use client";

import { useMemo } from "react";
import { api } from "@/trpc/react";
import {
  calculateAutomaticValue,
  formatAutomaticValue,
} from "@/lib/trackableUtils";

interface TrackableValueDisplayProps {
  trackableId: string;
  automation?: string | null;
  createdAt: Date;
  period: string;
  step?: number | null;
  unit?: string | null;
  color: string;
}

export const TrackableValueDisplay = ({
  trackableId,
  automation,
  createdAt,
  period,
  step,
  unit,
  color,
}: TrackableValueDisplayProps) => {
  const isAutomatic = automation === "automatic-increment";

  const { data: records = [] } = api.record.getRecordsByTrackableId.useQuery(
    { id: trackableId },
    { enabled: isAutomatic },
  );

  const currentValue = useMemo(() => {
    if (!isAutomatic) return null;

    const breakRecord = records
      .filter((r) => r.value === -1)
      .sort(
        (a, b) =>
          // @ts-expect-error - date is not present in the Record type
          new Date(b.recordedAt ?? b.date ?? new Date()).getTime() -
          // @ts-expect-error - date is not present in the Record type
          new Date(a.recordedAt ?? a.date ?? 0).getTime(),
      )[0];

    const startDate = breakRecord
      // @ts-expect-error - date is not present in the Record type
      ? breakRecord.recordedAt ?? breakRecord.date
      : null;

    return calculateAutomaticValue(createdAt, period, step ?? 1, startDate);
  }, [isAutomatic, records, createdAt, period, step]);

  if (!isAutomatic || currentValue === null) return null;

  return (
    <div className="mt-2">
      <p className="text-2xl font-bold" style={{ color: `hsl(var(--${color}))` }}>
        {formatAutomaticValue(currentValue, period, unit)}
      </p>
    </div>
  );
};

