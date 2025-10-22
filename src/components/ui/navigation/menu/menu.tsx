"use client";

import Link from "next/link";
import React, { type ElementType } from "react";
import { BarChartIcon, HomeIcon, ViewHorizontalIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type MenuLinkProps = {
  href?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
  icon?: ElementType;
  active?: boolean;
};

const MenuLink = ({
  href = "/",
  children,
  ariaLabel,
  icon: Icon,
  active,
}: MenuLinkProps) => (
  <Link
    aria-label={ariaLabel}
    className={cn(
      "flex h-full w-full items-center justify-center transition-colors duration-100 hover:bg-muted",
      {
        "bg-accent": active,
        "hover:bg-accent-hover": active,
      }
    )}
    href={href}
  >
    {Icon && <Icon className="h-5 w-5" />}
    {children}
  </Link>
);

const menu = [
  {
    href: "/dashboard",
    icon: HomeIcon,
    "aria-label": "Dashboard",
  },
  {
    href: "/scenarios",
    icon: ViewHorizontalIcon,
    "aria-label": "Scenarios",
  },
  {
    href: "/graphs",
    icon: BarChartIcon,
    "aria-label": "Graphs & Charts",
  },
];

export const Menu = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex h-12 flex-row shadow-sm border-t border-t-border">
      {menu.map((item) => (
        <MenuLink
          key={item.href}
          href={item.href}
          icon={item.icon}
          active={pathname.startsWith(item.href)}
        />
      ))}
    </nav>
  );
};
