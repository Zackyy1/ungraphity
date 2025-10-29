"use client";

import React from "react";
import Link from "next/link";
import { ArrowRightIcon, TrashIcon } from "@radix-ui/react-icons";
import { Heading } from "../ui/heading";
import { api } from "@/trpc/react";
import { PuffLoader } from "react-spinners";
import { CreateTrackableDialog } from "./createTrackableDialog";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { TrackableValueDisplay } from "./trackableValueDisplay";

interface TrackableListForScenarioProps {
  scenarioId: string;
  scenarioColor: string;
}

export const TrackableListForScenario = ({
  scenarioId,
  scenarioColor,
}: TrackableListForScenarioProps) => {
  const {
    data: trackables,
    refetch,
    isLoading,
    isPending,
    isFetching,
    isRefetching,
  } = api.track.getTrackablesByScenarioId.useQuery({ scenarioId });

  const deleteTrackable = api.track.delete.useMutation({
    onSuccess: () => {
      toast.success("Trackable deleted successfully!");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete trackable");
    },
  });

  const isLoadingAny = isLoading || isPending || isFetching || isRefetching;

  if (!trackables && isLoadingAny) {
    return <PuffLoader className="mx-auto my-48 flex text-center" />;
  }

  if (!trackables || trackables.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <Heading className="text-center" element="h3">
          No trackables yet
        </Heading>
        <p className="text-center text-muted-foreground">
          Create your first trackable for this scenario.
        </p>
        <CreateTrackableDialog scenarioId={scenarioId} onSuccess={() => void refetch()}>
          <button
            className="rounded-lg px-6 py-3 font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: `hsl(var(--${scenarioColor}))`,
              color: "hsl(var(--background))",
            }}
          >
            Create Your First Trackable
          </button>
        </CreateTrackableDialog>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "COUNTER":
        return "Counter";
      case "QUANTITY":
        return "Quantity";
      case "BOOLEAN":
        return "Yes/No";
      case "COMPOUND":
        return "Complex";
      default:
        return type;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "DAILY":
        return "Daily";
      case "WEEKLY":
        return "Weekly";
      case "MONTHLY":
        return "Monthly";
      case "NONE":
        return "Lifetime";
      default:
        return period;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Heading element="h3">Trackables</Heading>
        <CreateTrackableDialog scenarioId={scenarioId} onSuccess={() => void refetch()}>
          <Button size="sm">+ Add Trackable</Button>
        </CreateTrackableDialog>
      </div>

      <div className="grid gap-3">
        {trackables.map((trackable) => (
          <div
            key={trackable.id}
            className="group flex transform flex-row items-center justify-between gap-2 rounded-lg border-2 p-4 transition-all duration-200"
            style={{
              borderColor: `hsl(var(--${trackable.scenarioColor}))`,
            }}
          >
            <Link
              href={`/scenarios/${scenarioId}/${trackable.id}`}
              className="flex flex-1 flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                {trackable.icon && (
                  <span className="text-xl">{trackable.icon}</span>
                )}
                <Heading
                  element="h4"
                  className="text-xl font-medium"
                  style={{
                    color: `hsl(var(--${trackable.scenarioColor}))`,
                  }}
                >
                  {trackable.name}
                </Heading>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{getTypeLabel(trackable.type)}</span>
                <span>•</span>
                <span>{getPeriodLabel(trackable.period)}</span>
                {trackable.unit && (
                  <>
                    <span>•</span>
                    <span>{trackable.unit}</span>
                  </>
                )}
              </div>
              {trackable.description && (
                <p className="text-sm text-muted-foreground">
                  {trackable.description}
                </p>
              )}
              <TrackableValueDisplay
                trackableId={trackable.id}
                automation={trackable.automation}
                createdAt={trackable.createdAt}
                period={trackable.period}
                step={trackable.step}
                unit={trackable.unit}
                color={trackable.scenarioColor}
              />
            </Link>

            <div className="flex items-center gap-2">
              <Link href={`/scenarios/${scenarioId}/${trackable.id}`}>
                <ArrowRightIcon
                  className="h-6 w-6 transition-transform group-hover:translate-x-1"
                  style={{
                    color: `hsl(var(--${trackable.scenarioColor}))`,
                  }}
                />
              </Link>
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Are you sure you want to delete "${trackable.name}"? This will also delete all associated records.`,
                    )
                  ) {
                    deleteTrackable.mutate({ id: trackable.id });
                  }
                }}
                className="rounded p-1 text-destructive transition-colors hover:bg-destructive/10"
                disabled={deleteTrackable.isPending}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

