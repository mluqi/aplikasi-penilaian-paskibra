"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";

import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  BarChart,
  ClipboardList,
  CalendarDays,
  Settings,
  UserCog,
  UserRoundPlus,
  History,
  PieChart,
  Logs,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuSkeleton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }) {
  const { user, logout, isProcessingAuth } = useAuth();
  const pathname = usePathname();

  if (isProcessingAuth) {
    return (
      <Sidebar {...props}>
        <SidebarHeader>
          <div className="h-8 w-3/4 rounded bg-gray-200 animate-pulse"></div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenuSkeleton showIcon />
          <SidebarMenuSkeleton showIcon />
          <SidebarMenuSkeleton showIcon />
        </SidebarContent>
        <SidebarFooter>
          <div className="h-12 rounded bg-gray-200 animate-pulse"></div>
        </SidebarFooter>
      </Sidebar>
    );
  }

  if (!user) {
    return null;
  }

  // Definisikan semua menu dalam grup
  const navGroups = [
    {
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: LayoutDashboard,
          accessKey: "view_dashboard",
          isActive: pathname === "/admin/dashboard",
        },
        {
          title: "Statistik",
          url: "/admin/statistics",
          icon: PieChart,
          accessKey: "view_statistics", 
          isActive: pathname.startsWith("/admin/statistics"),
        },
      ],
    },
    {
      title: "Manajemen",
      items: [
        {
          title: "Manajemen Pengguna",
          url: "/admin/users",
          icon: UserCog,
          accessKey: "manage_users",
          isActive: pathname.startsWith("/admin/users"),
        },
        {
          title: "Pending Users",
          url: "/admin/pending-users",
          icon: UserRoundPlus,
          accessKey: "manage_pending_users",
          isActive: pathname.startsWith("/admin/pending-users"),
        },
        {
          title: "Manajemen Teams",
          url: "/admin/teams",
          icon: Users,
          accessKey: "manage_teams",
          isActive: pathname.startsWith("/admin/teams"),
        },
        {
          title: "Manajemen Events",
          url: "/admin/events",
          icon: CalendarDays,
          accessKey: "manage_events",
          isActive: pathname.startsWith("/admin/events"),
        },
      ],
    },
    {
      title: "Penilaian",
      items: [
        {
          title: "Rekap Nilai",
          url: "/admin/rekap",
          icon: BarChart,
          accessKey: "view_recap",
          isActive: pathname.startsWith("/admin/rekap"),
        },
        {
          title: "Input Penilaian",
          url: "/admin/penilaian",
          icon: ClipboardList,
          accessKey: "input_assessment",
          isActive: pathname.startsWith("/admin/penilaian"),
        },
      ],
    },

    {
      title: "Logs",
      items: [
        {
          title: "Log Aktivitas",
          url: "/admin/log-aktivitas",
          icon: Logs,
          accessKey: "view_activity_log",
          isActive: pathname.startsWith("/admin/log-aktivitas"),
        },
        {
          title: "Log Akses",
          url: "/admin/log-akses",
          icon: History,
          accessKey: "view_access_log",
          isActive: pathname.startsWith("/admin/log-akses"),
        },
        {
          title: "Hak Akses",
          url: "/admin/role-access",
          icon: Settings,
          accessKey: "manage_role_access",
          isActive: pathname.startsWith("/admin/role-access"),
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <h2 className="text-xl font-bold px-2 py-4 border-b border-b-gray-200 dark:border-b-gray-700 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-red-600 group-data-[state=collapsed]:mx-auto" />
          <span className="group-data-[state=collapsed]:hidden group-data-[state=collapsed]:opacity-0">
            Paskibra App
          </span>
        </h2>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group, index) => {
          const filteredItems = group.items.filter(
            (item) =>
              // Ganti logika dari 'roles' ke 'accessKey'
              item.accessKey && user?.akses?.includes(item.accessKey)
          );
          if (filteredItems.length === 0) return null;

          return (
            <SidebarGroup
              key={index}
              className="group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:py-0 "
            >
              {group.title && (
                <SidebarGroupLabel className="text-sm font-medium text-gray-400 ">
                  {group.title}
                </SidebarGroupLabel>
              )}
              <NavMain items={filteredItems} />
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
