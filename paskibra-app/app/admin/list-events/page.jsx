"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { id as localeId } from "date-fns/locale";
import api from "@/service/api";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Search,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import usePalindoWilayah from "@/hooks/usePalindoWilayah";

const kategoriOptions = [
  { value: "sd", label: "SD/Sederajat" },
  { value: "smp", label: "SMP/Sederajat" },
  { value: "sma_smk", label: "SMA/Sederajat" },
  { value: "umum", label: "Umum/Purna" },
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
  if (!dateStr) return { day: "-", month: "-", full: "-" };
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

export default function ListEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("aktif"); // 'aktif' | 'berlalu'

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

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;

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
    const fetchData = async () => {
      try {
        const eventsRes = await api.get("/events");
        setEvents(
          eventsRes.data.events || eventsRes.data.data || eventsRes.data || [],
        );
      } catch (error) {
        toast.error("Gagal memuat data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

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
    setCurrentPage(1);
  };

  const filteredEvents = events.filter((e) => {
    const eventDate = new Date(e.event_tanggal || new Date());
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Filter Status Waktu
    if (filterStatus === "aktif" && eventDate < today) return false;
    if (filterStatus === "berlalu" && eventDate >= today) return false;

    // 2. Filter Detail & Pencarian
    if (
      filters.search &&
      !(e.event_name || "").toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (filters.kategori && e.event_kategori !== filters.kategori) return false;
    if (filters.tingkat && e.event_tingkat !== filters.tingkat) return false;
    if (filters.biaya === "gratis" && e.event_biaya_pendaftaran !== 0)
      return false;
    if (
      filters.biaya === "berbayar" &&
      (!e.event_biaya_pendaftaran || e.event_biaya_pendaftaran === 0)
    )
      return false;
    if (filters.provinsi && e.event_provinsi !== filters.provinsi) return false;
    if (filters.kota && e.event_kota !== filters.kota) return false;

    return true;
  });

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage,
  );

  const isFilterActive =
    searchQuery.trim() !== "" ||
    Object.values(filters).some((val) => val !== "");

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-[80vh] items-center justify-center">
          <p className="text-muted-foreground">Memuat daftar event...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Daftar Event</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Event</h1>
          <p className="text-muted-foreground mt-1">
            Temukan dan daftarkan tim Anda ke berbagai event perlombaan.
          </p>
        </div>

        <div className="flex bg-muted/50 p-1.5 rounded-xl w-fit mb-2 border border-border/50">
          <Button
            variant={filterStatus === "aktif" ? "default" : "ghost"}
            onClick={() => setFilterStatus("aktif")}
            className="rounded-lg px-4 sm:px-6 shadow-none data-[state=active]:shadow-sm"
          >
            Event Aktif
          </Button>
          <Button
            variant={filterStatus === "berlalu" ? "default" : "ghost"}
            onClick={() => setFilterStatus("berlalu")}
            className="rounded-lg px-4 sm:px-6 shadow-none data-[state=active]:shadow-sm"
          >
            Sudah Berlalu
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="space-y-3 mb-2">
          <div className="flex gap-2">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari nama event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") triggerSearch();
                }}
                className="pl-9 h-10 w-full rounded-lg bg-background"
              />
            </div>
            <Button
              onClick={triggerSearch}
              className="h-10 px-5 rounded-lg hidden sm:flex shadow-sm"
            >
              Cari
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-10 px-3 rounded-lg shadow-sm transition-colors",
                showFilters && "bg-muted",
              )}
            >
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>

          <div
            className={cn(
              "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3",
              showFilters ? "grid" : "hidden",
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
                  <SelectTrigger className="h-9 rounded-lg text-xs">
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((o) => (
                      <SelectItem
                        key={o.value}
                        className="text-xs"
                        value={o.value}
                      >
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
                <SelectTrigger className="h-9 rounded-lg text-xs">
                  <SelectValue placeholder="Semua Provinsi" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueProvinces.map((prov) => (
                    <SelectItem
                      key={prov.id}
                      className="text-xs"
                      value={prov.name}
                    >
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
                <SelectTrigger className="h-9 rounded-lg text-xs">
                  <SelectValue placeholder="Semua Kota/Kab." />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCities.map((city) => (
                    <SelectItem
                      key={city.id}
                      className="text-xs"
                      value={city.name}
                    >
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
              className="h-9 w-full gap-2 rounded-lg mt-auto text-xs disabled:opacity-50"
            >
              <X className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
            <p className="text-muted-foreground">
              Belum ada event yang{" "}
              {filterStatus === "aktif" ? "tersedia saat ini" : "sudah berlalu"}
              .
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`admin-events-${filterStatus}-${currentPage}-${JSON.stringify(filters)}`}
          >
            {currentEvents.map((event) => {
              const { day, month } = parseDate(event.event_tanggal);
              const kategoriLabel =
                kategoriOptions.find((o) => o.value === event.event_kategori)
                  ?.label || capitalize(event.event_kategori);
              const tingkatLabel =
                tingkatOptions.find((o) => o.value === event.event_tingkat)
                  ?.label || capitalize(event.event_tingkat);

              return (
                <motion.div
                  variants={itemVariants}
                  key={event.event_id}
                  className="h-full"
                >
                  <Link
                    href={`/admin/list-events/${event.event_id}`}
                    className="group flex flex-col h-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer block"
                  >
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
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-10 flex flex-col items-center bg-black/55 backdrop-blur-md border border-white/15 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 leading-none">
                        <span className="text-sm sm:text-xl font-bold text-amber-400">
                          {day}
                        </span>
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-widest text-white/60 mt-0.5">
                          {month}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col flex-grow p-2.5 sm:p-4 gap-1.5 sm:gap-2">
                      <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {event.event_name}
                      </h2>
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {event.event_deskripsi}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground mt-auto pt-1">
                        <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 opacity-60" />
                        <span className="truncate">
                          {event.event_kota || "-"}, {event.event_provinsi || "-"}
                        </span>
                      </div>
                      <div className="mt-1 sm:mt-2 w-full rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200 h-7 sm:h-9 text-[10px] sm:text-sm font-medium flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                        Lihat Detail
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
      </main>
    </ProtectedRoute>
  );
}
