import Link from "next/link";

import { getServerAuthSession } from "@/server/auth";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

export default async function Home() {
  const session = await getServerAuthSession();

  const hasTrackables = await api.track.hasTrackables()

  return (
    <>
      <Heading className="text-center text-primary">
        reVisualise habits with graphs
      </Heading>
      <p className="text-center leading-7 [&:not(:first-child)]:mt-6">
        unGraphity is a habit tracker that helps you visualise your habits and
        improve your life. Start tracking your habits or else.
      </p>
      <Separator className="mt-6" />

      <Heading element="h2" className="mt-6 text-center">
        Free, open-source, and privacy-focused
      </Heading>
      <Link
        className="mx-auto mt-4 flex justify-center text-center"
        href={!session ? "/api/auth/signin" : "/tracker"}
      >
        <Button className="w-full px-12 py-6 text-lg md:w-auto">
          {!session ? "Get started" : hasTrackables ? "My trackables" : "Create your first habit"}
        </Button>
      </Link>
    </>
  );
}
