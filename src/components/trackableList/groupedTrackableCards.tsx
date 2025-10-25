"use client";

import { useMemo } from "react";
import { Heading } from "../ui/heading";
import { TrackableCard } from "./trackableCard";
import { api } from "@/trpc/react";

interface GroupedTrackableCardsProps {
  trackables: Array<{
    id: string;
    name: string;
    icon?: string;
    type: string;
    period: string;
    unit?: string | null;
    automation?: string | null;
    step?: number | null;
    createdAt: Date;
    scenarioId?: string | null;
    quickAdds?: number[] | null;
    persistence?: string | null;
    goal?: {
      kind: string;
      target: number;
      direction: string;
    } | null;
  }>;
}

export const GroupedTrackableCards = ({ trackables }: GroupedTrackableCardsProps) => {
  // Fetch scenarios to get scenario names and colors
  const { data: scenarios = [] } = api.scenario.getMyScenarios.useQuery();

  const groupedTrackables = useMemo(() => {
    const groups: {
      [key: string]: {
        [scenarioId: string]: typeof trackables;
      };
    } = {};

    // Group by period first, then by scenario
    trackables.forEach((trackable) => {
      const period = trackable.period;
      const scenarioId = trackable.scenarioId || "no-scenario";

      if (!groups[period]) {
        groups[period] = {};
      }
      if (!groups[period][scenarioId]) {
        groups[period][scenarioId] = [];
      }
      groups[period][scenarioId].push(trackable);
    });

    return groups;
  }, [trackables]);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "DAILY":
        return "Daily Tasks";
      case "WEEKLY":
        return "Weekly Tasks";
      case "MONTHLY":
        return "Monthly Tasks";
      case "NONE":
        return "Lifetime Tasks";
      default:
        return `${period} Tasks`;
    }
  };

  const getScenarioName = (scenarioId: string) => {
    if (scenarioId === "no-scenario") return "No Scenario";
    const scenario = scenarios.find((s) => s.id === scenarioId);
    return scenario?.name || "Unknown Scenario";
  };

  const getScenarioColor = (scenarioId: string) => {
    if (scenarioId === "no-scenario") return "gray";
    const scenario = scenarios.find((s) => s.id === scenarioId);
    return scenario?.color || "gray";
  };

  const periodOrder = ["DAILY", "WEEKLY", "MONTHLY", "NONE"];

  return (
    <div className="space-y-8">
      {periodOrder.map((period) => {
        const periodGroups = groupedTrackables[period];
        if (!periodGroups || Object.keys(periodGroups).length === 0) return null;

        return (
          <div key={period} className="space-y-4">
            <Heading element="h2" className="text-2xl font-semibold">
              {getPeriodLabel(period)}
            </Heading>
            
            {Object.entries(periodGroups).map(([scenarioId, scenarioTrackables]) => (
              <div key={scenarioId} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: `hsl(var(--${getScenarioColor(scenarioId)}))`,
                    }}
                  />
                  <Heading element="h3" className="text-lg font-medium text-muted-foreground">
                    {getScenarioName(scenarioId)}
                  </Heading>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {scenarioTrackables.map((trackable) => (
                    <TrackableCard
                      key={trackable.id}
                      id={trackable.id}
                      name={trackable.name}
                      icon={trackable.icon}
                      type={trackable.type}
                      period={trackable.period}
                      unit={trackable.unit}
                      automation={trackable.automation}
                      step={trackable.step}
                      createdAt={trackable.createdAt}
                      scenarioId={trackable.scenarioId}
                      quickAdds={trackable.quickAdds}
                      persistence={trackable.persistence}
                      goal={trackable.goal}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
