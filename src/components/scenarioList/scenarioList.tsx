"use client";

import React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Heading } from "../ui/heading";
import { api } from "@/trpc/react";
import { PuffLoader } from "react-spinners";
import { CreateScenarioDialog } from "./createScenarioDialog";

export const ScenarioList = () => {
  const {
    data: scenarios,
    refetch,
    isLoading,
    isPending,
    isFetching,
    isRefetching,
  } = api.scenario.getMyScenarios.useQuery();

  const isLoadingAny = isLoading || isPending || isFetching || isRefetching;

  if (!scenarios && isLoadingAny) {
    return <PuffLoader className="mx-auto my-48 flex text-center" />;
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <Heading className="text-center">
          You don&apos;t have any scenarios yet.
        </Heading>
        <p className="text-center text-muted-foreground">
          Create your first scenario to start tracking your habits and goals.
        </p>
        <CreateScenarioDialog onSuccess={() => refetch()}>
          <button className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Create Your First Scenario
          </button>
        </CreateScenarioDialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Heading element="h2">Your Scenarios</Heading>

      <div className="grid gap-3">
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            href={`/scenarios/${scenario.id}`}
            className="group flex transform flex-row items-center justify-between rounded-lg border-2 p-4 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg"
            style={{
              borderColor: `hsl(var(--${scenario.color}))`,
            }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {scenario.icon && (
                  <span className="text-2xl">{scenario.icon}</span>
                )}
                <Heading
                  element="h3"
                  className="text-2xl font-medium"
                  style={{
                    color: `hsl(var(--${scenario.color}))`,
                  }}
                >
                  {scenario.name}
                </Heading>
              </div>
              <p className="text-sm text-muted-foreground">
                {scenario._count.trackables}{" "}
                {scenario._count.trackables === 1 ? "trackable" : "trackables"}
              </p>
            </div>
            <ArrowRightIcon
              className="h-6 w-6 transition-transform group-hover:translate-x-1"
              style={{
                color: `hsl(var(--${scenario.color}))`,
              }}
            />
          </Link>
        ))}
      </div>

      <CreateScenarioDialog onSuccess={() => refetch()}>
        <button className="mt-4 rounded-lg border-2 border-dashed border-muted-foreground/30 px-6 py-4 text-center font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          + Create New Scenario
        </button>
      </CreateScenarioDialog>
    </div>
  );
};

