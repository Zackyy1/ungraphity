import { TrackableList } from "@/components/trackableList/trackableList";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function TrackerDefaultPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }

  return (
    // <HydrateClient>
    <div className="flex flex-col items-center">
      <div className="w-full space-y-4">
        <TrackableList />
      </div>
    </div>
    // </HydrateClient>
  );
}
