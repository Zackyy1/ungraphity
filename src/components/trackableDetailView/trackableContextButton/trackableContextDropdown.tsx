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
import { TrashIcon } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

type TrackableContextDropdownProps = {
  setChosenMenu: (menu: "add-new" | "delete") => void;
};

export const TrackableContextDropdown = ({
  setChosenMenu,
}: TrackableContextDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="fixed bottom-32 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary transition-opacity duration-200 ease-out hover:opacity-90">
        <PlusIcon className="h-12 w-12 fill-white text-center text-white" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" className="-translate-x-8">
        <DropdownMenuLabel>Edit trackable</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <DialogTrigger
            onClick={() => {
              setChosenMenu("add-new");
              console.log("Changed menu");
            }}
            className="flex h-full w-full flex-row items-center px-2 py-1.5"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add record
          </DialogTrigger>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DialogTrigger
            onClick={() => setChosenMenu("delete")}
            className="flex h-full w-full flex-row items-center px-2 py-1.5"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </DialogTrigger>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
