import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { Heading } from "@/components/ui/heading";
import { TrackableCard } from "@/components/trackableList/trackableCard";

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }

  const trackables = await api.track.getMyTrackables();

  // Filter for dashboard visibility
  const dashboardTrackables = trackables.filter(
    (t) => t.visibility === "DASHBOARD",
  );

  return (
    <div className="flex flex-col gap-6">
      <Heading>Dashboard</Heading>

      {dashboardTrackables.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-center text-muted-foreground">
            No trackables to display on the dashboard yet.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Create trackables and set their visibility to "Dashboard" to see them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboardTrackables.map((trackable) => (
            <TrackableCard
              key={trackable.id}
              id={trackable.id}
              name={trackable.name}
              icon={trackable.icon}
              color={trackable.color}
              type={trackable.type}
              period={trackable.period}
              unit={trackable.unit}
              automation={trackable.automation}
              step={trackable.step}
              createdAt={trackable.createdAt}
              scenarioId={trackable.scenarioId}
              goal={trackable.goal as never}
            />
          ))}
        </div>
      )}
    </div>
  );
}
