"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const kategoriOptions = [
  { value: "smp", label: "SMP/Sederajat" },
  { value: "sma_smk", label: "SMA/Sederajat" },
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "umum", label: "Umum" },
];

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
};

const EventCard = ({ event }) => (
  <div className="flex-shrink-0 w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-3">
    <Card className="overflow-hidden h-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-red-500 dark:hover:border-red-400 group">
      <div className="relative h-48 w-full overflow-hidden">
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
      </div>
      <CardContent className="p-5 flex flex-col h-54">
        <div className="flex flex-wrap gap-2 mb-3">
          {event.event_kategori && (
            <Badge variant="secondary" className="text-xs">
              {kategoriOptions.find((opt) => opt.value === event.event_kategori)
                ?.label || capitalize(event.event_kategori)}
            </Badge>
          )}
        </div>

        <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-red-600 transition-colors duration-300 text-lg leading-tight">
          {event.event_name}
        </h3>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-500" />
            <span className="text-sm">
              {new Date(event.event_tanggal).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />
            <span className="text-sm line-clamp-1">
              {event.event_kota}, {event.event_provinsi}
            </span>
          </div>
        </div>

        <Button
          asChild
          className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
        >
          <Link href={`/events/${event.event_id}`}>Lihat Detail</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

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
          (event) => new Date(event.event_tanggal) >= today
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
