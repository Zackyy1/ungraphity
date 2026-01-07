'use client';

import React from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { TrashIcon, CalendarIcon, MoreVertical, PencilIcon } from "lucide-react";
import { Button } from "../../ui/button";

type TrackableContextDropdownProps = {
  setChosenMenu: (menu: "delete" | "change-streak-start" | "edit") => void;
  isAutomatic?: boolean;
};

export const TrackableContextDropdown = ({
  setChosenMenu,
  isAutomatic = false,
}: TrackableContextDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Trackable Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setChosenMenu("edit")}
          className="flex flex-row items-center px-2 py-1.5"
        >
          <PencilIcon className="mr-2 h-4 w-4" />
          Edit trackable
        </DropdownMenuItem>
        {isAutomatic && (
          <DropdownMenuItem
            onClick={() => setChosenMenu("change-streak-start")}
            className="flex flex-row items-center px-2 py-1.5"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Change streak start date
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => setChosenMenu("delete")}
          className="flex flex-row items-center px-2 py-1.5"
        >
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Separate component for the Add Record button
export const AddRecordButton = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-12 left-0 right-0 z-40 mx-auto flex h-14 max-w-[1024px] items-center justify-center gap-2 bg-primary px-4 text-white shadow-lg transition-opacity duration-200 ease-out hover:opacity-90 md:rounded-t-lg md:px-6"
    >
      <PlusIcon className="h-5 w-5" />
      <span className="font-semibold">Add Record</span>
    </button>
  );
};
