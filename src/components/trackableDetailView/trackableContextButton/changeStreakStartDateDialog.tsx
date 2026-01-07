"use client";

import React from "react";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { format } from "date-fns";

export const ChangeStreakStartDateDialog = ({
  trackableId,
  currentStartDate,
  onSuccess,
}: {
  trackableId: string;
  currentStartDate: Date | null;
  onSuccess?: () => void;
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    currentStartDate || new Date()
  );
  const utils = api.useUtils();

  const updateStreakStartDate = api.record.updateStreakStartDate.useMutation({
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await utils.record.getRecordsByTrackableId.cancel({ id: trackableId });

      // Snapshot the previous value
      const previousRecords = utils.record.getRecordsByTrackableId.getData({ id: trackableId });

      // Optimistically update the cache
      const startDate = new Date(variables.startDate);
      const localDate = startDate.toISOString().split('T')[0];

      utils.record.getRecordsByTrackableId.setData({ id: trackableId }, (old) => {
        if (!old) return old;

        // Find existing break record
        const existingBreakRecord = old.find((r) => r.value === -1);
        
        if (existingBreakRecord) {
          // Update existing break record
          return old.map((r) =>
            r.id === existingBreakRecord.id
              ? { ...r, recordedAt: startDate, localDate }
              : r
          );
        } else {
          // Add new break record (we'll use a temporary ID)
          const newBreakRecord = {
            id: `temp-${Date.now()}`,
            trackableId,
            value: -1,
            recordedAt: startDate,
            localDate,
            data: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return [...old, newBreakRecord];
        }
      });

      return { previousRecords };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousRecords) {
        utils.record.getRecordsByTrackableId.setData(
          { id: trackableId },
          context.previousRecords
        );
      }
      toast.error(error.message || "Failed to update streak start date");
    },
    onSuccess: () => {
      toast.success("Streak start date updated");
      onSuccess?.();
    },
    onSettled: () => {
      // Refetch to ensure we have the latest data
      utils.record.getRecordsByTrackableId.invalidate({ id: trackableId });
    },
  });

  const handleSubmit = () => {
    // Set time to start of day
    const dateAtStartOfDay = new Date(selectedDate);
    dateAtStartOfDay.setHours(0, 0, 0, 0);

    updateStreakStartDate.mutate({
      trackableId,
      startDate: dateAtStartOfDay.toISOString(),
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Change Streak Start Date</DialogTitle>
        <DialogDescription className="pb-2 pt-4">
          Select the date when your streak should have started. The streak will
          be recalculated from this date.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <DatePicker
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
        {currentStartDate && (
          <p className="mt-2 text-sm text-muted-foreground">
            Current start date: {format(currentStartDate, "PPP")}
          </p>
        )}
      </div>
      <DialogFooter className="flex-col gap-y-2 lg:flex-row">
        <Button
          onClick={handleSubmit}
          disabled={updateStreakStartDate.isPending}
          className="w-full sm:w-auto"
        >
          {updateStreakStartDate.isPending ? "Updating..." : "Update Start Date"}
        </Button>
      </DialogFooter>
    </>
  );
};

