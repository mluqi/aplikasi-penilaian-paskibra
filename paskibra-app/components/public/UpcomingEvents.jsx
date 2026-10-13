"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const kategoriOptions = [
  { value: "sd", label: "SD/Sederajat" },
  { value: "smp", label: "SMP" },
  { value: "sma_smk", label: "SMA/SMK" },
  { value: "umum", label: "Umum/Purna" },
];

const tingkatOptions = [
  { value: "kota_kabupaten", label: "Kab/Kota" },
  { value: "provinsi", label: "Prov" },
  { value: "nasional", label: "Nasional" },
];

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
};

const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agt",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const parseDate = (dateStr) => {
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    month: MONTHS_ID[d.getMonth()],
  };
};

const getCountdownText = (targetDateStr) => {
  if (!targetDateStr) return null;
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return `${diffDays} hari lagi`;
  if (diffDays === 1) return `Besok`;
  if (diffDays === 0) return "Hari Ini";
  return null; // Seharusnya tidak ditampilkan karena sudah difilter
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/events/public`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Gagal mengambil data event.");

        const data = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = (data.events || [])
          .filter((event) => new Date(event.event_tanggal) >= today)
          .sort((a, b) => new Date(a.event_tanggal) - new Date(b.event_tanggal))
          .slice(0, 8); // Diperbanyak ke 8 agar pas dengan 4 kolom (2 baris)

        setEvents(upcoming);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  if (!loading && events.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header - Dibuat lebih ringkas */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Event <span className="text-red-600">Mendatang</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Kompetisi terbaru untuk asah kemampuan tim Anda.
          </p>
        </div>

        {/* ── EVENTS GRID (4 Kolom di Desktop, 2 Kolom di Mobile) ── */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <div
                    className="w-full bg-gray-50 dark:bg-gray-800 animate-pulse"
                    style={{ aspectRatio: "2/3" }}
                  />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-4/5 bg-gray-50 dark:bg-gray-800 animate-pulse rounded" />
                    <div className="h-7 w-full bg-gray-50 dark:bg-gray-800 animate-pulse rounded-lg mt-2" />
                  </div>
                </div>
              ))
            : events.map((event) => {
                const { day, month } = parseDate(event.event_tanggal);
                const kategoriLabel =
                  kategoriOptions.find((o) => o.value === event.event_kategori)
                    ?.label || event.event_kategori;
                const tingkatLabel =
                  tingkatOptions.find((o) => o.value === event.event_tingkat)
                    ?.label || event.event_tingkat;

                const countdown = getCountdownText(event.event_tanggal);

                return (
                  <motion.div
                    variants={itemVariants}
                    key={event.event_id}
                    className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    {/* ── POSTER (Ukuran lebih kecil) ── */}
                    <div
                      className="relative w-full overflow-hidden"
                      style={{ aspectRatio: "2/3" }}
                    >
                      <Image
                        src={
                          event.event_poster
                            ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                            : "/default-poster.png"
                        }
                        alt={event.event_name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-101"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Badge */}
                      <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1 z-10">
                        <span className="text-[7px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md backdrop-blur-md bg-white/20 border border-white/30 text-white">
                          {kategoriLabel}
                        </span>
                      </div>

                      {/* Countdown Badge */}
                      {countdown && (
                        <div className="absolute top-1.5 right-1.5 z-10">
                          <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-md backdrop-blur-md bg-red-600/80 border border-red-500/50 text-white shadow-sm">
                            {countdown}
                          </span>
                        </div>
                      )}

                      {/* Date chip (Lebih Kecil) */}
                      <div className="absolute bottom-1.5 right-1.5 z-10 flex flex-col items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 leading-none">
                        <span className="text-xs sm:text-base font-bold text-amber-400">
                          {day}
                        </span>
                        <span className="text-[6px] sm:text-[8px] uppercase font-medium text-white/70">
                          {month}
                        </span>
                      </div>
                    </div>

                    {/* ── CARD BODY (Lebih Padat) ── */}
                    <div className="flex flex-col flex-grow p-2.5 sm:p-3.5 gap-1.5">
                      <h2 className="text-[11px] sm:text-[13px] font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 h-[2.5em]">
                        {event.event_name}
                      </h2>

                      <div className="flex items-center gap-1 text-[9px] sm:text-[11px] text-muted-foreground mt-auto">
                        <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 text-red-500" />
                        <span className="truncate">{event.event_kota}</span>
                      </div>

                      <Button
                        asChild
                        variant="outline"
                        className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-white h-7 sm:h-8 text-[9px] sm:text-[11px] font-medium transition-all"
                      >
                        <Link href={`/events/${event.event_id}`}>Detail</Link>
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
        </motion.div>

        <div className="text-center mt-10">
          <Button
            asChild
            variant="ghost"
            className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
          >
            <Link href="/events" className="flex items-center gap-2">
              Lihat Semua Kompetisi &rarr;
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
