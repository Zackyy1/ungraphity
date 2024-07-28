"use client";
import React from "react";
import { type Trackable } from "@prisma/client";
import { BackButtonHeading } from "../ui/backButtonHeading";

export const TrackableDetailView = (props: Trackable) => {
  const { name, id } = props;

  return (
    <div>
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
    </div>
  );
};
