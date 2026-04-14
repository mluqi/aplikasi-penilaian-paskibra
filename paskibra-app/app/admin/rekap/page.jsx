"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/service/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Frown,
  Loader2,
  Lock,
  Unlock,
  Search,
  MapPin,
  CalendarIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import Image from "next/image";

// --- Komponen Detail Penilaian untuk Accordion ---
const JuriScoreCard = ({ penilaian, onUnlockSuccess }) => (
  <Card className="mb-4">
    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={
            penilaian.User.user_photo
              ? `${process.env.NEXT_PUBLIC_API_URL}${penilaian.User.user_photo}`
              : ""
          }
        />
        <AvatarFallback>{penilaian.User.user_name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold">{penilaian.User.user_name}</p>
        <p className="text-xs text-muted-foreground">
          Total Nilai:{" "}
          <span className="font-bold text-foreground">
            {parseFloat(penilaian.total_nilai).toFixed(2)}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        {penilaian.is_lock ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Terkunci
          </Badge>
        ) : (
          <Badge variant="secondary">Sudah Dinilai</Badge>
        )}
        {penilaian.is_lock && onUnlockSuccess && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUnlockSuccess(penilaian.penilaian_id)}
            className="h-7"
          >
            <Unlock className="h-3 w-3 mr-1" />
            Buka
          </Button>
        )}
      </div>
    </CardHeader>
    <CardContent>
      {penilaian.catatan && (
        <blockquote className="mt-2 border-l-2 pl-4 italic text-sm">
          "{penilaian.catatan}"
        </blockquote>
      )}
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Aspek</TableHead>
            <TableHead>Sub-Aspek</TableHead>
            <TableHead className="text-right">Nilai</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {penilaian.AspekNilais.map((aspekNilai) =>
            aspekNilai.SubAspekNilais.map((subNilai, subIndex) => (
              <TableRow key={subNilai.id}>
                {subIndex === 0 && (
                  <TableCell
                    rowSpan={aspekNilai.SubAspekNilais.length}
                    className="font-semibold align-top"
                  >
                    <p>{aspekNilai.Aspek.nama_aspek}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      Nilai Aspek:{" "}
                      {parseFloat(aspekNilai.nilai_aspek).toFixed(2)}
                    </p>
                  </TableCell>
                )}
                <TableCell>{subNilai.SubAspek.nama_subaspek}</TableCell>
                <TableCell className="text-right font-mono">
                  {parseFloat(subNilai.nilai).toFixed(2)}
                </TableCell>
              </TableRow>
            )),
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const TeamDetailAccordion = ({ team, eventId, onDataUpdate }) => {
  const { user } = useAuth();
  const [details, setDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/penilaian/detail/${eventId}/${team.team_id}`,
      );
      setDetails(response.data.details || []); // Ambil data dari properti 'details'
    } catch (error) {
      toast.error(`Gagal memuat detail untuk tim ${team.team_name}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async (penilaianId) => {
    try {
      const response = await api.patch(`/penilaian/unlock/${penilaianId}`);
      toast.success(response.data.message);
      // Perbarui state lokal untuk mencerminkan perubahan
      setDetails((prevDetails) =>
        prevDetails.map((p) =>
          p.penilaian_id === penilaianId ? { ...p, is_lock: false } : p,
        ),
      );
      // Panggil callback untuk memperbarui data di level atas jika perlu
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal membuka kunci.");
    }
  };
  return (
    <AccordionItem value={team.team_id}>
      <AccordionTrigger onClick={() => details.length === 0 && fetchDetails()}>
        {team.team_name}
        <span className="text-sm text-muted-foreground ml-2 font-normal">
          ({team.team_sekolah_instansi})
        </span>
      </AccordionTrigger>
      <AccordionContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memuat detail penilaian...
          </div>
        ) : details.length > 0 ? (
          details.map((penilaian) => (
            <JuriScoreCard
              key={penilaian.penilaian_id}
              penilaian={penilaian}
              onUnlockSuccess={
                user?.role === "admin" || user?.role === "superadmin"
                  ? handleUnlock
                  : undefined
              }
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground p-4">
            Belum ada penilaian yang masuk untuk tim ini.
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

const RekapNilaiPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null); // Untuk view Juri
  const [rekapData, setRekapData] = useState({
    isSpecialView: false,
    rekap: [],
    aspeks: [],
    teams: [],
  });
  const [filters, setFilters] = useState({ status: null, year: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [availableYears, setAvailableYears] = useState([]);

  const [viewingTeamDetails, setViewingTeamDetails] = useState(null); // State untuk dialog detail
  const [rekapVersion, setRekapVersion] = useState(0); // Untuk memicu re-fetch
  const [loading, setLoading] = useState(true);

  const isJuriView = user?.role === "juri";
  const isAdminView = ["admin", "superadmin"].includes(user?.role);

  useEffect(() => {
    if (user?.role === "koordinator_team") {
      router.replace("/admin/rekap/koordinator-team");
    } else if (user?.role === "koordinator_event") {
      router.replace("/admin/rekap/koordinator-event");
    }
  }, [user, router]);

  // Fetch daftar event (untuk semua role di halaman ini)
  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      const endpoint = user?.role === "juri" ? "/events/juri" : "/events";
      const response = await api.get(endpoint);
      const eventList = response.data.events || [];
      setEvents(eventList);
      const years = [
        ...new Set(
          eventList.map((e) =>
            new Date(e.event_tanggal).getFullYear().toString(),
          ),
        ),
      ].sort((a, b) => b - a);
      setAvailableYears(years);
    } catch (error) {
      toast.error("Gagal memuat daftar event.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventYear = new Date(event.event_tanggal).getFullYear().toString();
      const statusMatch = filters.status
        ? event.event_status === filters.status
        : true;
      const yearMatch = filters.year ? eventYear === filters.year : true;
      const searchMatch =
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.event_tempat &&
          event.event_tempat.toLowerCase().includes(searchQuery.toLowerCase()));

      return statusMatch && yearMatch && searchMatch;
    });
  }, [events, filters, searchQuery]);

  // Fetch data rekap berdasarkan event yang dipilih (untuk admin/superadmin)
  useEffect(() => {
    if (!activeEvent || !isAdminView) {
      setLoading(false);
      return;
    }

    const fetchRekap = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/rekap/${activeEvent.event_id}`);
        setRekapData(response.data);
        console.log("Rekap Data Loaded:", response.data); // Untuk debugging
      } catch (error) {
        toast.error("Gagal memuat data rekapitulasi.");
        setRekapData({
          isSpecialView: false,
          rekap: [],
          aspeks: [],
          teams: [],
          details: {},
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRekap();
  }, [activeEvent, isAdminView, rekapVersion]);

  // Fetch tim untuk event yang dipilih (khusus juri) saat event aktif dipilih
  useEffect(() => {
    if (!activeEvent || user?.role !== "juri") return;

    const fetchTeamsForEvent = async () => {
      setLoading(true);
      try {
        // Menggunakan endpoint rekap yang sudah ada
        const response = await api.get(`/rekap/${activeEvent.event_id}`);
        setRekapData(response.data);
      } catch (error) {
        toast.error("Gagal memuat daftar tim untuk event ini.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsForEvent();
  }, [activeEvent, user?.role]);

  const displayTeams = useMemo(() => {
    if (rekapData.teams && rekapData.teams.length > 0) {
      return rekapData.teams;
    }
    if (rekapData.rekap && rekapData.rekap.length > 0) {
      return rekapData.rekap; // Data rekap sudah berisi info tim
    }
    return [];
  }, [rekapData]);
  // Jangan render apapun jika sedang proses redirect
  if (user?.role === "koordinator_team" || user?.role === "koordinator_event") {
    return (
      <div className="flex h-screen items-center justify-center">
        Mengarahkan...
      </div>
    );
  }

  return (
    <ProtectedRoute requiredAccess="view_recap">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Rekap Nilai</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {activeEvent ? (
          <>
            {/* Header Event Terpilih */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-border/50 p-4 md:p-6 mb-2">
              <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-20 md:w-20 md:h-28 shrink-0 rounded-lg overflow-hidden border shadow-sm bg-muted/50">
                    <Image
                      src={
                        activeEvent.event_poster
                          ? `${process.env.NEXT_PUBLIC_API_URL}${activeEvent.event_poster}`
                          : "/default-poster.png"
                      }
                      alt={`Poster ${activeEvent.event_name}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground line-clamp-2">
                      {activeEvent.event_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4 text-primary" />{" "}
                        {format(
                          new Date(activeEvent.event_tanggal),
                          "d MMMM yyyy",
                          { locale: id },
                        )}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary" />{" "}
                        {activeEvent.event_tempat}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveEvent(null)}
                  className="w-full md:w-auto shadow-sm shrink-0"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Ganti Event
                </Button>
              </div>
            </div>

            {/* Tampilan Detail untuk Juri */}
            {isJuriView && (
              <div>
                <h1 className="text-2xl font-semibold mb-2">
                  Daftar Tim: {activeEvent.event_name}
                </h1>
                {loading && <p>Memuat daftar tim...</p>}
                {!loading && displayTeams.length > 0 && (
                  <Accordion type="single" collapsible className="w-full">
                    {displayTeams.map((team) => (
                      <TeamDetailAccordion
                        key={team.team_id}
                        team={team}
                        onDataUpdate={() => setRekapVersion((v) => v + 1)}
                        eventId={activeEvent.event_id}
                      />
                    ))}
                  </Accordion>
                )}
                {!loading && displayTeams.length === 0 && (
                  <p>Tidak ada tim di event ini.</p>
                )}
              </div>
            )}

            {/* Tampilan Detail untuk Admin */}
            {isAdminView && (
              <>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Peringkat</TableHead>
                        <TableHead>Nama Tim</TableHead>
                        {rekapData.aspeks?.map((k) => (
                          <TableHead key={k} className="text-center">
                            {k}
                          </TableHead>
                        ))}
                        <TableHead className="text-center font-bold">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell
                            colSpan={rekapData.aspeks?.length + 3}
                            className="h-24 text-center"
                          >
                            Memuat data...
                          </TableCell>
                        </TableRow>
                      ) : rekapData.rekap?.length > 0 ? (
                        rekapData.rekap.map((s) => (
                          <TableRow
                            key={s.team_id}
                            onClick={() =>
                              setViewingTeamDetails(
                                rekapData.details?.[s.team_id],
                              )
                            }
                            className="cursor-pointer hover:bg-muted/50"
                          >
                            <TableCell className="text-center font-bold text-lg">
                              {s.rank}
                            </TableCell>
                            <TableCell className="font-medium">
                              <p>{s.team_name}</p>
                              <p className="text-sm text-muted-foreground font-normal">
                                {s.team_sekolah_instansi}
                              </p>
                            </TableCell>
                            {rekapData.aspeks.map((k) => (
                              <TableCell key={k} className="text-center">
                                {s.scores[k]?.toFixed(2) || "0.00"}
                              </TableCell>
                            ))}
                            <TableCell className="text-center font-semibold">
                              {s.total.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={rekapData.aspeks?.length + 3}
                            className="h-24 text-center"
                          >
                            Belum ada penilaian yang masuk.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            {/* Dialog untuk menampilkan detail penilaian per juri */}
            <Dialog
              open={!!viewingTeamDetails}
              onOpenChange={(isOpen) => !isOpen && setViewingTeamDetails(null)}
            >
              <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>
                    Detail Penilaian: {viewingTeamDetails?.[0]?.Team?.team_name}
                  </DialogTitle>
                  <DialogDescription>
                    Rincian skor yang diberikan oleh setiap juri untuk tim ini.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2 -mr-4 space-y-4">
                  {viewingTeamDetails?.length > 0 ? (
                    viewingTeamDetails.map((penilaian) => (
                      <JuriScoreCard
                        onUnlockSuccess={async (penilaianId) => {
                          try {
                            const response = await api.patch(
                              `/penilaian/unlock/${penilaianId}`,
                            );
                            toast.success(response.data.message);
                            // Perbarui state dialog secara lokal
                            setViewingTeamDetails((prev) =>
                              prev.map((p) =>
                                p.penilaian_id === penilaianId
                                  ? { ...p, is_lock: false }
                                  : p,
                              ),
                            );
                            // Memicu re-fetch data di latar belakang
                            setRekapVersion((v) => v + 1);
                          } catch (error) {
                            toast.error(
                              error.response?.data?.message ||
                                "Gagal membuka kunci.",
                            );
                          }
                        }}
                        key={penilaian.penilaian_id}
                        penilaian={penilaian}
                      />
                    ))
                  ) : (
                    <p>Detail tidak tersedia.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Pilih Event
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Pilih event untuk melihat hasil rekapitulasi nilai dan
                  klasemen akhir.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama event..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white dark:bg-gray-900 shadow-sm"
                  />
                </div>
                <div className="flex gap-2">
                  {/* Filter Tahun */}
                  <Select
                    value={filters.year || "all"}
                    onValueChange={(value) => {
                      const yearValue = value === "all" ? null : value;
                      setFilters((prev) => ({ ...prev, year: yearValue }));
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[130px] bg-white dark:bg-gray-900 shadow-sm">
                      <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tahun</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Filter Status */}
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) => {
                      const statusValue = value === "all" ? null : value;
                      setFilters((prev) => ({
                        ...prev,
                        status: statusValue,
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[150px] bg-white dark:bg-gray-900 shadow-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[340px] rounded-xl bg-muted/50 animate-pulse border"
                  />
                ))
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <Card
                    key={event.event_id}
                    className="group overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border-border/50"
                  >
                    <div className="relative h-56 w-full bg-muted/50 border-b border-border/50">
                      <Image
                        src={
                          event.event_poster
                            ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                            : "/default-poster.png"
                        }
                        alt={`Poster ${event.event_name}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) =>
                          (e.currentTarget.src = "/default-poster.png")
                        }
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none" />
                      <div className="absolute top-3 left-3 z-10 flex gap-2">
                        <Badge
                          variant={
                            event.event_status === "published"
                              ? "default"
                              : event.event_status === "draft"
                                ? "secondary"
                                : "destructive"
                          }
                          className="shadow-sm capitalize font-medium px-2.5"
                        >
                          {event.event_status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5 flex-1">
                      <h3 className="font-bold text-[17px] leading-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors text-foreground">
                        {event.event_name}
                      </h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 opacity-70 shrink-0 text-primary" />
                          <span className="truncate">
                            {format(
                              new Date(event.event_tanggal),
                              "d MMMM yyyy",
                              { locale: id },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 opacity-70 shrink-0 text-primary" />
                          <span className="truncate">{event.event_tempat}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-5 pt-0">
                      <Button
                        className="w-full shadow-sm group-hover:bg-primary/90 transition-colors"
                        onClick={() => setActiveEvent(event)}
                      >
                        {isAdminView ? "Lihat Rekap Nilai" : "Mulai Penilaian"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-muted/20 border-dashed">
                  <Frown className="h-14 w-14 mb-4 text-muted-foreground/40" />
                  <p className="text-xl font-semibold text-foreground">
                    Event Tidak Ditemukan
                  </p>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    Tidak ada event yang cocok dengan kata kunci atau filter
                    pencarian Anda saat ini. Silakan coba kata kunci lain.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
};

export default RekapNilaiPage;
