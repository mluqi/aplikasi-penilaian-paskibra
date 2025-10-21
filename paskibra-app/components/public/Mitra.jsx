"use client";

import React, { useState, useEffect } from "react";

const Mitra = () => {
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const partners = [
    {
      name: "Aura",
      logo: "https://placehold.co/400x400/e5e5e5/999999?text=AURA",
    },
    {
      name: "Brand New Day",
      logo: "https://placehold.co/400x400/e5e5e5/999999?text=BRAND+NEW+DAY",
    },
    {
      name: "Enpal",
      logo: "https://placehold.co/400x400/e5e5e5/999999?text=ENPAL",
    },
    {
      name: "Mews",
      logo: "https://placehold.co/400x400/e5e5e5/999999?text=MEWS",
    },
    {
      name: "SVEA",
      logo: "https://placehold.co/400x400/e5e5e5/999999?text=SVEA",
    },
    {
      name: "Plaid",
      logo: "https://placehold.co/400x400/e5e5e5/999999?text=PLAID",
    },
    {
      name: "Mo",
      logo: "https://placehold.co/400x400/e5e5e5/999999?text=MO",
    },
    {
      name: "Tech Co",
      logo: "https://placehold.co/400x400/e5e5e5/999999?text=TECH+CO",
    },
  ];

  // Duplicate partners for seamless loop
  const duplicatedPartners = [...partners, ...partners, ...partners];

  // Continuous auto slide
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setOffset((prevOffset) => prevOffset - 1);
    }, 20); // Update every 20ms for smooth animation

    return () => clearInterval(interval);
  }, [isPaused]);

  // Reset offset when it reaches the end
  useEffect(() => {
    if (offset <= -(partners.length * 160)) {
      setOffset(0);
    }
  }, [offset, partners.length]);

  return (
    <div className="w-full bg-white dark:bg-gray-900 py-16 sm:py-24 px-4 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto">


        {/* Logo Slider */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex items-center gap-1 md:gap-8"
            style={{
              transform: `translateX(${offset}px)`,
              transition: "none",
            }}
          >
            {duplicatedPartners.map((partner, index) => (
              <div key={`${partner.name}-${index}`} className="flex-shrink-0 w-16 md:w-32">
                <div className="w-16 h-10 md:w-32 md:h-12 flex items-center justify-center group">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full rounded-xl max-h-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 dark:opacity-40 dark:hover:opacity-90 transition-all duration-300 group-hover:filter group-hover:brightness-95"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Gradient Overlays - Modified for red-white theme */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none transition-colors duration-300"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none transition-colors duration-300"></div>
        </div>

      </div>
    </div>
  );
};

export default Mitra;