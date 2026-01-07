"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { api } from "@/trpc/react";

import { NewRecordForm } from "./newRecordForm";
import { TrackableContextDropdown, AddRecordButton } from "./trackableContextDropdown";
import { TrackableContextDeleteDialog } from "./trackableContextDeleteDialog";
import { ChangeStreakStartDateDialog } from "./changeStreakStartDateDialog";
import { EditTrackableDialog } from "./editTrackableDialog";

type TrackableContextButtonProps = {
  trackableId: string;
  automation?: string | null;
  createdAt: Date;
  contextMenu?: "delete" | "change-streak-start" | "edit" | null;
  setContextMenu?: (menu: "delete" | "change-streak-start" | "edit" | null) => void;
};

export const TrackableContextButton = ({
  trackableId,
  automation,
  createdAt,
  contextMenu,
  setContextMenu,
}: TrackableContextButtonProps) => {
  const [chosenMenu, setChosenMenu] = React.useState<
    "add-new" | "delete" | "change-streak-start" | "edit" | null
  >(null);

  // Sync external contextMenu state
  React.useEffect(() => {
    if (contextMenu !== null && contextMenu !== chosenMenu) {
      setChosenMenu(contextMenu);
    }
  }, [contextMenu]);

  // Update external state when menu closes
  const handleMenuChange = (open: boolean) => {
    if (!open) {
      setChosenMenu(null);
      setContextMenu?.(null);
    }
  };
  
  const isAutomatic = automation === "automatic-increment";
  
  // Get current streak start date (from most recent break record or createdAt)
  const { data: recordsRaw = [] } = api.record.getRecordsByTrackableId.useQuery(
    { id: trackableId },
    { enabled: isAutomatic }
  );
  
  const currentStartDate = React.useMemo(() => {
    if (!isAutomatic) return null;
    const breakRecord = recordsRaw
      .filter((r) => r.value === -1)
      .sort((a, b) => new Date(b.recordedAt || 0).getTime() - new Date(a.recordedAt || 0).getTime())[0];
    return breakRecord ? (breakRecord.recordedAt || null) : createdAt;
  }, [isAutomatic, recordsRaw, createdAt]);

  const handleClose = () => {
    setChosenMenu(null);
    setContextMenu?.(null);
  };

  return (
    <>
      <AddRecordButton onClick={() => setChosenMenu("add-new")} />
      <Dialog open={chosenMenu !== null && chosenMenu !== "edit"} onOpenChange={handleMenuChange}>
        <DialogContent>
          {chosenMenu === "delete" ? (
            <TrackableContextDeleteDialog trackableId={trackableId} onSuccess={handleClose} />
          ) : chosenMenu === "add-new" ? (
            <div>
              <DialogHeader className="mb-4">
                <DialogTitle>Add new record</DialogTitle>
              </DialogHeader>
              <NewRecordForm trackableId={trackableId} onSuccess={handleClose} />
            </div>
          ) : chosenMenu === "change-streak-start" ? (
            <ChangeStreakStartDateDialog
              trackableId={trackableId}
              currentStartDate={currentStartDate}
              onSuccess={handleClose}
            />
          ) : null}
        </DialogContent>
      </Dialog>
      <EditTrackableDialog
        trackableId={trackableId}
        open={chosenMenu === "edit"}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
        onSuccess={handleClose}
      />
    </>
  );
};
