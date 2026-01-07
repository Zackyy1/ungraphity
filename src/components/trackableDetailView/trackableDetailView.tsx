"use client";
import React, { useMemo } from "react";
import { type Trackable } from "@prisma/client";
import { BackButton } from "../ui/backButton";
import { Heading } from "../ui/heading";
import { TrackableContextButton } from "./trackableContextButton/trackableContextButton";
import { TrackableContextDropdown } from "./trackableContextButton/trackableContextDropdown";
import { api } from "@/trpc/react";
import { renderChart, type ChartType } from "@/lib/chartUtils";
import { type DateRange } from "react-day-picker";
import { addDays, addMonths, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import {
  calculateAutomaticValue,
  formatAutomaticValue,
  calculateStreak,
  roundToStep,
  formatNumberForDisplay,
} from "@/lib/trackableUtils";
import { toast } from "sonner";

interface TrackableDetailViewProps extends Trackable {
  backUrl?: string;
}

export const TrackableDetailView = (props: TrackableDetailViewProps) => {
  const { name, id, automation, createdAt, period, step, backUrl, scenarioId, chartType } = props;
  const [localChartType, setLocalChartType] = React.useState<ChartType | null>(
    (chartType as ChartType) || "area"
  );

  // Fetch scenario data to get the color
  const { data: scenarios = [] } = api.scenario.getMyScenarios.useQuery();
  const scenario = scenarios.find(s => s.id === scenarioId);
  const color = scenario?.color || "gray-500"; // fallback color
  const defaultDate = useMemo(
    () => ({
      from: addMonths(new Date(), -1),
      to: new Date(),
    }),
    [],
  );
  const [date, setDate] = React.useState<DateRange | undefined>(defaultDate);

  const { data: recordsRaw = [], refetch } = api.record.getRecordsByTrackableId.useQuery(
    {
      id,
      dateRange: date
        ? date.from &&
        date.to && {
          from: date.from.toUTCString(),
          to: addDays(date.to, 1).toUTCString(),
        }
        : undefined,
    },
  );

  const createRecord = api.record.create.useMutation({
    onSuccess: () => {
      toast.success("Streak broken and reset");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to break streak");
    },
  });

  const updateChartType = api.track.updateChartType.useMutation({
    onSuccess: () => {
      toast.success("Chart type updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update chart type");
      // Revert on error
      setLocalChartType((chartType as ChartType) || "area");
    },
  });

  const handleChartTypeChange = (newType: ChartType) => {
    setLocalChartType(newType);
    updateChartType.mutate({
      id,
      chartType: newType,
    });
  };

  // Check if this is an automatic trackable
  const isAutomatic = automation === "automatic-increment";

  // Calculate automatic value if applicable
  const automaticValue = useMemo(() => {
    if (!isAutomatic) return null;

    // Find the most recent "break" record to use as start date
    const breakRecord = recordsRaw
      .filter((r) => r.value === -1) // -1 indicates a streak break
      .sort((a, b) => new Date(b.recordedAt || 0).getTime() - new Date(a.recordedAt || 0).getTime())[0];

    const startDate = breakRecord ? breakRecord.recordedAt : null;

    return calculateAutomaticValue(
      createdAt,
      period,
      step || 1,
      startDate,
    );
  }, [isAutomatic, createdAt, period, step, recordsRaw]);

  const handleBreakStreak = () => {
    if (!confirm("Are you sure you want to break your streak? This will reset your counter.")) {
      return;
    }

    // Create a special record with value -1 to indicate streak break
    createRecord.mutate({
      trackableId: id,
      value: -1,
      recordedAt: new Date().toISOString(),
    });
  };

  const records = useMemo(() => {
    const filteredRecords = recordsRaw.filter((record) => record.value !== -1);

    // Group records by date for better visualization
    const groupedRecords = new Map<string, number>();

    filteredRecords.forEach((record) => {
      const recordDate = new Date(record.recordedAt || new Date());
      const dateKey = recordDate.toISOString().split('T')[0] || ''; // YYYY-MM-DD format
      if (!dateKey) return; // Skip invalid dates
      const currentValue = groupedRecords.get(dateKey) || 0;
      const recordValue = roundToStep(record.value || 0, step || null);
      groupedRecords.set(dateKey, roundToStep(currentValue + recordValue, step || null));
    });

    // Convert to array and sort by date, rounding values
    return Array.from(groupedRecords.entries())
      .map(([date, value]) => ({
        date,
        value: roundToStep(value, step),
        displayDate: format(new Date(date), "MMM dd"),
        fullDate: format(new Date(date), "MMM dd, yyyy"),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [recordsRaw, step]);

  // Calculate statistics for better insights
  const stats = useMemo(() => {
    if (records.length === 0) return null;

    const values = records.map(r => r.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const goalTarget = props.goal && typeof props.goal === 'object' && 'target' in props.goal 
      ? (props.goal as { target: number }).target 
      : undefined;
    const currentStreak = calculateStreak(recordsRaw, period, goalTarget);

    return {
      total: roundToStep(total, props.step),
      average: roundToStep(average, props.step),
      max: roundToStep(max, props.step),
      min: roundToStep(min, props.step),
      currentStreak,
      totalDays: records.length,
    };
  }, [records, recordsRaw, period, props.goal, props.step]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const roundedValue = formatNumberForDisplay(data.value, step || null);
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-medium">{data.fullDate}</p>
          <p className="text-sm" style={{ color: `hsl(var(--${color}))` }}>
            Value: <span className="font-semibold">{roundedValue}</span>
            {props.unit && ` ${props.unit}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const durationSelector = () => {
    return (
      <fieldset className="flex flex-row items-center">
        <legend className="float-left mr-4 text-lg">Period</legend>
        <div className={cn("grid gap-2")}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-center font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                captionLayout="dropdown"
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                max={365}
              />
              <Button
                className="tracker-duration-calendar-reset-button mb-3 ml-3"
                onClick={() => setDate(defaultDate)}
              >
                Reset
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </fieldset>
    );
  };

  const [contextMenu, setContextMenu] = React.useState<
    "delete" | "change-streak-start" | "edit" | null
  >(null);

  return (
    <div className="pb-28">
      <TrackableContextButton 
        trackableId={id} 
        automation={automation} 
        createdAt={createdAt}
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
      />
      <div className="mb-6 flex items-start gap-3">
        <div className="flex items-center justify-center pt-1">
          <BackButton href={backUrl || "/tracker"} />
        </div>
        <div className="flex flex-1 items-start justify-between gap-2">
          <Heading text={name} className="text-2xl" />
          <div className="pt-1">
            <TrackableContextDropdown 
              setChosenMenu={(menu) => setContextMenu(menu)}
              isAutomatic={isAutomatic}
            />
          </div>
        </div>
      </div>
      <div className="mb-6">
        {durationSelector()}
      </div>

      {/* Automatic Value Display */}
      {isAutomatic && automaticValue !== null && (
        <div className="mb-6 rounded-lg border-2 p-6" style={{ borderColor: `hsl(var(--${color}))` }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Current Streak
              </h3>
              <p className="mt-2 text-4xl font-bold" style={{ color: `hsl(var(--${color}))` }}>
                {formatAutomaticValue(roundToStep(automaticValue, step || 1), period, props.unit)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Auto-calculated since {recordsRaw.find(r => r.value === -1) ? "last break" : "creation"}
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleBreakStreak}
              disabled={createRecord.isPending}
            >
              {createRecord.isPending ? "Breaking..." : "Break Streak"}
            </Button>
          </div>
        </div>
      )}

      {!!recordsRaw.length ? (
        <div className="mt-8 space-y-6">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold" style={{ color: `hsl(var(--${color}))` }}>
                  {formatNumberForDisplay(stats.total, props.step)}
                  {props.unit && <span className="text-sm text-muted-foreground"> {props.unit}</span>}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">Average</p>
                <p className="text-2xl font-bold" style={{ color: `hsl(var(--${color}))` }}>
                  {formatNumberForDisplay(stats.average, props.step)}
                  {props.unit && <span className="text-sm text-muted-foreground"> {props.unit}</span>}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">Best Day</p>
                <p className="text-2xl font-bold" style={{ color: `hsl(var(--${color}))` }}>
                  {formatNumberForDisplay(stats.max, props.step)}
                  {props.unit && <span className="text-sm text-muted-foreground"> {props.unit}</span>}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold" style={{ color: `hsl(var(--${color}))` }}>
                  {stats.currentStreak} 🔥
                </p>
              </div>
            </div>
          )}

          {/* Chart Section - Hidden for automatic/streak trackables */}
          {!isAutomatic && (
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Progress Chart</h3>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {records.length} {records.length === 1 ? 'day' : 'days'} tracked
                  </div>
                  <select
                    value={localChartType || "area"}
                    onChange={(e) => handleChartTypeChange(e.target.value as ChartType)}
                    disabled={updateChartType.isPending}
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  >
                    <option value="area">Area</option>
                    <option value="line">Line</option>
                    <option value="bar">Bar</option>
                    <option value="composed">Composed</option>
                  </select>
                </div>
              </div>

              {renderChart(localChartType, {
                data: records,
                color,
                CustomTooltip,
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-[500px] text-center">
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-12">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              No records found
            </h2>
            <p className="text-muted-foreground">
              Start tracking by adding your first record using the + button above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
