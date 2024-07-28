"use client";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import React from "react";

export const BackButton = ({ className }: { className?: string }) => {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className={className}>
      <ArrowLeftIcon className="h-8 w-8" />
    </button>
  );
};
