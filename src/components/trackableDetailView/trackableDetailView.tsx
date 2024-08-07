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

export const TrackableDetailView = (props: Trackable) => {
  const { name, id } = props;
  const defaultDate = useMemo(
    () => ({
      from: addMonths(new Date(), -1),
      to: new Date(),
    }),
    [],
  );
  const [date, setDate] = React.useState<DateRange | undefined>(defaultDate);

  const { data: recordsRaw = [] } = api.record.getRecordsByTrackableId.useQuery(
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

  const records = useMemo(
    () => [
      ...recordsRaw.map((record) => ({
        value: record.value,
        date: `${record.date.getDate()}.${record.date.getMonth() <= 9 ? `0${record.date.getMonth() + 1}` : record.date.getMonth() + 1}`,
      })),
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
        headingProps={{ text: name }}
        extraContent={durationSelector()}
      />

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
