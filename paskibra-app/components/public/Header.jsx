"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import Nav from "./Nav";
import MobileNav from "./MobileNav";
import { Button } from "../ui/button";
import { ThemeToggle } from "../layout/ThemeToggle";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed z-50 transition-all duration-300",
          "top-0 left-0 right-0 w-full md:w-max md:max-w-[95vw] xl:max-w-none md:top-6 md:left-1/2 md:-translate-x-1/2 md:rounded-full",
          isScrolled
            ? "bg-background/40 backdrop-blur-xl border-b md:border border-border/40 shadow-lg"
            : "bg-background/20 backdrop-blur-md border-b md:border border-transparent md:border-border/20 shadow-none md:shadow-sm",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 md:px-5 lg:px-8 gap-4 lg:gap-12">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              PaskibraApp
            </span>
          </Link>

          <div className="hidden md:block">
            <Nav />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <Button
              asChild
              className="rounded-full px-6 font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Mobile Bottom Bar */}
      <MobileNav />
    </>
  );
};

export default Header;
