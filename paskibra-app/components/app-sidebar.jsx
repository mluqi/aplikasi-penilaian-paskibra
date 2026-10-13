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
  KeyRound,
  UserCog,
  UserRoundPlus,
  History,
  PieChart,
  Logs,
  Braces,
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
        <SidebarHeader className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse"></div>
            <div className="h-5 w-24 rounded bg-muted animate-pulse"></div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4 gap-4">
          <SidebarMenuSkeleton showIcon />
          <SidebarMenuSkeleton showIcon />
        </SidebarContent>
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
        {
          title: "List Events",
          url: "/admin/list-events",
          icon: CalendarDays,
          accessKey: "view_list_events",
          isActive: pathname.startsWith("/admin/list-events"),
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
        {
          title: "Tambah Juri",
          url: "/admin/add-juri",
          icon: UserRoundPlus,
          accessKey: "manage_juri",
          isActive: pathname.startsWith("/admin/add-juri"),
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
          title: "Log API",
          url: "/admin/log-api",
          icon: Braces,
          accessKey: "view_api_log",
          isActive: pathname.startsWith("/admin/log-api"),
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
    {
      title: "Settings",
      items: [
        {
          title: "Management API Key",
          url: "/admin/settings/management-key",
          icon: KeyRound,
          accessKey: "manage_apikeys",
          isActive: pathname.startsWith("/admin/settings/management-key"),
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm transition-all group-data-[state=collapsed]:mx-auto group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[state=collapsed]:hidden transition-opacity">
            <span className="text-base font-bold tracking-tight leading-none text-foreground">
              KomandoApp
            </span>
            <span className="text-[10px] font-medium text-muted-foreground mt-1.5 uppercase tracking-widest leading-none">
              Sistem Penilaian
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group, index) => {
          const filteredItems = group.items.filter(
            (item) =>
              // Ganti logika dari 'roles' ke 'accessKey'
              item.accessKey && user?.akses?.includes(item.accessKey),
          );
          if (filteredItems.length === 0) return null;

          return (
            <SidebarGroup
              key={index}
              className="group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:py-0 "
            >
              {group.title && (
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
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
