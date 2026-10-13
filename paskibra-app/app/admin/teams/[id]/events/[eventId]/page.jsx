"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/service/api";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useReactToPrint } from "react-to-print";
import CertificateLayout from "@/components/shared/CertificateLayout";
import { Input } from "@/components/ui/input";
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
  Users,
  Loader2,
  Lock,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const getKejuaraanTitle = (rank, templateStr) => {
  const defaultTemplate = [
    { name: "UTAMA", numbered: true },
    { name: "HARAPAN UTAMA", numbered: true },
    { name: "MADYA", numbered: true },
    { name: "HARAPAN MADYA", numbered: true },
    { name: "BINA", numbered: true },
    { name: "HARAPAN BINA", numbered: true },
    { name: "MULA", numbered: true },
    { name: "HARAPAN MULA", numbered: true },
    { name: "PURWA", numbered: true },
    { name: "HARAPAN PURWA", numbered: true },
    { name: "CARAKA", numbered: true },
    { name: "POTENSIAL", numbered: false },
  ];

  let activeTemplate = defaultTemplate;

  if (templateStr) {
    try {
      const parsed =
        typeof templateStr === "string" ? JSON.parse(templateStr) : templateStr;
      if (Array.isArray(parsed) && parsed.length > 0) {
        activeTemplate = parsed.map((item) =>
          typeof item === "string" ? { name: item, numbered: true } : item,
        );
      }
    } catch (e) {
      console.error("Gagal mem-parsing kejuaraan_template", e);
    }
  }

  const blockIndex = Math.floor((rank - 1) / 3);
  if (blockIndex < activeTemplate.length) {
    const templateItem = activeTemplate[blockIndex];
    if (templateItem.numbered) {
      return `${templateItem.name} ${((rank - 1) % 3) + 1}`;
    } else {
      return templateItem.name;
    }
  } else if (activeTemplate.length > 0) {
    const lastItem = activeTemplate[activeTemplate.length - 1];
    if (!lastItem.numbered) {
      return lastItem.name;
    }
  }
  return "-";
};

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

  const [members, setMembers] = useState([]);
  const [teamAwards, setTeamAwards] = useState([]);
  const [teamPredikat, setTeamPredikat] = useState("PESERTA");
  const [klasemenLoaded, setKlasemenLoaded] = useState(false);
  const [certData, setCertData] = useState([]);
  const [isReadyToPrint, setIsReadyToPrint] = useState(false);
  const [printDocTitle, setPrintDocTitle] = useState("");

  const printCertificateRef = useRef();
  const handlePrintCertificate = useReactToPrint({
    contentRef: printCertificateRef,
    documentTitle: printDocTitle || `Sertifikat_${eventData?.event_name?.replace(/\s+/g, "_") || "Event"}`,
    onAfterPrint: () => {
      setCertData([]);
      setIsReadyToPrint(false);
    }
  });

  useEffect(() => {
    if (isReadyToPrint && certData.length > 0) {
      handlePrintCertificate();
      setIsReadyToPrint(false);
    }
  }, [isReadyToPrint, certData, handlePrintCertificate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Ambil data Tim, Event, dan Penilaian secara paralel
      const [teamRes, eventRes, scoreRes, membersRes] = await Promise.all([
        api.get(`/teams/${teamId}`),
        api.get(`/events/${eventId}`),
        api
          .get(`/penilaian/detail/${eventId}/${teamId}`)
          .catch(() => ({ data: {} })),
        api
          .get(`/anggota/team/${teamId}`)
          .catch(() => ({ data: { anggota: [] } })),
      ]);

      const fetchedTeam = teamRes.data.team;
      setTeam(fetchedTeam);
      const fetchedEvent = eventRes.data.event;
      setEventData(fetchedEvent);

      const fetchedMembers = membersRes.data?.anggota || membersRes.data || [];
      setMembers(fetchedMembers);

      // Filter relasi spesifik dari event ini
      const etData = fetchedTeam.Event_teams?.find(
        (et) => et.event_id === eventId,
      );
      setEventTeamData(etData);

      if (scoreRes.data) {
        setScoreSummary(scoreRes.data.summary);
        setScoreDetails(scoreRes.data.details || []);
      }

      // Ambil data klasemen untuk predikat
      try {
        const kategoriRes = await api.get(`/rekap/kategori/${eventId}`);
        const categories = kategoriRes.data.data || [];
        const awards = [];
        let overallRank = null;

        await Promise.all(
          categories.map(async (kat) => {
            try {
              const res = await api.get(`/rekap/klasemen/${kat.id}`);
              const klasemen = res.data.klasemen || [];
              
              const limitJuara = kat.limit_juara
                ? parseInt(kat.limit_juara, 10)
                : null;
              const isJuaraUmum =
                kat.jenis_juara === "juara_umum" || kat.is_juara_umum;
              const isJuaraPeringkat =
                kat.jenis_juara === "juara_peringkat" ||
                kat.tipe_penilaian === "global";
              const isJuaraUmumOrGlobal = isJuaraUmum || isJuaraPeringkat;

              klasemen.forEach((item, idx) => {
                const itemTeamId = item.team_id || item.Team?.team_id;
                if (itemTeamId !== teamId) return;

                const rank = idx + 1;
                if (isJuaraUmumOrGlobal) {
                  overallRank = rank;
                }

                if (limitJuara && rank > limitJuara) return;

                let title = "";
                if (isJuaraUmum) {
                  if (rank === 1) {
                    title = "JUARA UMUM";
                  } else {
                    return;
                  }
                } else if (isJuaraPeringkat) {
                  title = getKejuaraanTitle(
                    rank,
                    fetchedEvent.kejuaraan_template,
                  );
                } else {
                  title = `${kat.nama_kategori} Terbaik ${rank}`;
                }
                awards.push({
                  categoryName: kat.nama_kategori,
                  title: title,
                  isJuaraUmumOrGlobal: isJuaraUmumOrGlobal,
                });
              });
            } catch (e) {
              console.error("Gagal memuat klasemen untuk kategori " + kat.id, e);
            }
          })
        );

        setTeamAwards(awards);
        setKlasemenLoaded(true);

        const mainAward = awards.find(a => a.isJuaraUmumOrGlobal) ||
          awards.find(a => 
            a.categoryName.toLowerCase().includes("umum") || 
            a.categoryName.toLowerCase().includes("global") || 
            a.categoryName.toLowerCase().includes("utama")
          ) || awards[0];

        const hasAward = mainAward && mainAward.title && !mainAward.title.startsWith("-");

        if (hasAward) {
          setTeamPredikat(mainAward.title);
        } else if (overallRank) {
          setTeamPredikat(`PERINGKAT ${overallRank}`);
        } else {
          setTeamPredikat("PESERTA");
        }
      } catch (error) {
        console.error("Gagal mengambil data klasemen untuk sertifikat:", error);
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
      toast.success(res.data.message || "Poin berhasil disinkronisasi.");
      fetchData(); // Muat ulang data poin
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyinkronkan poin.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Memuat data event...
        </p>
      </div>
    );
  }
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
        {/* Accordion untuk Foto Keseluruhan Tim */}
        <div className="mb-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem
              value="foto-tim"
              className="border rounded-xl bg-card shadow-sm px-4"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Users className="h-5 w-5" />
                  Lihat Foto Keseluruhan Tim
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6">
                {team.foto_all_team ? (
                  <div className="w-full overflow-hidden rounded-lg border bg-muted/10 shadow-inner flex justify-center p-2">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}${team.foto_all_team}`}
                      alt="Foto Tim Keseluruhan"
                      width={1200}
                      height={600}
                      className="w-full max-w-4xl h-auto object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-lg border border-dashed">
                    <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground font-medium">
                      Belum ada foto keseluruhan tim
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KIRI: Informasi Event & E-Voting */}
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
                      : new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(eventData.event_biaya_pendaftaran)}
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
                  <Heart className="h-5 w-5" /> Dukungan E-Voting
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-center space-y-4">
                {eventData?.xenplatform_id ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Poin Terkumpul
                    </p>
                    <h3 className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                      {(
                        Math.floor(Number(eventTeamData.balance) / 1000) || 0
                      ).toLocaleString("id-ID")}{" "}
                      Poin
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
                        {isSyncing ? "Menyinkronkan..." : "Sync Poin Terbaru"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-4 space-y-2">
                    <Badge variant="secondary">Tidak Aktif</Badge>
                    <p className="text-sm text-muted-foreground">
                      Tim ini belum diaktifkan untuk menerima e-voting pada
                      event ini.
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
                    Nilai Akhir: {parseInt(scoreSummary.nilai_akhir, 10)}
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
                                {parseInt(detail.total_nilai, 10)}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4 text-muted-foreground">
                          {detail.AspekNilais?.map((aspek) => (
                            <div key={aspek.id} className="mb-4">
                              {/* Mengambil nama aspek dari nested object 'Aspek' */}
                              <h3 className="font-semibold text-foreground mb-2">
                                {aspek.Aspek?.nama_aspek}
                              </h3>

                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Sub-Aspek</TableHead>
                                    <TableHead className="text-center">
                                      Nilai Diberikan
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {/* Iterasi melalui SubAspekNilais */}
                                  {aspek.SubAspekNilais?.map((sub) => (
                                    <TableRow key={sub.id}>
                                      {/* Nama sub-aspek ada di dalam nested object 'SubAspek' */}
                                      <TableCell>
                                        {sub.SubAspek?.nama_subaspek}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {sub.nilai || "0"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ))}
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

        {/* Section E-Sertifikat */}
        {(() => {
          const isLocked = !eventData?.is_result_show && eventData?.event_status !== "archived";
          return (
            <Card className="shadow-sm border-border/50 overflow-hidden mt-6">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b pb-4 pt-5">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  E-Sertifikat Event
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLocked ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-muted rounded-xl bg-muted/5 max-w-xl mx-auto">
                    <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full mb-4">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Pencetakan Sertifikat Terkunci</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      E-Sertifikat tim dan anggota baru dapat dicetak setelah hasil klasemen resmi dipublikasikan atau setelah status event diubah menjadi Archived.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Cetak Sertifikat Tim */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl bg-muted/10 gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-foreground">Sertifikat Tim: {team.team_name}</h3>
                        <p className="text-sm text-muted-foreground">Cetak sertifikat keikutsertaan/penghargaan atas nama tim.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-sm sm:text-right bg-muted/40 px-3 py-1.5 border rounded-lg">
                          <span className="text-xs text-muted-foreground block">Predikat Sertifikat:</span>
                          <span className="font-bold text-foreground">
                            {teamPredikat || "PESERTA"}
                          </span>
                        </div>
                        <Button
                          onClick={() => {
                            setPrintDocTitle(`Sertifikat_${team.team_name?.replace(/\s+/g, "_")}`);
                            const cert = {
                              recipientName: team.team_name,
                              instansiName: team.team_sekolah_instansi,
                              predikat: teamPredikat || "PESERTA",
                              certificateNo: `SERT/${eventData.event_id}/${team.team_id}`,
                            };
                            setCertData([cert]);
                            setIsReadyToPrint(true);
                          }}
                          className="w-full sm:w-auto"
                        >
                          Cetak Sertifikat Tim
                        </Button>
                      </div>
                    </div>

                    {/* Cetak Sertifikat Anggota */}
                    <div className="border rounded-xl p-4 bg-background space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-base text-foreground">Sertifikat Anggota Tim</h3>
                          <p className="text-sm text-muted-foreground">Cetak sertifikat individu untuk tiap anggota pasukan, danton, atau pelatih.</p>
                        </div>
                        {members.length > 0 && (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setPrintDocTitle(`Sertifikat_Massal_${team.team_name?.replace(/\s+/g, "_")}`);
                              const certs = members.map((m) => ({
                                recipientName: m.anggota_nama,
                                instansiName: team.team_sekolah_instansi,
                                predikat: teamPredikat || "PESERTA",
                                certificateNo: `SERT/${eventData.event_id}/${m.anggota_id}`,
                              }));
                              setCertData(certs);
                              setIsReadyToPrint(true);
                            }}
                            className="w-full sm:w-auto"
                          >
                            Cetak Semua Anggota ({members.length})
                          </Button>
                        )}
                      </div>

                      <Separator />

                      {members.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {members.map((member) => (
                            <div
                              key={member.anggota_id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                            >
                              <div className="overflow-hidden mr-2">
                                <p className="font-bold text-sm text-foreground truncate" title={member.anggota_nama}>
                                  {member.anggota_nama}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {member.anggota_tipe || "Anggota"}
                                </p>
                              </div>
                              <Button
                                size="xs"
                                variant="ghost"
                                className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer shrink-0"
                                onClick={() => {
                                  setPrintDocTitle(`Sertifikat_${member.anggota_nama?.replace(/\s+/g, "_")}`);
                                  const cert = {
                                    recipientName: member.anggota_nama,
                                    instansiName: team.team_sekolah_instansi,
                                    predikat: teamPredikat || "PESERTA",
                                    certificateNo: `SERT/${eventData.event_id}/${member.anggota_id}`,
                                  };
                                  setCertData([cert]);
                                  setIsReadyToPrint(true);
                                }}
                              >
                                Cetak
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-center text-muted-foreground py-6">
                          Belum ada anggota terdaftar untuk tim ini.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}
      </main>
      <CertificateLayout ref={printCertificateRef} certificates={certData} event={eventData} />
    </ProtectedRoute>
  );
}
