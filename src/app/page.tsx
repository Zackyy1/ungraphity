import Link from "next/link";

import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Header } from "@/components/ui/header/header";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function Home() {
  const session = await getServerAuthSession();

  void api.track.getLatest.prefetch();

  return (
    <HydrateClient>
      <Header />
      <main className="bg-card mx-auto p-8 px-4 text-black md:max-w-[1024px] md:p-12">
        {/* introduction with CTA */}
        <Heading className="text-primary text-center">
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
          href={!session ? "/api/auth/signin" : "/trackable"}
        >
          <Button className="md:w-auto px-12 w-full py-6 text-lg">
            {!session ? "Get started" : "To dashboard"}
          </Button>
        </Link>
      </main>
    </HydrateClient>
  );
}
