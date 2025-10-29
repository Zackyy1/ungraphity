import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { BackButtonHeading } from "@/components/ui/backButtonHeading";
import { api } from "@/trpc/server";
import { TrackableListForScenario } from "@/components/trackableList/trackableListForScenario";

interface ScenarioPageProps {
  params: {
    id: string;
  };
}

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }

  const scenario = await api.scenario
    .getScenarioById({ id: params.id })
    .catch(() => redirect("/scenarios"));

  if (!scenario) {
    redirect("/scenarios");
  }

  return (
    <div className="flex flex-col gap-6">
      <BackButtonHeading
        backButtonProps={{ href: "/scenarios" }}
        headingProps={{
          children: (
            <div className="flex items-center gap-2">
              {scenario.icon && <span className="text-2xl">{scenario.icon}</span>}
              <span
                style={{
                  color: `hsl(var(--${scenario.color}))`,
                }}
              >
                {scenario.name}
              </span>
            </div>
          ),
        }}
      />

      {scenario.description && (
        <p className="text-muted-foreground">{scenario.description}</p>
      )}

      <TrackableListForScenario
        scenarioId={params.id}
        scenarioColor={scenario.color}
      />
    </div>
  );
}

