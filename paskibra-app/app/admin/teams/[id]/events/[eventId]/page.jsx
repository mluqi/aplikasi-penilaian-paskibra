"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/service/api";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  RefreshCcw,
  Calendar,
  MapPin,
  Trophy,
  Heart,
  ArrowLeft,
  Award,
  User,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TeamEventDetailPage() {
  const { id: teamId, eventId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [eventTeamData, setEventTeamData] = useState(null);
  const [scoreSummary, setScoreSummary] = useState(null);
  const [scoreDetails, setScoreDetails] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Ambil data Tim, Event, dan Penilaian secara paralel
      const [teamRes, eventRes, scoreRes] = await Promise.all([
        api.get(`/teams/${teamId}`),
        api.get(`/events/${eventId}`),
        api
          .get(`/penilaian/detail/${eventId}/${teamId}`)
          .catch(() => ({ data: {} })),
      ]);

      const fetchedTeam = teamRes.data.team;
      setTeam(fetchedTeam);
      setEventData(eventRes.data.event);

      // Filter relasi spesifik dari event ini
      const etData = fetchedTeam.Event_teams?.find(
        (et) => et.event_id === eventId,
      );
      setEventTeamData(etData);

      if (scoreRes.data) {
        setScoreSummary(scoreRes.data.summary);
        setScoreDetails(scoreRes.data.details || []);
      }
    } catch (error) {
      toast.error("Gagal memuat detail event untuk tim ini.");
    } finally {
      setLoading(false);
    }
  }, [teamId, eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSyncBalance = async () => {
    setIsSyncing(true);
    try {
      const res = await api.post("/events/team/sync-balance", {
        event_id: eventId,
        team_id: teamId,
      });
      toast.success(res.data.message || "Saldo berhasil disinkronisasi.");
      fetchData(); // Muat ulang data saldo
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menyinkronkan saldo.",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;
  if (!team || !eventData)
    return (
      <div className="p-8 text-center text-red-500">Data tidak ditemukan.</div>
    );

  return (
    <ProtectedRoute requiredAccess="manage_teams">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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
                <BreadcrumbLink href="/admin/teams">
                  Manajemen Tim
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/admin/teams/${teamId}`}>
                  {team.team_name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detail Event</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full">
        {/* Navigasi Kembali */}
        <div>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
        {/* Hero Banner Area */}
        <div className="relative mb-12">
          <div className="h-48 md:h-64 w-full relative rounded-2xl overflow-hidden border">
            <Image
              src={
                eventData.event_poster
                  ? `${process.env.NEXT_PUBLIC_API_URL}${eventData.event_poster}`
                  : "/default-poster.png"
              }
              alt="Event Poster"
              layout="fill"
              objectFit="cover"
              className="brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute top-4 right-4">
              <Badge className="bg-primary/90 text-white shadow-lg text-sm px-3 py-1 backdrop-blur-sm border-none">
                {eventData.event_status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Overlay Detail Tim di atas Banner */}
          <div className="absolute bottom-0 left-6 md:left-10 translate-y-1/3 flex items-end gap-5">
            <div className="bg-background p-2 rounded-full shadow-xl border-4 border-muted">
              <Image
                src={
                  team.team_logo
                    ? `${process.env.NEXT_PUBLIC_API_URL}${team.team_logo}`
                    : "/default-logo.png"
                }
                alt="Team Logo"
                width={100}
                height={100}
                className="rounded-full object-contain bg-white h-[100px] w-[100px]"
              />
            </div>
            <div className="mb-2 text-white">
              <h1 className="text-2xl md:text-3xl font-extrabold drop-shadow-md leading-tight">
                {team.team_name}
              </h1>
              <p className="text-gray-200 font-medium drop-shadow-md flex items-center gap-2">
                {team.team_sekolah_instansi}
              </p>
            </div>
          </div>
        </div>
        <div className="h-8"></div> {/* Spacer for translated logo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KIRI: Informasi Event & Donasi */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader className="bg-muted/40 pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Info Event
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Nama Event
                  </p>
                  <p className="font-semibold text-foreground">
                    {eventData.event_name}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Tanggal Pelaksanaan
                  </p>
                  <p className="flex items-center gap-2 text-foreground font-medium mt-1">
                    {format(new Date(eventData.event_tanggal), "d MMMM yyyy", {
                      locale: localeId,
                    })}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Biaya Pendaftaran
                  </p>
                  <p className="flex items-center gap-2 text-foreground font-medium mt-1">
                    {eventData.event_biaya_pendaftaran === 0
                      ? "Gratis"
                      : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(eventData.event_biaya_pendaftaran)}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Lokasi
                  </p>
                  <p className="flex items-center gap-2 text-foreground font-medium mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />{" "}
                    {eventData.event_tempat}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    {eventData.event_kota}, {eventData.event_provinsi}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-pink-100 dark:border-pink-900 overflow-hidden">
              <CardHeader className="bg-pink-50 dark:bg-pink-900/20 pb-4 border-b border-pink-100 dark:border-pink-900">
                <CardTitle className="text-lg flex items-center gap-2 text-pink-600 dark:text-pink-400">
                  <Heart className="h-5 w-5" /> Dukungan Donasi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-center space-y-4">
                {eventTeamData?.xenplatform_id ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Saldo Terkumpul
                    </p>
                    <h3 className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                      Rp{" "}
                      {(Number(eventTeamData.balance) || 0).toLocaleString(
                        "id-ID",
                      )}
                    </h3>
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleSyncBalance}
                        disabled={isSyncing}
                      >
                        <RefreshCcw
                          className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
                        />
                        {isSyncing ? "Menyinkronkan..." : "Sync Saldo Terbaru"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-4 space-y-2">
                    <Badge variant="secondary">Tidak Aktif</Badge>
                    <p className="text-sm text-muted-foreground">
                      Tim ini belum diaktifkan untuk menerima donasi pada event
                      ini.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* KANAN: Hasil Rekapitulasi */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="shadow-sm h-full flex flex-col">
              <CardHeader className="bg-muted/40 pb-4 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" /> Hasil Penilaian
                </CardTitle>
                {scoreSummary && (
                  <Badge
                    className="text-sm font-bold px-3 py-1"
                    variant="default"
                  >
                    Nilai Akhir: {scoreSummary.nilai_akhir}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-6 flex-1">
                {scoreDetails.length > 0 ? (
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-3"
                  >
                    {scoreDetails.map((detail, idx) => (
                      <AccordionItem
                        value={`item-${idx}`}
                        key={detail.penilaian_id}
                        className="border rounded-lg px-4 bg-card shadow-sm"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-semibold text-left">
                                {detail.User?.user_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-normal">
                                Total Nilai:
                              </span>
                              <span className="font-bold text-lg">
                                {detail.total_nilai}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4 text-muted-foreground">
                          {detail.catatan ? (
                            <blockquote className="border-l-4 border-primary pl-4 italic bg-muted/30 p-3 rounded-r-lg mb-4">
                              "{detail.catatan}"
                            </blockquote>
                          ) : (
                            <p className="text-sm italic mb-4">
                              Juri tidak memberikan catatan.
                            </p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                    <Award className="h-12 w-12 mb-3 text-muted-foreground/30" />
                    <p>
                      Belum ada nilai yang diinputkan oleh juri untuk tim ini.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
