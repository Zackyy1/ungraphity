"use client";

import React from "react";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTrackable } from "@/hooks/useDeleteTrackable";

export const TrackableContextDeleteDialog = ({
  trackableId,
}: {
  trackableId: string;
}) => {
  const deleteTrackable = useDeleteTrackable();

  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete this trackable?</DialogTitle>
      </DialogHeader>
      <DialogDescription className="pb-2 pt-4">
        Are you sure you want to permanently delete this trackable with all
        associated records?
      </DialogDescription>
      <DialogFooter className="flex-col gap-y-2 lg:flex-row">
        <Button
          onClick={() => {
            deleteTrackable(trackableId);
          }}
          variant="destructive"
          className="w-full sm:w-auto"
        >
          Delete
        </Button>
        <DialogTrigger asChild className="w-full sm:w-auto">
          <Button className="m-0 w-full sm:w-auto" variant={"ghost"}>
            Cancel
          </Button>
        </DialogTrigger>
      </DialogFooter>
    </>
  );
};
