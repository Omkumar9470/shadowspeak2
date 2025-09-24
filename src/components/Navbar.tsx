'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User } from 'next-auth';
import { Button } from './ui/button'; // Assuming a shadcn/ui button component

// --- Original Navbar Component ---

const Navbar = () => {
    const {data: session} = useSession()

    const user: User | undefined = session?.user;

    return(
        <nav className="p-4 md:p-6 shadow-md bg-white">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                {/* Corrected: Used Link component for navigation */}
                <Link className="text-xl font-bold mb-4 md:mb-0" href="/">
                    Shadow Speak
                </Link>
                {
                    session ? (
                        <div className="flex items-center">
                            <span className="mr-4">Welcome, {user?.username || user?.name}</span>
                            <Button onClick={() => signOut()} className="w-full md:w-auto">Logout</Button>
                        </div>
                    ) : (
                        // Corrected: Used Link component for navigation
                        <Link href="/sign-in">
                            <Button className="w-full md:w-auto">Login</Button>
                        </Link>
                    )
                }
            </div>
        </nav>
    )
}

export default Navbar;