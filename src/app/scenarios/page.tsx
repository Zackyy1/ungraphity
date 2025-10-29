import { ScenarioList } from "@/components/scenarioList/scenarioList";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function TrackerDefaultPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full space-y-4">
        <ScenarioList />
      </div>
    </div>
  );
}
