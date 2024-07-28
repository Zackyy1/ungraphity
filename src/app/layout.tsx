import "@/styles/globals.css";
import { Inter as FontSans } from "next/font/google";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/ui/header/header";
import { getServerAuthSession } from "@/server/auth";
import { Menu } from "@/components/ui/navigation/menu/menu";
import { Toaster } from "@/components/ui/sonner";
export const metadata: Metadata = {
  title: "unGraphity",
  description: "Habit visualiser",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body
        className={cn("min-h-screen font-sans antialiased", fontSans.variable)}
      >
        <TRPCReactProvider>
          <Header />
          <main className="mx-auto p-4 md:max-w-[1024px] md:p-12">
            {children}
          </main>
          {session?.user && <Menu />}
          <Toaster
            toastOptions={{
              style: {
                transform: "translateY(-48px)",
              },
            }}
          />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
