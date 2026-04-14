"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const kategoriOptions = [
  { value: "smp", label: "SMP/Sederajat" },
  { value: "sma_smk", label: "SMA/Sederajat" },
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "umum", label: "Umum" },
];

const tingkatOptions = [
  { value: "kota_kabupaten", label: "Kota/Kabupaten" },
  { value: "provinsi", label: "Provinsi" },
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

const EventCard = ({ event }) => {
  const { day, month } = parseDate(event.event_tanggal);
  const kategoriLabel =
    kategoriOptions.find((o) => o.value === event.event_kategori)?.label ||
    capitalize(event.event_kategori);
  const tingkatLabel =
    tingkatOptions.find((o) => o.value === event.event_tingkat)?.label ||
    capitalize(event.event_tingkat);

  return (
    <div className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] px-3 py-4">
      <div className="group flex flex-col rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 h-full">
        {/* POSTER */}
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
            alt={`Poster ${event.event_name}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {event.event_kategori && (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur-md bg-white/15 border border-white/25 text-white">
                {kategoriLabel}
              </span>
            )}
            {event.event_tingkat && (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur-md bg-primary/80 border border-primary/40 text-primary-foreground">
                {tingkatLabel}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 z-10 flex flex-col items-center bg-black/55 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2 leading-none">
            <span className="text-xl font-bold text-amber-400">{day}</span>
            <span className="text-[9px] uppercase tracking-widest text-white/60 mt-0.5">
              {month}
            </span>
          </div>
        </div>

        {/* CARD BODY */}
        <div className="flex flex-col flex-grow p-4 gap-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {event.event_name}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {event.event_deskripsi}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto pt-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <span className="truncate">
              {event.event_kota}, {event.event_provinsi}
            </span>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="mt-2 w-full rounded-xl border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200"
          >
            <Link href={`/events/${event.event_id}`}>Lihat Detail</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollWidth, setScrollWidth] = useState(0);
  const containerRef = useRef(null);

  const duplicatedEvents = events.length > 0 ? [...events, ...events] : [];

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || loading || events.length === 0) return;

    const interval = setInterval(() => {
      setOffset((prevOffset) => prevOffset - 1);
    }, 25);

    return () => clearInterval(interval);
  }, [isPaused, loading, events.length]);

  // Scroll width calculation and reset for looping
  useEffect(() => {
    if (containerRef.current && events.length > 0 && scrollWidth === 0) {
      const halfWidth = containerRef.current.scrollWidth / 2;
      setScrollWidth(halfWidth);
    }

    if (scrollWidth > 0 && offset <= -scrollWidth) {
      setOffset(0);
    }
  }, [offset, events, scrollWidth]);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/events/public`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Gagal mengambil data event.");

        const data = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = (data.events || []).filter(
          (event) => new Date(event.event_tanggal) >= today,
        );

        setEvents(upcoming);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Event <span className="text-red-600">Mendatang</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Jangan lewatkan kompetisi Paskibra seru yang akan segera hadir di
            lokasi terdekat Anda. Segera daftar dan persiapkan tim!
          </p>
        </div>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={containerRef}
            className="flex"
            style={{
              transform: `translateX(${offset}px)`,
              transition: "none",
            }}
          >
            {duplicatedEvents.map((event, index) => (
              <EventCard key={`${event.event_id}-${index}`} event={event} />
            ))}
          </div>

          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10"></div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
          >
            <Link href="/events">Lihat Semua Event</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
