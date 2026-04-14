"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "About", href: "/about" },
  { name: "Kontak", href: "/contact" },
];

const Nav = () => {
  const pathname = usePathname();

  return (
    <nav>
      <ul className="flex items-center gap-1 p-1">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname?.startsWith(link.href));
          return (
            <li key={link.name}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-all duration-300 px-3 lg:px-5 py-2 rounded-full block whitespace-nowrap",
                  isActive
                    ? "bg-foreground/10 text-foreground shadow-sm backdrop-blur-md"
                    : "text-foreground/50 hover:text-foreground hover:bg-foreground/5",
                )}
              >
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Nav;
