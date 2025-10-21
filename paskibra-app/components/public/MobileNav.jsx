"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../layout/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Tentang Kami", href: "/about" },
  { name: "Kontak", href: "/contact" },
];

const MobileNav = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Buka menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-full flex-col">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu Navigasi</SheetTitle>
          <SheetDescription>
            Daftar tautan untuk navigasi utama situs.
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-1 flex-col items-center justify-center gap-8">
          <ul className="flex flex-col items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <SheetTrigger asChild>
                  <Link
                    href={link.href}
                    className="text-2xl font-semibold text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </SheetTrigger>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-center gap-4">
            <ThemeToggle />
            <SheetTrigger asChild>
              <Button asChild size="lg">
                <Link href="/auth/login">Login</Link>
              </Button>
            </SheetTrigger>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
