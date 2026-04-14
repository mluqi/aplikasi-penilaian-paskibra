"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import usePalindoWilayah from "@/hooks/usePalindoWilayah";
import { cn } from "@/lib/utils";

// ─── semua konstanta & helper tetap sama ────────────────────────────────────
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

const biayaOptions = [
  { value: "gratis", label: "Gratis" },
  { value: "berbayar", label: "Berbayar" },
];

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
};

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ─── komponen utama ──────────────────────────────────────────────────────────
export default function EventsPage() {
  // ── semua state & logic tidak diubah ──
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    kategori: "",
    tingkat: "",
    biaya: "",
    provinsi: "",
    kota: "",
    search: "",
  });
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(9);
  const [totalEvents, setTotalEvents] = useState(0);

  const {
    provinces: uniqueProvinces,
    cities: uniqueCities,
    fetchProvinces,
    fetchCities,
    setCities: setUniqueCities,
  } = usePalindoWilayah();

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const eventParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: eventsPerPage.toString(),
        ...filters,
      });
      try {
        const eventRes = await fetch(
          `${apiUrl}/api/events/public?${eventParams.toString()}`,
          { cache: "no-store" },
        );
        if (!eventRes.ok) throw new Error("Gagal mengambil data event.");
        const eventData = await eventRes.json();
        setFilteredEvents(eventData.events || []);
        setTotalEvents(eventData.totalItems || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.message);
        setFilteredEvents([]);
        setTotalEvents(0);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [filters, currentPage, eventsPerPage]);

  useEffect(() => {
    if (filters.provinsi && uniqueProvinces.length > 0) {
      const selectedProvince = uniqueProvinces.find(
        (p) => p.name === filters.provinsi,
      );
      if (selectedProvince) fetchCities(selectedProvince.id);
    } else {
      setUniqueCities([]);
    }
  }, [filters.provinsi, uniqueProvinces, fetchCities, setUniqueCities]);

  const handleFilterChange = (name, value) => {
    if (name === "provinsi") {
      setFilters((prev) => ({ ...prev, provinsi: value, kota: "" }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
    setCurrentPage(1);
  };

  const triggerSearch = () => {
    handleFilterChange("search", searchQuery);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      kategori: "",
      tingkat: "",
      biaya: "",
      provinsi: "",
      kota: "",
      search: "",
    });
  };

  const isFilterActive =
    searchQuery.trim() !== "" ||
    Object.values(filters).some((val) => val !== "");

  const currentEvents = filteredEvents;
  const totalPages = Math.ceil(totalEvents / eventsPerPage);

  // ── helper tanggal untuk date chip ──
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
      full: d.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <main className="flex-grow">
        <PageHeader
          breadcrumb="Event"
          title="Jelajahi Event Paskibra"
          subtitle="Temukan berbagai kompetisi Paskibra yang akan datang dan lihat hasil dari event yang telah berlalu."
        />

        <section className="pb-16 sm:pb-24">
          <div className="container mx-auto px-4">
            {/* ── FILTER SECTION ── */}
            <div className="mb-10 space-y-3 max-w-6xl mx-auto">
              {/* Search Bar & Mobile Toggle */}
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Cari nama event..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") triggerSearch();
                    }}
                    className="pl-12 h-12 w-full text-base rounded-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm focus-visible:ring-primary/20 transition-all"
                  />
                </div>
                <Button
                  onClick={triggerSearch}
                  className="h-12 px-6 rounded-2xl hidden sm:flex shadow-sm"
                >
                  Cari
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-12 px-4 rounded-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm lg:hidden transition-colors",
                    showFilters && "bg-gray-100 dark:bg-gray-800",
                  )}
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </div>

              {/* Advanced Filters */}
              <div
                className={cn(
                  "grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3",
                  showFilters ? "grid" : "hidden lg:grid",
                )}
              >
                {[
                  {
                    key: "kategori",
                    label: "Kategori",
                    options: kategoriOptions,
                    placeholder: "Semua Kategori",
                  },
                  {
                    key: "tingkat",
                    label: "Tingkat",
                    options: tingkatOptions,
                    placeholder: "Semua Tingkat",
                  },
                  {
                    key: "biaya",
                    label: "Biaya",
                    options: biayaOptions,
                    placeholder: "Semua Biaya",
                  },
                ].map(({ key, label, options, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                      {label}
                    </label>
                    <Select
                      value={filters[key]}
                      onValueChange={(v) => handleFilterChange(key, v)}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm text-sm">
                        <SelectValue placeholder={placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                    Provinsi
                  </label>
                  <Select
                    value={filters.provinsi}
                    onValueChange={(v) => handleFilterChange("provinsi", v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm text-sm">
                      <SelectValue placeholder="Semua Provinsi" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueProvinces.map((prov) => (
                        <SelectItem key={prov.id} value={prov.name}>
                          {prov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                    Kota/Kab.
                  </label>
                  <Select
                    value={filters.kota}
                    onValueChange={(v) => handleFilterChange("kota", v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm text-sm">
                      <SelectValue placeholder="Semua Kota" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCities.map((city) => (
                        <SelectItem key={city.id} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={resetFilters}
                  variant="outline"
                  disabled={!isFilterActive}
                  className="h-11 w-full gap-2 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" /> Reset
                </Button>
              </div>
            </div>

            {/* ── EVENTS GRID ── */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={`events-page-${currentPage}-${filteredEvents.length}`}
            >
              {loading ? (
                /* Skeleton — sesuai style card portrait baru */
                Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  >
                    {/* Poster skeleton — aspect-ratio 2/3 */}
                    <div
                      className="w-full bg-gray-100 dark:bg-gray-800 animate-pulse"
                      style={{ aspectRatio: "2/3" }}
                    />
                    <div className="p-4 space-y-2.5">
                      <div className="h-4 w-4/5 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md" />
                      <div className="h-4 w-3/5 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md" />
                      <div className="h-3 w-2/5 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md mt-1" />
                      <div className="h-9 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl mt-3" />
                    </div>
                  </div>
                ))
              ) : filteredEvents.length > 0 ? (
                currentEvents.map((event) => {
                  const { day, month, full } = parseDate(event.event_tanggal);
                  const kategoriLabel =
                    kategoriOptions.find(
                      (o) => o.value === event.event_kategori,
                    )?.label || capitalize(event.event_kategori);
                  const tingkatLabel =
                    tingkatOptions.find((o) => o.value === event.event_tingkat)
                      ?.label || capitalize(event.event_tingkat);

                  return (
                    <motion.div
                      variants={itemVariants}
                      key={event.event_id}
                      className="group flex flex-col rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
                    >
                      {/* ── POSTER — portrait aspect ratio 2/3 ── */}
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

                        {/* Gradient overlay bawah */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                        {/* Badge kategori & tingkat — floating atas kiri */}
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1 sm:gap-1.5 z-10">
                          {event.event_kategori && (
                            <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-md bg-white/15 border border-white/25 text-white">
                              {kategoriLabel}
                            </span>
                          )}
                          {event.event_tingkat && (
                            <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-md bg-primary/80 border border-primary/40 text-primary-foreground">
                              {tingkatLabel}
                            </span>
                          )}
                        </div>

                        {/* Date chip — pojok kanan bawah poster */}
                        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-10 flex flex-col items-center bg-black/55 backdrop-blur-md border border-white/15 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 leading-none">
                          <span className="text-sm sm:text-xl font-bold text-amber-400">
                            {day}
                          </span>
                          <span className="text-[7px] sm:text-[9px] uppercase tracking-widest text-white/60 mt-0.5">
                            {month}
                          </span>
                        </div>
                      </div>

                      {/* ── CARD BODY ── */}
                      <div className="flex flex-col flex-grow p-2.5 sm:p-4 gap-1.5 sm:gap-2">
                        {/* Judul */}
                        <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                          {event.event_name}
                        </h2>

                        {/* Deskripsi */}
                        <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {event.event_deskripsi}
                        </p>

                        {/* Lokasi */}
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground mt-auto pt-1">
                          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 opacity-60" />
                          <span className="truncate">
                            {event.event_kota}, {event.event_provinsi}
                          </span>
                        </div>

                        {/* CTA */}
                        <Button
                          asChild
                          variant="outline"
                          className="mt-1 sm:mt-2 w-full rounded-lg sm:rounded-xl border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200 h-7 sm:h-9 text-[10px] sm:text-sm"
                        >
                          <Link href={`/events/${event.event_id}`}>
                            Lihat Detail
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-16">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Belum Ada Event
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    Silakan cek kembali nanti untuk melihat event yang akan
                    datang.
                  </p>
                </div>
              )}
            </motion.div>

            {/* ── PAGINATION — tidak diubah sama sekali ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 space-x-4">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
