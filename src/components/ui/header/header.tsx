import { getServerAuthSession } from "@/server/auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Avatar, AvatarImage } from "../avatar";

export const Header = async () => {
  const session = await getServerAuthSession();

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => (n.length > 1 ? n[0]! + n[1]! : n[0]))
    .join("").toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-b-slate-200 p-2 lg:px-8">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="https://www.svgrepo.com/show/532054/hurricane-alt-1.svg"
          alt="Logo"
          width={32}
          height={32}
          className="h-8 w-8 rotate-90 rounded-full"
        />
        <h1 className="text-xl font-semibold">unGraphity</h1>
      </Link>
      <nav className="flex gap-4">
        {!session ? (
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="px-4 py-2 font-semibold no-underline"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
        ) : (
          <Popover>
            <PopoverTrigger>
              <Avatar>
                {session.user.image ? (
                  <AvatarImage src={session.user.image} />
                ) : (
                  <span className="h-full w-full content-center text-center align-middle text-lg">
                    {userInitials ?? "?"}
                  </span>
                )}
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="mt-1 flex w-auto flex-col rounded-t-none p-0">
              <Link
                href="/tracker"
                className="block px-4 py-2 hover:bg-slate-50"
              >
                Trackables
              </Link>
              <Link
                href="/api/auth/signout"
                className="block px-4 py-2 hover:bg-slate-50"
              >
                Sign out
              </Link>
            </PopoverContent>
          </Popover>
        )}
      </nav>
    </header>
  );
};
