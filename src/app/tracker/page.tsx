import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import fontColorContrast from "font-color-contrast";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export default async function TrackerDefaultPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }

  const trackables = await api.track.getMyTrackables();

  const noTrackables = (
    <Heading className="text-center">
      You don&apos;t have any trackables right now.
    </Heading>
  );

  return (
    <HydrateClient>
      <div className="flex h-screen flex-col items-center">
        {trackables.length === 0 ? (
          noTrackables
        ) : (
          <div className="w-full space-y-4">
            <Heading className="text-center">Your trackables</Heading>
            {trackables.map((trackable) => (
              <div key={trackable.id}>
                <Link
                  href={`/tracker/${trackable.id}`}
                  className="flex w-full transform flex-row justify-between rounded-lg p-2 font-normal transition-opacity duration-200 ease-in-out hover:opacity-95"
                  style={{
                    backgroundColor: trackable.color,
                    color: fontColorContrast(trackable.color),
                  }}
                >
                  <Heading
                    element="h2"
                    className="space-x-1 p-0 text-2xl font-normal"
                  >
                    <span className="inline">{trackable.icon}</span>
                    <span>{trackable.name}</span>
                  </Heading>
                  <ArrowRightIcon className="h-full w-8" />
                </Link>
              </div>
            ))}
          </div>
        )}
        <Link href="/tracker/create">
          <Button size={"lg"} className="mx-auto mt-4 flex">
            Create a trackable
          </Button>
        </Link>
      </div>
    </HydrateClient>
  );
}
