"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <Button
      size="icon"
      className={cn(
        "fixed bg-red-600 dark:bg-white bottom-6 right-6 z-50 rounded-full shadow-lg transition-all duration-300",
        isVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-0 pointer-events-none"
      )}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-6 w-6 text-white dark:text-red-600" />
    </Button>
  );
}
