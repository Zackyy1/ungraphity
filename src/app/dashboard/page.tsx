import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { Heading } from "@/components/ui/heading";
import { GroupedTrackableCards } from "@/components/trackableList/groupedTrackableCards";

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }

  const trackables = await api.track.getMyTrackables();

  // Filter for dashboard visibility and hide-on-fill logic
  const dashboardTrackables = trackables.filter((t) => {
    // Must be visible on dashboard
    if (t.visibility !== "DASHBOARD") return false;
    
    // If persistence is HIDE_ON_FILL, check if goal is completed for current period
    if (t.persistence === "HIDE_ON_FILL" && t.goal) {
      // For now, we'll implement this logic in the client-side component
      // since we need to calculate current values based on records
      return true;
    }
    
    return true;
  });

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
        <GroupedTrackableCards trackables={dashboardTrackables} />
      )}
    </div>
  );
}
