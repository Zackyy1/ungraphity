import { getServerAuthSession } from "@/server/auth";
import { CreateTrackerForm } from "./createTrackerForm";
import { redirect } from "next/navigation";

export default async function TrackerDefaultPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }

  return <CreateTrackerForm />;
}
