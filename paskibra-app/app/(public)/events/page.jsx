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
import { Card, CardContent } from "@/components/ui/card";

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

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
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

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State untuk input pencarian
  const [filters, setFilters] = useState({
    kategori: "",
    tingkat: "",
    provinsi: "",
    kota: "",
    search: "",
  });
  const [loading, setLoading] = useState(true);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(9); // 9 event per halaman (3x3 grid)
  const [totalEvents, setTotalEvents] = useState(0);

  // State untuk menyimpan opsi filter (provinsi & kota unik)
  const [uniqueProvinces, setUniqueProvinces] = useState([]);
  const [uniqueCities, setUniqueCities] = useState([]);

  // Mengambil data event dan opsi filter provinsi
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
        // Menggunakan Promise.all untuk mengambil data secara paralel
        const [eventRes, provinsiRes] = await Promise.all([
          fetch(`${apiUrl}/api/events/public?${eventParams.toString()}`, {
            cache: "no-store",
          }),
          fetch(`${apiUrl}/api/wilayah/provinsi`),
        ]);

        if (!eventRes.ok) throw new Error("Gagal mengambil data event.");
        if (!provinsiRes.ok) throw new Error("Gagal mengambil data provinsi.");

        const eventData = await eventRes.json();
        const provinsiData = await provinsiRes.json();

        setFilteredEvents(eventData.events || []);
        setTotalEvents(eventData.totalItems || 0);
        setUniqueProvinces(provinsiData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.message);
        setFilteredEvents([]);
        setTotalEvents(0);
        setUniqueProvinces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters, currentPage, eventsPerPage]);

  // Ambil daftar kota setiap kali provinsi yang dipilih berubah
  useEffect(() => {
    const fetchCities = async () => {
      if (filters.provinsi && uniqueProvinces.length > 0) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const selectedProvince = uniqueProvinces.find(
          (p) => p.name === filters.provinsi
        );
        if (selectedProvince) {
          const kotaRes = await fetch(
            `${apiUrl}/api/wilayah/kota?province_id=${selectedProvince.id}`
          );
          const kotaData = await kotaRes.json();
          setUniqueCities(kotaData.data || []);
        }
      } else {
        setUniqueCities([]);
      }
    };
    fetchCities();
  }, [filters.provinsi, uniqueProvinces]);

  const handleFilterChange = (name, value) => {
    // Jika provinsi diubah, reset pilihan kota
    if (name === "provinsi") {
      setFilters((prev) => ({ ...prev, provinsi: value, kota: "" }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
    setCurrentPage(1); // Reset ke halaman pertama setiap kali filter berubah
  };

  const triggerSearch = () => {
    handleFilterChange("search", searchQuery);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      kategori: "",
      tingkat: "",
      provinsi: "",
      kota: "",
      search: "",
    });
  };

  // Logika Pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents; // Data sudah dipaginasi oleh backend
  const totalPages = Math.ceil(totalEvents / eventsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <main className="flex-grow">
        <PageHeader
          breadcrumb="Event"
          title="Jelajahi Event Paskibra"
          subtitle="Temukan berbagai kompetisi Paskibra yang akan datang dan lihat hasil dari event yang telah berlalu."
        />

        {/* Events Grid */}
        <section className="pb-16 sm:pb-24">
          <div className="container mx-auto px-4">
            {/* Filter Section */}
            <Card className="mb-12 p-6 bg-gray-50 dark:bg-gray-800/50">
              <CardContent className="p-0 space-y-4">
                <div className="flex gap-2 items-center relative">
                  <Search className="absolute text-muted-foreground ml-2 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Cari nama event..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        triggerSearch();
                      }
                    }}
                    className="pl-10 h-12 text-base"
                  />
                  <Button onClick={triggerSearch} className="h-12">
                    <Search className="h-5 w-5 md:hidden" />
                    <span className="hidden md:inline">Cari</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end pt-4 border-t border-border">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori</label>
                    <Select
                      value={filters.kategori}
                      onValueChange={(v) => handleFilterChange("kategori", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {kategoriOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tingkat</label>
                    <Select
                      value={filters.tingkat}
                      onValueChange={(v) => handleFilterChange("tingkat", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Tingkat" />
                      </SelectTrigger>
                      <SelectContent>
                        {tingkatOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provinsi</label>
                    <Select
                      value={filters.provinsi}
                      onValueChange={(v) => handleFilterChange("provinsi", v)}
                    >
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kota/Kab.</label>
                    <Select
                      value={filters.kota}
                      onValueChange={(v) => handleFilterChange("kota", v)}
                    >
                      <SelectTrigger>
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
                  <div className="flex gap-2">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" /> Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              // Beri key unik agar animasi berjalan setiap kali filter berubah
              key={`events-page-${currentPage}-${filteredEvents.length}`}
            >
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
                  >
                    <div className="relative h-56 w-full bg-muted animate-pulse"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
                      <div className="h-10 w-full bg-muted animate-pulse rounded-lg mt-4"></div>
                    </div>
                  </div>
                ))
              ) : filteredEvents.length > 0 ? (
                currentEvents.map((event) => (
                  <motion.div
                    variants={itemVariants}
                    key={event.event_id}
                    className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative h-56 w-full">
                      <Image
                        src={
                          event.event_poster
                            ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                            : "/default-poster.png" // Gambar placeholder
                        }
                        alt={`Poster ${event.event_name}`}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex flex-col flex-grow p-5">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {event.event_kategori && (
                          <Badge variant="outline">
                            {kategoriOptions.find(
                              (opt) => opt.value === event.event_kategori
                            )?.label || capitalize(event.event_kategori)}
                          </Badge>
                        )}
                        {event.event_tingkat && (
                          <Badge variant="outline">
                            {tingkatOptions.find(
                              (opt) => opt.value === event.event_tingkat
                            )?.label || capitalize(event.event_tingkat)}
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {event.event_name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow text-sm line-clamp-2">
                        {event.event_deskripsi}
                      </p>
                      <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(event.event_tanggal).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {event.event_kota}, {event.event_provinsi}
                          </span>
                        </div>
                      </div>
                      <Button asChild className="mt-auto">
                        <Link href={`/events/${event.event_id}`}>
                          Lihat Detail
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-xl font-semibold">Belum Ada Event</h3>
                  <p className="text-muted-foreground mt-2">
                    Silakan cek kembali nanti untuk melihat event yang akan
                    datang.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Pagination Controls */}
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
