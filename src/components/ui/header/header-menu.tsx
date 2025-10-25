'use client'

import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover'
import { Session } from 'next-auth'
import Link from 'next/link'
import React, { ReactNode, useState } from 'react'

export const HeaderMenu = ({ session, userInitials }: { session: Session, userInitials?: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    const HeaderDropdownLink = ({ href, children }: { href: string, children?: ReactNode }) => <Link
        onClick={() => setIsOpen(false)}
        href={href}
        className="block px-4 py-2 hover:bg-slate-50"
    >
        {children}
    </Link>
    return (
        <Popover >
            <PopoverTrigger>
                <Avatar>
                    {session.user.image ? (
                        <AvatarImage className="h-8 w-8 rounded-full content-center text-center align-middle text-lg" src={session.user.image} />
                    ) : (
                        <span className="h-full w-full content-center text-center align-middle text-lg">
                            {userInitials ?? "?"}
                        </span>
                    )}
                </Avatar>
            </PopoverTrigger>
            <PopoverContent  className="mt-1 flex w-auto flex-col rounded-t-none p-0">
                <HeaderDropdownLink
                    href="/tracker"
                >
                    Trackables
                </HeaderDropdownLink>
                <HeaderDropdownLink
                    href="/api/auth/signout"
                >
                    Sign out
                </HeaderDropdownLink>
            </PopoverContent>
        </Popover>
    )
}
