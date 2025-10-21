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
} from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
            ))
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
        `/penilaian/detail/${eventId}/${team.team_id}`
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
          p.penilaian_id === penilaianId ? { ...p, is_lock: false } : p
        )
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
  const [selectedEvent, setSelectedEvent] = useState("");
  const [activeEvent, setActiveEvent] = useState(null); // Untuk view Juri
  const [rekapData, setRekapData] = useState({
    isSpecialView: false,
    rekap: [],
    aspeks: [],
    teams: [],
  });
  const [viewingTeamDetails, setViewingTeamDetails] = useState(null); // State untuk dialog detail
  const [rekapVersion, setRekapVersion] = useState(0); // Untuk memicu re-fetch
  const [loading, setLoading] = useState(true);

  // Redirect jika role adalah koordinator
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
      if (
        eventList.length > 0 &&
        ["admin", "superadmin"].includes(user?.role)
      ) {
        setSelectedEvent(eventList[0].event_id);
      }
    } catch (error) {
      toast.error("Gagal memuat daftar event.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Fetch data rekap berdasarkan event yang dipilih (untuk admin/superadmin)
  useEffect(() => {
    if (!selectedEvent || user?.role === "juri") {
      setLoading(false);
      return;
    }

    const fetchRekap = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/rekap/${selectedEvent}`);
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
  }, [selectedEvent, user?.role, rekapVersion]);

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

  // Tentukan view berdasarkan role
  const isJuriView = user?.role === "juri";
  const isAdminView = ["admin", "superadmin"].includes(user?.role);
  // Buat daftar tim yang akan ditampilkan, baik dari `teams` (untuk juri)
  // maupun dari `rekap` (untuk admin/superadmin)
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
        {/* Tampilan untuk Juri */}
        {isJuriView && (
          <>
            {activeEvent ? (
              // Tampilan Detail Event (Daftar Tim dengan Accordion)
              <div>
                <Button
                  variant="outline"
                  onClick={() => setActiveEvent(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Event
                </Button>
                <h1 className="text-2xl font-semibold mb-2">
                  Daftar Tim: {activeEvent.event_name}
                </h1>
                {loading ? (
                  <p>Memuat daftar tim...</p>
                ) : displayTeams.length > 0 ? (
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
                ) : (
                  <p>Tidak ada tim di event ini.</p>
                )}
              </div>
            ) : (
              // Tampilan Daftar Event
              <>
                <h1 className="text-2xl font-semibold">Pilih Event</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.length > 0 ? (
                    events.map((event) => (
                      <Card key={event.event_id} className="flex flex-col">
                        <CardHeader>
                          <CardTitle>{event.event_name}</CardTitle>
                          <CardDescription>
                            {format(
                              new Date(event.event_tanggal),
                              "d MMMM yyyy",
                              { locale: id }
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto">
                          <Button
                            className="w-full"
                            onClick={() => setActiveEvent(event)}
                          >
                            Lihat Tim <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <p>Anda tidak ditugaskan pada event manapun.</p>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Tampilan untuk Admin & Superadmin */}
        {isAdminView && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Rekapitulasi Peringkat</h1>
              <div className="w-full max-w-xs">
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.event_id} value={event.event_id}>
                        {event.event_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                          setViewingTeamDetails(rekapData.details?.[s.team_id])
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
                              `/penilaian/unlock/${penilaianId}`
                            );
                            toast.success(response.data.message);
                            // Perbarui state dialog secara lokal
                            setViewingTeamDetails((prev) =>
                              prev.map((p) =>
                                p.penilaian_id === penilaianId
                                  ? { ...p, is_lock: false }
                                  : p
                              )
                            );
                            // Memicu re-fetch data di latar belakang
                            setRekapVersion((v) => v + 1);
                          } catch (error) {
                            toast.error(
                              error.response?.data?.message ||
                                "Gagal membuka kunci."
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
        )}
      </main>
    </ProtectedRoute>
  );
};

export default RekapNilaiPage;
