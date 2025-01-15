"use client";
import React, { useState } from "react";
import { IconArrowLeft, IconUserBolt } from "@tabler/icons-react";
import { Sidebar, SidebarBody, SidebarLink } from "../../SideBar";
import { Box, Kanban, LayoutDashboard, Users } from "lucide-react";
import { Icons } from "../Icons";
import { useUser } from "@/providers/User";
import { toast } from "sonner";


export function SidebarComponent() {
  const [open, setOpen] = useState(false);
  const user = useUser()

  const handleLogout = async() => {
    try {
      const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await req.json();
      if(req.ok){
        toast.success("Logout Successfully");
        setTimeout(() => {
          window.location.replace("/");
        }, 1000);
      }
    } catch (err) {
      console.log(err)
    }
  }

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: (
        <IconUserBolt className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    ...(user?.role === "enterprise"
      ? [
          {
            label: "Team",
            href: "/dashboard/onboard-user",
            icon: (
              <Users className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
          },
        ]
      : []),

    {
      label: "Projects",
      href: "/dashboard/projects",
      icon: (
        <Kanban className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Models",
      href: "/dashboard/models",
      icon: (
        <Box className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    // {
    //   label: "Logout",
    //   href: "/",
    //   icon: (
    //     <IconArrowLeft className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    //   ),
    // },
  ];



  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-2">
            <SidebarLink
              link={{
                label: (
                  <div className="italic font-semibold text-xl mb-2 ">
                    RENTPROMPTS
                  </div>
                ),
                href: "/",
                icon: (
                  <Icons.logo
                    className="text-white dark:text-neutral-200 h-7 w-7 flex-shrink-0 mb-2 "
                    fill="white"
                  />
                ),
              }}
            />
            {
              links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))
            }
            <button className="flex items-center gap-2 cursor-pointer"
            onClick={handleLogout}
            >
            <IconArrowLeft className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
              <p className="font-bold text-sm">Logout</p>
              </button>
          </div>
        </div>
        {/* <SidebarLink
          link={{
            label: "Manu Arora",
            href: "#",
            icon: <Home />,
          }}
        /> */}
      </SidebarBody>
    </Sidebar>
  );
}
