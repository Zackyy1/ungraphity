import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import Link from "next/link";

export default function TrackerDefaultPage() {
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
