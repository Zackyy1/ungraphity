"use client";
import React, { useMemo } from "react";
import { type Trackable } from "@prisma/client";
import { BackButtonHeading } from "../ui/backButtonHeading";
import { TrackableContextButton } from "./trackableContextButton/trackableContextButton";
import { api } from "@/trpc/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Cell,
  Legend,
} from "recharts";
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
} from "@/lib/trackableUtils";
import { toast } from "sonner";

interface TrackableDetailViewProps extends Trackable {
  backUrl?: string;
}

export const TrackableDetailView = (props: TrackableDetailViewProps) => {
  const { name, id, automation, createdAt, period, step, backUrl, scenarioId } = props;
  
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

  // Check if this is an automatic trackable
  const isAutomatic = automation === "automatic-increment";

  // Calculate automatic value if applicable
  const automaticValue = useMemo(() => {
    if (!isAutomatic) return null;
    
    // Find the most recent "break" record to use as start date
    const breakRecord = recordsRaw
      .filter((r) => r.value === -1) // -1 indicates a streak break
      .sort((a, b) => new Date(b.recordedAt || b.date || 0).getTime() - new Date(a.recordedAt || a.date || 0).getTime())[0];
    
    const startDate = breakRecord ? (breakRecord.recordedAt || breakRecord.date) : null;
    
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
      const recordDate = new Date(record.recordedAt || record.date || new Date());
      const dateKey = recordDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentValue = groupedRecords.get(dateKey) || 0;
      groupedRecords.set(dateKey, currentValue + (record.value || 0));
    });

    // Convert to array and sort by date
    return Array.from(groupedRecords.entries())
      .map(([date, value]) => ({
        date,
        value,
        displayDate: format(new Date(date), "MMM dd"),
        fullDate: format(new Date(date), "MMM dd, yyyy"),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [recordsRaw]);

  // Calculate statistics for better insights
  const stats = useMemo(() => {
    if (records.length === 0) return null;
    
    const values = records.map(r => r.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const currentStreak = calculateStreak(recordsRaw, period, props.goal?.target);
    
    return {
      total,
      average: Math.round(average * 100) / 100,
      max,
      min,
      currentStreak,
      totalDays: records.length,
    };
  }, [records, recordsRaw, period, props.goal]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-medium">{data.fullDate}</p>
          <p className="text-sm" style={{ color: `hsl(var(--${color}))` }}>
            Value: <span className="font-semibold">{data.value}</span>
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

  return (
    <div>
      <TrackableContextButton trackableId={id} />
      <BackButtonHeading
        backButtonProps={{ href: backUrl || "/tracker" }}
        headingProps={{ text: name }}
        extraContent={durationSelector()}
      />

      {/* Automatic Value Display */}
      {isAutomatic && automaticValue !== null && (
        <div className="mb-6 rounded-lg border-2 p-6" style={{ borderColor: `hsl(var(--${color}))` }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Current Streak
              </h3>
              <p className="mt-2 text-4xl font-bold" style={{ color: `hsl(var(--${color}))` }}>
                {formatAutomaticValue(automaticValue, period, props.unit)}
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
                  {stats.total}
                  {props.unit && <span className="text-sm text-muted-foreground"> {props.unit}</span>}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">Average</p>
                <p className="text-2xl font-bold" style={{ color: `hsl(var(--${color}))` }}>
                  {stats.average}
                  {props.unit && <span className="text-sm text-muted-foreground"> {props.unit}</span>}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">Best Day</p>
                <p className="text-2xl font-bold" style={{ color: `hsl(var(--${color}))` }}>
                  {stats.max}
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

          {/* Chart Section */}
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Progress Chart</h3>
              <div className="text-sm text-muted-foreground">
                {records.length} {records.length === 1 ? 'day' : 'days'} tracked
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={records}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`hsl(var(--${color}))`} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={`hsl(var(--${color}))`} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--muted))" 
                  opacity={0.3}
                />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={`hsl(var(--${color}))`}
                  strokeWidth={3}
                  fill={`url(#gradient-${color})`}
                  dot={{ fill: `hsl(var(--${color}))`, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: `hsl(var(--${color}))`, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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
