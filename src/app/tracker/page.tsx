import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TrackerDefaultPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }
  return (
    <div className="flex h-screen flex-col items-center">
      <Heading className="text-center">
        You don&apos;t have any trackables right now.
      </Heading>
      <Link href="/tracker/create">
        <Button size={"lg"} className="mx-auto mt-4 flex">
          Create a trackable
        </Button>
      </Link>
    </div>
  );
}
