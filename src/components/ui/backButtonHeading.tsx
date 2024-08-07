import React from "react";
import { BackButton } from "./backButton";
import { Heading } from "./heading";

type BackButtonHeadingProps = {
  backButtonProps?: React.ComponentProps<typeof BackButton>;
  headingProps?: React.ComponentProps<typeof Heading>;
  extraContent?: React.ReactNode;
};

export const BackButtonHeading = ({
  backButtonProps,
  headingProps,
  extraContent,
}: BackButtonHeadingProps) => {
  return (
    <div className="w-full flex flex-col sm:flex-row sm:justify-between justify-start mb-6 gap-y-4 sm:items-center">
      <div className="items-left flex flex-row space-x-2">
        <BackButton {...backButtonProps} />
        <Heading {...headingProps} className="text-2xl" />
      </div>
      {extraContent}
    </div>
  );
};
