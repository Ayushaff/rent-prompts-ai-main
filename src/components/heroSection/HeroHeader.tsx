"use client";

import Link from "next/link";
import { Icons } from "../ui/Icons";
import { usePathname } from "next/navigation";
import React from "react";
import { useUser } from "@/providers/User";

export default function HeroHeader() {
  const pathname = usePathname();
  const user = useUser()

  // If pathname is null, return early to avoid errors
  if (!pathname) {
    return null; // or return a fallback component
  }

  // Split the pathname into segments, removing leading/trailing slashes and ignoring 'create'
  const pathSegments = pathname.split("/").filter(Boolean).filter(segment => segment !== "create");

  // If the current path is '/' (homepage), render the default header with logo and name
  if (pathname === "/") {
    return (
      <header className="z-30 mt-4 w-full md:mt-5 sticky top-4">
        <div className="mx-auto w-full px-4 sm:px-6">
          <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-black/[0.4] backdrop-blur-md px-6">
            {/* Site branding */}
            <div className="flex flex-1 items-center">
              <Icons.logo width={24} fill="white" />
              <span className="text-2xl hidden md:block font-semibold ml-1 italic">
                RENTPROMPTS
              </span>
            </div>

            {/* Desktop sign in links */}
            {!user ? (
              <ul className="flex flex-1 items-center justify-end gap-3">
                <li>
                  <Link
                    href="/auth/signIn"
                    className="relative bg-gradient-to-b from-gray-50 to-gray-100 font-bold p-2 rounded-lg text-indigo-600"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/signup"
                    className="btn-sm bg-gradient-to-t font-bold from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] p-2 rounded-lg text-white shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:bg-[length:100%_150%]"
                  >
                    SignUp
                  </Link>
                </li>
              </ul>
            ) : <p className="font-semibold">Balance: {user?.balance}</p>}
          </div>
        </div>
      </header>
    );
  }

  // For other pages, show breadcrumb instead of the logo and name
  return (
    <header className="z-30 mt-4 w-full md:mt-5 sticky top-4 hidden md:block">
      <div className="mx-auto w-full px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-black/[0.4] backdrop-blur-md px-6">
          {/* Breadcrumb */}
          <div className="flex flex-1 items-center space-x-2">
            <Link href="/" className="text-white text-sm hover:underline">
              Home
            </Link>
            <span className="text-white text-sm">/</span>
            {pathSegments.map((segment, index) => {
              const pathToLink = "/" + pathSegments.slice(0, index + 1).join("/");

              return (
                <React.Fragment key={segment}>
                  <Link
                    href={pathToLink}
                    className="text-white text-sm hover:underline"
                  >
                    {segment}
                  </Link>
                  {index < pathSegments.length - 1 && (
                    <span className="text-white text-sm"> / </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="font-semibold">Balance: {user?.balance}</p>


        </div>
      </div>
    </header>
  );
}
