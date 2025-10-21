"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import Nav from "./Nav";
import MobileNav from "./MobileNav";
import { Button } from "../ui/button";
import { ThemeToggle } from "../layout/ThemeToggle";

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-border bg-background md:bg-background/10 md:backdrop-blur-sm"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container relative mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">PaskibraApp</span>
        </Link>

        {/* Desktop Nav - Centered */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <Nav />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:block">
            {/* Desktop Login Button */}
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
          {/* Mobile Nav */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
