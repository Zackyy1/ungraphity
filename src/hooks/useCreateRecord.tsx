"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { toast } from "sonner";

export const useCreateRecord = (callback?: () => void) => {
  const [promiseResolver, setPromiseResolver] =
    useState<(value?: unknown) => void>();

  const [promiseRejecter, setPromiseRejecter] =
    useState<(value?: unknown) => void>();
  const apiUtils = api.useUtils();

  const recordApi = api.record.create.useMutation({
    onMutate: () => {
      const promise = new Promise((resolve, reject) => {
        setPromiseResolver(() => resolve);
        setPromiseRejecter(() => reject);
      });

      toast.promise(promise, {
        loading: "Adding record...",
        success: () => `Record added`,
        error: "Error. Double check the data and try again",
      });
    },
    onSuccess: async () => {
      if (promiseResolver) {
        promiseResolver();
      }

      if (callback) {
        callback();
      }

      // Invalidate existing records
      await apiUtils.record.getRecordsByTrackableId.invalidate();
    },
    onError: async () => {
      if (promiseRejecter) {
        promiseRejecter();
      }
      await apiUtils.record.getRecordsByTrackableId.invalidate();
    },
  });

  const createRecord = (trackableId: string, value: number) =>
    recordApi.mutate({
      trackableId,
      value,
    });

  return createRecord;
};
