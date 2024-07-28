"use client";
import React from "react";
import { type Trackable } from "@prisma/client";
import { BackButtonHeading } from "../ui/backButtonHeading";
import { TrackableContextButton } from "./trackableContextButton/trackableContextButton";
import { api } from "@/trpc/react";

export const TrackableDetailView = (props: Trackable) => {
  const { name, id } = props;

  const { data: records = [] } = api.record.getRecordsByTrackableId.useQuery({ id });

  return (
    <div>
      <TrackableContextButton trackableId={id} />
      <BackButtonHeading headingProps={{ text: name }} />
      <p>Trackable name: {name}</p>
      <p>
        Will have easy inputs to adjust trackable for today and edit previous
        values (or past values in general)
      </p>
      <p>
        Main thingy - graphs. With lots of data from the past, it will have some
        nice graphs to see progress easily
      </p>

      {!!records.length ? (
        <div>Records:</div>
      ) : (
        <div>
          No records were found. Use the floating button to add new records
        </div>
      )}
    </div>
  );
};
