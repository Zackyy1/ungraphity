"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export type UseCreateTrackableData = {
  name: string;
  color: string;
  icon: string;
};

export const useCreateTrackable = () => {
  const router = useRouter();
  const [trackableName, setTrackableName] = useState("");
  const [promiseResolver, setPromiseResolver] =
    useState<(value?: unknown) => void>();

  const [promiseRejecter, setPromiseRejecter] =
    useState<(value?: unknown) => void>();

  const apiUtils = api.useUtils();

  const db = api.track.create.useMutation({
    onMutate: () => {
      const promise = new Promise((resolve, reject) => {
        setPromiseResolver(() => resolve);
        setPromiseRejecter(() => reject);
      });

      toast.promise(promise, {
        loading: "Creating trackable...",
        success: () => `${trackableName} trackable has been created`,
        error: "Error. Double check the data and try again",
      });
    },
    onSuccess: async (data) => {
      if (promiseResolver) {
        promiseResolver();
      }

      await apiUtils.track.getMyTrackables.invalidate();

      router.push("/tracker/" + data.id);
    },
    onError: async () => {
      if (promiseRejecter) {
        promiseRejecter();
      }
      await apiUtils.track.getMyTrackables.invalidate();
    },
  });

  const createTrackable = (data: UseCreateTrackableData & {
    type: "COUNTER" | "QUANTITY" | "BOOLEAN" | "COMPOUND";
    period: "DAILY" | "WEEKLY" | "MONTHLY" | "NONE";
    visibility: "DASHBOARD" | "HIDDEN";
    persistence: "PERSISTENT" | "HIDE_ON_FILL";
  }) => {
    setTrackableName(data.name);
    db.mutate(data);
  };

  return createTrackable;
};
