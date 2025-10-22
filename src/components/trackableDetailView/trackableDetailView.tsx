"use client";
import React, { useMemo } from "react";
import { type Trackable } from "@prisma/client";
import { BackButtonHeading } from "../ui/backButtonHeading";
import { TrackableContextButton } from "./trackableContextButton/trackableContextButton";
import { api } from "@/trpc/react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
  const { name, id, automation, createdAt, period, step, backUrl } = props;
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

  const records = useMemo(
    () => [
      ...recordsRaw
        .filter((record) => record.value !== -1) // Exclude streak break records from chart
        .map((record) => {
          const recordDate = new Date(record.recordedAt || record.date || new Date());
          return {
            value: record.value,
            date: `${recordDate.getDate()}.${recordDate.getMonth() <= 9 ? `0${recordDate.getMonth() + 1}` : recordDate.getMonth() + 1}`,
          };
        }),
    ],
    [recordsRaw],
  );

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
        <div className="mb-6 rounded-lg border-2 p-6" style={{ borderColor: props.color }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Current Streak
              </h3>
              <p className="mt-2 text-4xl font-bold" style={{ color: props.color }}>
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
        <ResponsiveContainer width="100%" height={500}>
          {/* TODO: make different charts configurable */}
          <LineChart
            className="mt-8"
            width={800}
            height={500}
            margin={{
              top: 16,
              right: 16,
              left: -32,
              bottom: 0,
            }}
            data={records}
          >
            <CartesianGrid strokeDasharray="" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              strokeWidth={4}
              dataKey="value"
              stroke={props.color}
            >
              <LabelList dataKey="value" position="top" offset={12} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="mx-auto mt-8 max-w-[500px] text-center text-2xl">
          <h2 className="mb-2 block text-3xl font-bold text-primary">
            No records were found!
          </h2>
          Try choosing a different period or adding new records using the
          floating button.
        </div>
      )}
    </div>
  );
};
