"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

import { NewRecordForm } from "./newRecordForm";
import { TrackableContextDropdown } from "./trackableContextDropdown";
import { TrackableContextDeleteDialog } from "./trackableContextDeleteDialog";

type TrackableContextButtonProps = {
  trackableId: string;
};

export const TrackableContextButton = ({
  trackableId,
}: TrackableContextButtonProps) => {
  const [chosenMenu, setChosenMenu] = React.useState<
    "add-new" | "delete" | null
  >(null);

  return (
    <Dialog>
      <TrackableContextDropdown setChosenMenu={setChosenMenu} />
      <DialogContent>
        {chosenMenu === "delete" ? (
          <TrackableContextDeleteDialog trackableId={trackableId} />
        ) : chosenMenu === "add-new" ? (
          <div>
            <DialogHeader className="mb-4">
              <DialogTitle>Add new record</DialogTitle>
            </DialogHeader>
            <NewRecordForm trackableId={trackableId} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
