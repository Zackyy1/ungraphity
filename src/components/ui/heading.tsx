import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";

type HeadingElement = "h1" | "h2";

interface HeadingProps {
  element?: HeadingElement;
  className?: string;
  text?: string;
  children?: ReactNode;
}

export const Heading = ({
  element: Element = "h1",
  className,
  children,
  text,
}: HeadingProps) => {
  const classes: Record<HeadingElement, string> = {
    h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
    h2: "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
  };

  return (
    <Element className={cn(className, classes[Element])}>
      {children ?? text}
    </Element>
  );
};
