"use client";

import useAuth from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import {
  ChevronsUpDown,
  LogOut,
  Moon,
  Sun,
  User as UserIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavUser() {
  const { user, logout, isProcessingAuth } = useAuth();
  const { setTheme } = useTheme();

  // Tampilkan skeleton loading saat status otentikasi sedang diproses
  if (isProcessingAuth || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-muted"></div>
            <div className="grid flex-1 gap-1.5 text-left">
              <div className="h-4 w-24 rounded-md bg-muted"></div>
              <div className="h-3 w-32 rounded-md bg-muted"></div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    const initials =
      names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : name.substring(0, 2);
    return initials.toUpperCase();
  };

  const photoSrc = user.photo
    ? `${process.env.NEXT_PUBLIC_API_URL}${user.photo}`
    : null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-muted data-[state=open]:text-foreground hover:bg-muted transition-all duration-200"
            >
              <Avatar className="h-9 w-9 rounded-lg border border-border/50 shadow-sm">
                {photoSrc && (
                  <AvatarImage
                    src={photoSrc}
                    alt={user.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold">{user.name}</span>
                <span className="truncate text-[11px] text-muted-foreground font-medium">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-xl border-border/50 shadow-lg"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-2.5 text-left text-sm bg-muted/30 rounded-t-md mb-1 border-b border-border/50">
                <Avatar className="h-9 w-9 rounded-lg border shadow-sm">
                  {photoSrc && (
                    <AvatarImage
                      src={photoSrc}
                      alt={user.name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-foreground">
                    {user.name}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground font-medium">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                asChild
                className="cursor-pointer font-medium py-2"
              >
                <Link href="/admin/settings/profile">
                  <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Profil & Pengaturan</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer font-medium py-2">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
                <span className="ml-2">Ganti Tema</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="rounded-xl shadow-lg border-border/50">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer font-medium py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar Aplikasi</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
