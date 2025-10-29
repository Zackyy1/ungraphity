"use client";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";

interface BackButtonProps {
  className?: string;
  href?: string;
}

export const BackButton = ({ className, href }: BackButtonProps) => {
  const router = useRouter();

  if (href) {
    return (
      <Link href={href} className={className}>
        <ArrowLeftIcon className="h-8 w-8" />
      </Link>
    );
  }

  return (
    <button onClick={() => router.back()} className={className}>
      <ArrowLeftIcon className="h-8 w-8" />
    </button>
  );
};
