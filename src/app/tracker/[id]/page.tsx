import { api } from "@/trpc/server";
import { TrackableDetailView } from "@/components/trackableDetailView/trackableDetailView";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const trackable = await api.track
    .getTrackableById({
      id: params.id,
    })
    .catch(() => redirect("/tracker"));

  if (!trackable) {
    redirect("/tracker");
  }

  return <TrackableDetailView {...trackable} />;
}
