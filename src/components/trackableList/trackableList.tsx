"use client";

import React from "react";
import Link from "next/link";

import fontColorContrast from "font-color-contrast";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { DeleteTrackableButton } from "./deleteTrackableButton";
import { Heading } from "../ui/heading";
import { api } from "@/trpc/react";
import { PuffLoader } from "react-spinners";
import { Button } from "../ui/button";

export const TrackableList = () => {
  const {
    data: trackables,
    refetch,
    isLoading,
    isPending,
    isFetching,
    isRefetching,
  } = api.track.getMyTrackables.useQuery();

  if (!trackables && (isLoading || isPending || isFetching || isRefetching)) {
    return <PuffLoader className="mx-auto my-48 flex text-center" />;
  }

  if (!trackables) {
    return (
      <Heading className="text-center">
        You don&apos;t have any trackables yet.
      </Heading>
    );
  }

  return (
    <>
      <Heading className="text-center">Your trackables</Heading>

      {trackables.map((trackable) => (
        <div key={trackable.id} className="flex flex-row items-center">
          <Link
            href={`/tracker/${trackable.id}`}
            className="flex w-full transform flex-row justify-between rounded-lg p-2 font-normal transition-opacity duration-200 ease-in-out hover:opacity-95"
            style={{
              backgroundColor: trackable.color,
              color: fontColorContrast(trackable.color),
            }}
          >
            <Heading
              element="h2"
              className="space-x-1 p-0 text-2xl font-normal"
            >
              {trackable.icon && (
                <span className="inline">{trackable.icon}</span>
              )}
              <span>{trackable.name}</span>
            </Heading>
            <ArrowRightIcon className="h-full w-8" />
          </Link>
          <DeleteTrackableButton onDelete={() => refetch()} id={trackable.id} />
        </div>
      ))}
      <Button size={"lg"} tabIndex={-1} className="mx-auto mt-4 flex px-0">
        <Link
          href="/tracker/create"
          className="h-full w-full content-center px-4"
        >
          Create a trackable
        </Link>
      </Button>
    </>
  );
};
