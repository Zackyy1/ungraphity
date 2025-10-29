import { api } from "@/trpc/server";
import { TrackableDetailView } from "@/components/trackableDetailView/trackableDetailView";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";

interface TrackablePageProps {
  params: {
    id: string;
    trackableId: string;
  };
}

export default async function TrackablePage({ params }: TrackablePageProps) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }

  const trackable = await api.track
    .getTrackableById({
      id: params.trackableId,
    })
    .catch(() => redirect(`/scenarios/${params.id}`));

  if (!trackable) {
    redirect(`/scenarios/${params.id}`);
  }

  // Verify trackable belongs to this scenario
  if (trackable.scenarioId !== params.id) {
    redirect(`/scenarios/${params.id}`);
  }

  return <TrackableDetailView {...trackable} backUrl={`/scenarios/${params.id}`} />;
}
