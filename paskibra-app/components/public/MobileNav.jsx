"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Info, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Events", href: "/events", icon: CalendarDays },
  { name: "Tentang", href: "/about", icon: Info },
  { name: "Kontak", href: "/contact", icon: PhoneCall },
];

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-background/40 backdrop-blur-xl border-t border-border/40 pb-safe pt-2 px-2 md:hidden shadow-lg transition-all duration-300">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname?.startsWith(link.href));

        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex flex-col items-center justify-center w-full py-2 gap-1 text-muted-foreground hover:text-foreground transition-colors",
              isActive && "text-foreground",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300",
                isActive
                  ? "bg-foreground/10 shadow-sm backdrop-blur-md"
                  : "bg-transparent hover:bg-foreground/5",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "text-[10px] transition-all",
                isActive ? "font-bold" : "font-medium",
              )}
            >
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
