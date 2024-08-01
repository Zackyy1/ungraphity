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

export const TrackableDetailView = (props: Trackable) => {
  const { name, id } = props;

  const { data: recordsRaw = [] } = api.record.getRecordsByTrackableId.useQuery(
    {
      id,
      // dateRange: {
      //   from: new Date("2024-07-29").toUTCString(),
      //   to: new Date("2024-08-02").toUTCString(),
      // },
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

  return (
    <div>
      <TrackableContextButton trackableId={id} />
      <BackButtonHeading headingProps={{ text: name }} />

      {!!recordsRaw.length ? (
        <ResponsiveContainer width="100%" height={500}>
          {/* TODO: make different charts configurable */}
          <LineChart
            className="mt-8"
            width={800}
            height={500}
            margin={{
              top: 0,
              right: 12,
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
        <div>
          No records were found. Use the floating button to add new records
        </div>
      )}
    </div>
  );
};
