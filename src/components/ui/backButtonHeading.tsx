import React from "react";
import { BackButton } from "./backButton";
import { Heading } from "./heading";

type BackButtonHeadingProps = {
  backButtonProps?: React.ComponentProps<typeof BackButton>;
  headingProps?: React.ComponentProps<typeof Heading>;
};

export const BackButtonHeading = ({
  backButtonProps,
  headingProps,
}: BackButtonHeadingProps) => {
  return (
    <div className="items-left mb-6 flex flex-row space-x-2">
      <BackButton {...backButtonProps} />
      <Heading {...headingProps} className="text-2xl" />
    </div>
  );
};
