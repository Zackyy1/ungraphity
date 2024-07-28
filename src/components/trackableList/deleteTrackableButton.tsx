"use client";
import React from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import { useDeleteTrackable } from "@/hooks/useDeleteTrackable";

type DeleteTrackableButtonProps = {
  id: string;
  onDelete: () => void;
};

export const DeleteTrackableButton = ({
  id,
  onDelete,
}: DeleteTrackableButtonProps) => {
  const deleteTrackable = useDeleteTrackable(onDelete);

  return (
    <button onClick={() => deleteTrackable(id)} className="z-10">
      <TrashIcon className="h-full w-8" />
    </button>
  );
};
