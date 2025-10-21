"use client";

import React, { useState } from "react";
import { LayoutGrid, Users, Gavel, BarChart, ChevronRight } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const featuresList = [
  {
    icon: LayoutGrid,
    title: "Manajemen Event Terpusat",
    shortDesc: "Kelola semua aspek event dalam satu platform terpadu.",
    description:
      "Buat, kelola, dan publikasikan detail event Anda dengan mudah. Atur jadwal, kategori lomba, dan kriteria penilaian sesuai kebutuhan. Semua informasi tersimpan terpusat dan dapat diakses kapan saja.",
    features: [
      "Dashboard lengkap untuk monitoring event",
      "Pengaturan kategori lomba fleksibel",
      "Manajemen jadwal otomatis",
      "Publikasi informasi real-time"
    ]
  },
  {
    icon: Users,
    title: "Pendaftaran Tim Online",
    shortDesc: "Proses pendaftaran peserta yang mudah dan efisien.",
    description:
      "Sederhanakan proses pendaftaran. Tim dapat mendaftar, melengkapi data, dan mengunggah berkas persyaratan langsung melalui platform. Sistem verifikasi otomatis memastikan kelengkapan data.",
    features: [
      "Form pendaftaran interaktif",
      "Upload dokumen persyaratan",
      "Verifikasi data otomatis",
      "Notifikasi status pendaftaran"
    ]
  },
  {
    icon: Gavel,
    title: "Penilaian Real-time oleh Juri",
    shortDesc: "Sistem penilaian digital yang transparan dan akurat.",
    description:
      "Juri dapat memberikan nilai secara langsung melalui tablet atau smartphone. Hasil lebih cepat, transparan, dan meminimalisir kesalahan input. Dashboard khusus juri memudahkan proses penilaian.",
    features: [
      "Interface penilaian intuitif",
      "Penilaian multi-kriteria",
      "Sinkronisasi data real-time",
      "Riwayat penilaian tersimpan"
    ]
  },
  {
    icon: BarChart,
    title: "Rekapitulasi Nilai Otomatis",
    shortDesc: "Perhitungan hasil lomba yang cepat dan presisi.",
    description:
      "Lupakan rekapitulasi manual. Sistem kami akan menghitung total nilai dan menentukan peringkat juara secara otomatis dan akurat. Hasil dapat langsung dipublikasikan setelah verifikasi.",
    features: [
      "Kalkulasi otomatis dan akurat",
      "Ranking real-time",
      "Export hasil dalam berbagai format",
      "Dashboard analitik lengkap"
    ]
  },
];

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="features"
      className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
    >
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-3xl text-center md:text-left mb-16 md:ml-0 lg:ml-28">
          <span className="text-sm font-medium text-red-600 dark:text-red-400 mb-4 block">
            Fitur Lengkap
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Semua yang Anda Butuhkan untuk{" "}
            <span className="text-red-600 dark:text-red-400">
              Event Paskibra Profesional
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Dari persiapan hingga pengumuman juara, platform kami menyediakan
            alat yang dirancang khusus untuk menyukseskan event Anda.
          </p>
        </div>

        {/* Features Content */}
        <div className="max-w-7xl mx-auto">
          {/* DESKTOP VIEW: Two-column interactive layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Side - Feature List */}
            <div className="space-y-3">
              {featuresList.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = activeIndex === index;

                return (
                  <button
                    key={feature.title}
                    onClick={() => setActiveIndex(index)}
                    className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-200 dark:hover:border-red-800"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-red-600 text-white scale-110"
                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                            isActive
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {feature.title}
                        </h3>
                        <p
                          className={`text-sm transition-colors duration-300 ${
                            isActive
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-gray-500 dark:text-gray-500"
                          }`}
                        >
                          {feature.shortDesc}
                        </p>
                      </div>

                      {/* Arrow Indicator */}
                      <ChevronRight
                        className={`flex-shrink-0 w-5 h-5 transition-all duration-300 ${
                          isActive
                            ? "text-red-600 dark:text-red-400 opacity-100 translate-x-1"
                            : "text-gray-400 dark:text-gray-600 opacity-0"
                        }`}
                      />
                    </div>

                    {/* Active Indicator Line */}
                    {isActive && (
                      <div className="mt-4 h-0.5 rounded-full bg-red-600 dark:bg-red-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Side - Feature Details */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-8 transition-all duration-500 shadow-sm">
                {/* Feature Icon & Title */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-red-600 text-white">
                    {React.createElement(featuresList[activeIndex].icon, {
                      className: "w-8 h-8",
                    })}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {featuresList[activeIndex].title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  {featuresList[activeIndex].description}
                </p>

                {/* Feature Points */}
                <div className="space-y-3">
                  {featuresList[activeIndex].features.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 group"
                      style={{
                        animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both`,
                      }}
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center mt-0.5">
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button className="mt-8 w-full py-3 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-300 shadow-sm hover:shadow-md">
                  Pelajari Lebih Lanjut
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE VIEW: Accordion layout */}
          <div className="lg:hidden">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {featuresList.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 px-6 transition-all duration-300"
                  >
                    <AccordionTrigger className="py-6 text-left hover:no-underline group">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300 pr-4 text-base">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {feature.shortDesc}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.features.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}