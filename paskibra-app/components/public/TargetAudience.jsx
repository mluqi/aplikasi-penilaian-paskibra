"use client";

import React, { useState } from "react";
import { ClipboardList, Gavel, Users } from "lucide-react";

const audienceList = [
  {
    icon: ClipboardList,
    title: "Untuk Panitia Event",
    description:
      "Hemat waktu, kurangi penggunaan kertas, dan tingkatkan profesionalisme event Anda. Fokus pada kelancaran acara, bukan administrasi yang rumit.",
    number: "01",
  },
  {
    icon: Gavel,
    title: "Untuk Juri",
    description:
      "Antarmuka yang intuitif memudahkan proses penjurian. Berikan penilaian yang lebih objektif dan efisien tanpa perlu repot dengan pulpen dan kertas.",
    number: "02",
  },
  {
    icon: Users,
    title: "Untuk Peserta/Tim",
    description:
      "Dapatkan akses mudah ke informasi lomba, jadwal, dan lihat hasil akhir dengan transparan dan cepat setelah pengumuman resmi.",
    number: "03",
  },
];

function TargetAudience() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section
      id="audience"
      className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300"
    >
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="text-sm font-medium text-red-600 dark:text-red-400 mb-4 block">
            Dirancang untuk Anda
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Solusi untuk{" "}
            <span className="text-red-600 dark:text-red-400">Setiap Peran</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Platform yang memahami kebutuhan unik setiap pihak dalam lomba
            Paskibra.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {audienceList.map((audience, index) => {
              const Icon = audience.icon;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={audience.title}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`relative group flex flex-col rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 transition-all duration-300 overflow-hidden ${
                    isHovered
                      ? "shadow-lg border-red-200 dark:border-red-900"
                      : "hover:shadow-md"
                  }`}
                >
                  {/* Number Indicator */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors duration-300 ${
                        isHovered
                          ? "border-red-600 text-red-600"
                          : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {audience.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-5">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                        isHovered
                          ? "bg-red-600 text-white shadow-md scale-105"
                          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold mb-3 transition-colors duration-300 ${
                        isHovered
                          ? "text-red-600"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {audience.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 transition-colors duration-300">
                      {audience.description}
                    </p>
                  </div>

                  {/* Hover Indicator */}
                  <div
                    className={`mt-4 pt-4 transition-all duration-300 ${
                      isHovered
                        ? "border-t border-red-200 dark:border-red-800 opacity-100"
                        : "border-t border-transparent opacity-0"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium flex items-center gap-1 transition-colors duration-300 ${
                        isHovered ? "text-red-600" : "text-gray-500"
                      }`}
                    >
                      Selengkapnya
                      <svg
                        className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>

                  {/* Subtle Red Accent on Hover */}
                  <div
                    className={`absolute inset-0 -z-10 bg-red-50 dark:bg-red-900/5 opacity-0 transition-opacity duration-300 ${
                      isHovered ? "opacity-100" : ""
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TargetAudience;
