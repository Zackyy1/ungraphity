import { api } from "@/trpc/server";
import { TrackableDetailView } from "@/components/trackableDetailView/trackableDetailView";

export default async function Page({ params }: { params: { id: string } }) {
  const trackable = await api.track.getTrackableById({
    id: params.id,
  });

  if (!trackable) {
    return <div>Trackable not found</div>;
  }

  return <TrackableDetailView {...trackable} />;
}
