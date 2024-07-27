import { getServerAuthSession } from "@/server/auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Header = async () => {
  const session = await getServerAuthSession();

  return (
    <header className="flex items-center justify-between p-2 lg:px-8 border-b border-b-slate-200">
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
        <Link
          href={session ? "/api/auth/signout" : "/api/auth/signin"}
          className="px-4 py-2 font-semibold no-underline"
        >
          {session ? "Sign out" : "Sign in"}
        </Link>
      </nav>
    </header>
  );
};
