"use client";

import { useState } from "react";

import { api } from "@/trpc/react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";

export const useDeleteTrackable = (callback?: () => void) => {
  const apiUtils = api.useUtils();

  const pathname = usePathname();
  const router = useRouter();

  const [promiseResolver, setPromiseResolver] =
    useState<(value?: unknown) => void>();

  const deleteTrackableMutation = api.track.delete.useMutation({
    onMutate: () => {
      const promise = new Promise((resolve) => {
        setPromiseResolver(() => resolve);
      });

      toast.promise(promise, {
        loading: "Deleting trackable...",
        success: () => `Trackable has been deleted successfully`,
        error: "Error",
      });
    },
    onSuccess: async () => {
      // Invalidate query so its refetched with new data
      await apiUtils.track.getMyTrackables.invalidate();

      if (promiseResolver) {
        promiseResolver();
      }

      if (callback) {
        callback();
      }

      if (pathname.split('/').length > 2) {
        router.push('/tracker');
      }
    },
  });

  const deleteTrackable = (id: string) => {
    deleteTrackableMutation.mutate({ id });
  };

  return deleteTrackable;
};
