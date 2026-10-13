"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/service/api";
import {
  Trophy,
  Award,
  Medal,
  Crown,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Printer,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import PDFLayoutKlasemenRefactored from "@/components/shared/PDFLayoutKlasemen";
import PDFLayoutEVoting from "@/components/shared/PDFLayoutEVoting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    // Jika rank melebihi jumlah block template, cek template terakhir
    const lastItem = activeTemplate[activeTemplate.length - 1];
    if (!lastItem.numbered) {
      return lastItem.name; // Jadikan catch-all untuk sisa seluruh peringkat
    }
  }
  return "-";
};

const getRankIcon = (index) => {
  switch (index) {
    case 0:
      return <Crown className="h-6 w-6 text-yellow-400" />;
    case 1:
      return <Medal className="h-6 w-6 text-slate-400" />;
    case 2:
      return <Award className="h-6 w-6 text-amber-600" />;
    default:
      return null;
  }
};

const getRankBadgeColor = (index) => {
  switch (index) {
    case 0:
      return "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg shadow-yellow-400/30";
    case 1:
      return "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 shadow-lg shadow-slate-400/30";
    case 2:
      return "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30";
    default:
      return "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
  }
};

export default function AdminPreviewLeaderboardPage() {
  const { id: eventId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const [kategoriRekap, setKategoriRekap] = useState({
    klasemen: [],
    aspeks: [],
    kurangi_penalty: false,
  });
  const [eVotingRekap, setEVotingRekap] = useState([]);
  const [allKategoriRekap, setAllKategoriRekap] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);

  const printRef = useRef();
  const handlePrintKlasemen = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Hasil_Klasemen_${event?.event_name || "Event"}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  });

  const printEVotingRef = useRef();
  const handlePrintEVoting = useReactToPrint({
    contentRef: printEVotingRef,
    documentTitle: `Hasil_EVoting_${event?.event_name || "Event"}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  });

  const handlePrint = () => {
    if (activeTab === "e-voting") {
      handlePrintEVoting();
    } else {
      handlePrintKlasemen();
    }
  };

  const nomorTampilMap = useMemo(() => {
    if (!event?.Event_teams) return new Map();
    return new Map(
      event.Event_teams.map((et) => [
        et.team_id || et.Team?.team_id,
        et.nomor_tampil,
      ]),
    );
  }, [event]);

  const judgeWinners = useMemo(() => {
    if (!kategoriList.length || !event?.Event_teams) return {};

    const teamNameMap = new Map(
      event.Event_teams.map((et) => [
        et.team_id || et.Team?.team_id,
        et.Team?.team_name || et.team_name || "-",
      ]),
    );

    return kategoriList.reduce((acc, kategori) => {
      if (
        kategori.tipe_penilaian !== "lainnya" ||
        !Array.isArray(kategori.aspek_id)
      ) {
        return acc;
      }

      const winners = kategori.aspek_id
        .filter((winner) => winner && (winner.team_id || winner.Team?.team_id))
        .map((winner, idx) => {
          const teamId = winner.team_id || winner.Team?.team_id;
          return {
            rank: idx + 1,
            award: `JUARA ${idx + 1}`,
            nilai: winner.nilai_akhir ?? winner.total ?? winner.nilai ?? 0,
            nomorTampil: nomorTampilMap.get(teamId)
              ? String(nomorTampilMap.get(teamId)).padStart(2, "0")
              : "-",
            teamName: teamNameMap.get(teamId) || winner.team_name || "-",
          };
        });

      if (winners.length > 0) {
        acc[kategori.nama_kategori || `Kategori ${kategori.id}`] = winners;
      }
      return acc;
    }, {});
  }, [kategoriList, event?.Event_teams, nomorTampilMap]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [eventRes, kategoriRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/rekap/kategori/${eventId}`),
        ]);

        if (eventRes.data.event) setEvent(eventRes.data.event);
        if (kategoriRes.data.data && kategoriRes.data.data.length > 0) {
          const sortedKategori = [...kategoriRes.data.data].sort(
            (a, b) => (a.urutan || 0) - (b.urutan || 0),
          );
          setKategoriList(sortedKategori);
          handleTabChange(sortedKategori[0].id);
        } else if (eventRes.data.event?.xenplatform_id) {
          handleTabChange("e-voting");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Gagal memuat data klasemen preview:", error);
      }
    };

    if (eventId) fetchInitialData();
  }, [eventId]);

  useEffect(() => {
    if (!kategoriList.length) return;

    const fetchAllKategoriRekap = async () => {
      try {
        const responses = await Promise.allSettled(
          kategoriList.map(async (kategori) => {
            const res = await api.get(`/rekap/klasemen/${kategori.id}`);
            return {
              id: kategori.id,
              nama_kategori: kategori.nama_kategori,
              ...res.data,
            };
          }),
        );

        const valid = responses
          .filter((resp) => resp.status === "fulfilled" && resp.value?.klasemen)
          .map((resp) => resp.value);

        setAllKategoriRekap(valid);
      } catch (error) {
        console.error("Gagal memuat semua klasemen kategori:", error);
      }
    };

    fetchAllKategoriRekap();
  }, [kategoriList]);

  const handleTabChange = async (tabId) => {
    setActiveTab(tabId);
    setLoadingTab(true);

    try {
      if (tabId === "e-voting") {
        const res = await api.get(`/rekap/public/${eventId}?type=evoting`);
        if (res.data.donasi) {
          setEVotingRekap(res.data.donasi);
          setKategoriRekap({
            klasemen: [],
            aspeks: [],
            kurangi_penalty: false,
          });
        }
      } else {
        const res = await api.get(`/rekap/klasemen/${tabId}`);
        if (res.data.klasemen) {
          const katObj = kategoriList.find((k) => k.id === tabId);
          setKategoriRekap({
            klasemen: res.data.klasemen,
            aspeks: res.data.aspeks || [],
            kurangi_penalty: res.data.kurangi_penalty || false,
            limit_juara:
              res.data.limit_juara !== undefined
                ? res.data.limit_juara
                : katObj?.limit_juara ?? null,
          });
          setEVotingRekap([]);
        }
      }
    } catch (error) {
      console.error("Gagal memuat kategori preview:", error);
    } finally {
      setLoadingTab(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Menyiapkan Preview Klasemen...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Event Tidak Ditemukan</h1>
        <Button asChild className="mt-4">
          <Link href={`/admin/events/${eventId}`}>Kembali ke Detail Event</Link>
        </Button>
      </div>
    );
  }

  const allTabs = [...kategoriList];
  if (event?.xenplatform_id) {
    allTabs.push({
      id: "e-voting",
      nama_kategori: "E-Voting",
      is_juara_umum: false,
    });
  }

  const isEvoting = activeTab === "e-voting";
  const activeKategoriObj = kategoriList.find((k) => k.id === activeTab);
  const isJuaraUmum =
    activeKategoriObj?.jenis_juara === "juara_umum" ||
    activeKategoriObj?.is_juara_umum;
  const juaraUmum =
    isJuaraUmum && kategoriRekap.klasemen.length > 0
      ? kategoriRekap.klasemen[0]
      : null;
  const juaraUmumTeamName = juaraUmum
    ? juaraUmum.team_name || juaraUmum.Team?.team_name || ""
    : "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Admin Preview Banner */}
      <div className="bg-amber-500 text-amber-950 py-2 px-4 flex items-center justify-center gap-2 font-bold text-sm tracking-widest uppercase shadow-sm">
        <AlertCircle className="w-4 h-4" /> MODE PREVIEW PANITIA - Anda melihat
        data sebelum dipublikasikan
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-8 lg:pt-16 lg:pb-12">
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium mb-6">
              <Trophy className="h-4 w-4" />
              Hasil Akhir
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
              {event.event_name}
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Navigasi Kategori */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-full shadow-sm bg-white hover:bg-gray-100"
              >
                <Link href={`/admin/events/${eventId}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Kelola Event
                </Link>
              </Button>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {allTabs.map((kat) => (
                  <Button
                    key={kat.id}
                    onClick={() => handleTabChange(kat.id)}
                    variant={activeTab === kat.id ? "default" : "outline"}
                    className={`rounded-full transition-all text-xs font-semibold ${
                      activeTab === kat.id
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-md border-red-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {kat.id === "e-voting" ? (
                      <Heart className="w-3.5 h-3.5 mr-1.5 text-pink-500" />
                    ) : kat.jenis_juara === "juara_umum" || kat.is_juara_umum ? (
                      <Trophy className="w-3.5 h-3.5 mr-1.5" />
                    ) : (
                      <Medal className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    {kat.nama_kategori.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* KLASEMEN PENILAIAN */}
            <div>
              {/* Komponen PDF Tersembunyi Klasemen */}
              <div className="hidden print:block print:fixed print:inset-0 print:z-[99999] print:bg-white print:p-0 print:m-0">
                <PDFLayoutKlasemenRefactored
                  ref={printRef}
                  event={event}
                  klasemenData={kategoriRekap.klasemen}
                  aspekHeaders={kategoriRekap.aspeks}
                  kategoriName={activeKategoriObj?.nama_kategori || "KLASEMEN"}
                  tipePenilaian={
                    kategoriRekap.tipe_penilaian ||
                    activeKategoriObj?.tipe_penilaian
                  }
                  jenisJuara={
                    kategoriRekap.jenis_juara ||
                    activeKategoriObj?.jenis_juara
                  }
                  isJuaraUmumProp={isJuaraUmum}
                  showPenalty={kategoriRekap.kurangi_penalty}
                  nomorTampilMap={nomorTampilMap}
                  allCategoryKlasemen={allKategoriRekap}
                  limitJuara={kategoriRekap.limit_juara}
                />
              </div>

              {/* Komponen PDF Tersembunyi E-Voting */}
              {event?.xenplatform_id && (
                <div className="hidden print:block print:fixed print:inset-0 print:z-[99999] print:bg-white print:p-0 print:m-0">
                  <PDFLayoutEVoting ref={printEVotingRef} event={event} />
                </div>
              )}

              {/* Card Juara Umum di Bagian Atas Tabel */}
              {isJuaraUmum && juaraUmum && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-6 text-white shadow-lg shadow-yellow-500/20 md:p-8 mb-6">
                  <Trophy className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-white/10" />
                  <div className="relative flex items-center gap-4">
                    {juaraUmum.Team?.team_logo || juaraUmum.team_logo ? (
                      <div className="relative flex-shrink-0">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${juaraUmum.Team?.team_logo || juaraUmum.team_logo}`}
                          alt={juaraUmumTeamName}
                          width={64}
                          height={64}
                          className="rounded-full bg-white object-cover ring-4 ring-white/30 shadow-md"
                        />
                      </div>
                    ) : (
                      <div className="rounded-full bg-white/20 p-3 backdrop-blur">
                        <Trophy className="h-8 w-8 md:h-10 md:w-10 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-yellow-50">
                        Juara Umum
                      </p>
                      <p className="text-xl font-black md:text-3xl">
                        {juaraUmumTeamName}
                      </p>
                      {(juaraUmum.Team?.team_sekolah_instansi ||
                        juaraUmum.team_sekolah_instansi) && (
                        <p className="text-sm text-yellow-50/90">
                          {juaraUmum.Team?.team_sekolah_instansi ||
                            juaraUmum.team_sekolah_instansi}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Card className="overflow-hidden border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800/50 backdrop-blur">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-700 pb-6 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                      <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      {isEvoting
                        ? "Preview Klasemen E-Voting"
                        : `Preview Klasemen ${isJuaraUmum ? "Utama" : ""} ${
                            activeKategoriObj
                              ? `- ${activeKategoriObj.nama_kategori}`
                              : ""
                          }`}
                    </div>
                  </CardTitle>
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="shadow-sm bg-white dark:bg-gray-800 shrink-0"
                  >
                    <Printer className="w-4 h-4 mr-2" /> Cetak PDF
                  </Button>
                </CardHeader>

                <CardContent className="p-0">
                  {loadingTab ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    </div>
                  ) : isEvoting ? (
                    <div className="w-full overflow-x-auto pb-1">
                      <Table className="w-full text-sm min-w-[600px] md:min-w-full">
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <TableHead className="w-16 text-center font-bold text-gray-900 dark:text-gray-100">
                              NO.
                            </TableHead>
                            <TableHead className="text-center font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              NO TAMPIL
                            </TableHead>
                            <TableHead className="font-bold text-gray-900 dark:text-gray-100 min-w-[200px]">
                              NAMA SEKOLAH / TIM
                            </TableHead>
                            <TableHead className="text-center font-bold text-gray-900 dark:text-gray-100">
                              TOTAL POIN (E-VOTING)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {eVotingRekap.length > 0 ? (
                            eVotingRekap.map((item, index) => {
                              const teamName =
                                item.Team?.team_name || item.team_name || "-";
                              const teamLogo =
                                item.Team?.team_logo || item.team_logo;
                              const teamSekolah =
                                item.Team?.team_sekolah_instansi ||
                                item.team_sekolah_instansi ||
                                "-";
                              const points = Math.floor(
                                (Number(item.balance) || 0) / 1000,
                              );
                              const nomorTampil =
                                item.nomor_tampil !== undefined &&
                                item.nomor_tampil !== null
                                  ? item.nomor_tampil
                                  : nomorTampilMap.get(
                                      item.team_id ||
                                        item.id ||
                                        item.Team?.team_id,
                                    );
                              const displayNomor = nomorTampil
                                ? String(nomorTampil).padStart(2, "0")
                                : "-";

                              return (
                                <TableRow
                                  key={
                                    item.team_id ||
                                    item.id ||
                                    item.Team?.team_id ||
                                    index
                                  }
                                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                                    index < 3
                                      ? "bg-gradient-to-r from-yellow-50/50 via-transparent to-transparent dark:from-yellow-900/10"
                                      : ""
                                  }`}
                                >
                                  <TableCell className="text-center py-4 bg-gray-50/50 dark:bg-gray-800/30">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getRankBadgeColor(index)}`}
                                      >
                                        {index + 1}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center font-mono font-bold text-base text-gray-700 dark:text-gray-300">
                                    {displayNomor}
                                  </TableCell>
                                  <TableCell className="font-bold text-gray-800 dark:text-gray-200">
                                    <div className="flex items-center gap-3 py-1">
                                      {teamLogo && (
                                        <div className="relative flex-shrink-0">
                                          <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}${teamLogo}`}
                                            alt={`${teamName} Logo`}
                                            width={36}
                                            height={36}
                                            className="rounded-full ring-1 ring-gray-200 dark:ring-gray-700 bg-white"
                                          />
                                          {index < 3 && (
                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                              {getRankIcon(index)}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      <div className="flex flex-col">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                                          {teamName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          {teamSekolah}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="inline-flex px-4 py-2 rounded-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-bold text-base shadow-sm">
                                      {points.toLocaleString("id-ID")} Poin
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-32 text-center text-gray-500 dark:text-gray-400"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <Heart className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                  <p>Data E-Voting belum tersedia</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : isJuaraUmum ? (
                    <div className="w-full overflow-x-auto pb-1">
                      <Table className="w-full text-sm min-w-[800px] md:min-w-full">
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <TableHead className="w-16 text-center font-bold text-gray-900 dark:text-gray-100">
                              NO.
                            </TableHead>
                            <TableHead className="font-bold text-gray-900 dark:text-gray-100 min-w-[200px]">
                              NAMA SEKOLAH / TIM
                            </TableHead>
                            <TableHead className="text-center font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              NO TAMPIL
                            </TableHead>

                            {kategoriRekap.aspeks?.map((aspekName) => (
                              <TableHead
                                key={aspekName}
                                className="text-center font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"
                              >
                                NILAI {aspekName.toUpperCase()}
                              </TableHead>
                            ))}

                            <TableHead className="text-center font-bold text-red-600 dark:text-red-400">
                              PENALTY
                            </TableHead>
                            <TableHead className="text-center font-bold text-gray-900 dark:text-gray-100">
                              JUMLAH
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {kategoriRekap.klasemen.length > 0 ? (
                            <>
                              {kategoriRekap.klasemen.map((item, index) => {
                                const teamName =
                                  item.Team?.team_name || item.team_name;
                                const teamLogo =
                                  item.Team?.team_logo || item.team_logo;
                                const teamSekolah =
                                  item.Team?.team_sekolah_instansi ||
                                  item.team_sekolah_instansi;
                                const finalScore =
                                  item.nilai_akhir !== undefined
                                    ? item.nilai_akhir
                                    : item.total;

                                const nomorTampil = nomorTampilMap.get(
                                  item.team_id,
                                );
                                const displayNomor = nomorTampil
                                  ? String(nomorTampil).padStart(2, "0")
                                  : "-";

                                return (
                                  <TableRow
                                    key={item.team_id}
                                    className={`
                                    transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50
                                    ${
                                      index < 3
                                        ? "bg-gradient-to-r from-yellow-50/50 via-transparent to-transparent dark:from-yellow-900/10"
                                        : ""
                                    }
                                  `}
                                  >
                                    <TableCell className="text-center py-4">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <div
                                          className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getRankBadgeColor(index)}`}
                                        >
                                          {item.rank || index + 1}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3 py-1">
                                        {teamLogo && (
                                          <div className="relative flex-shrink-0">
                                            <Image
                                              src={`${process.env.NEXT_PUBLIC_API_URL}${teamLogo}`}
                                              alt={`${teamName} Logo`}
                                              width={36}
                                              height={36}
                                              className="rounded-full ring-1 ring-gray-200 dark:ring-gray-700 bg-white"
                                            />
                                            {index < 3 && (
                                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                                {getRankIcon(index)}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        <div className="flex flex-col min-w-[150px]">
                                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                                            {teamName}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {teamSekolah}
                                          </p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center font-mono font-bold text-base text-gray-700 dark:text-gray-300">
                                      {displayNomor}
                                    </TableCell>

                                    {kategoriRekap.aspeks?.map((aspekName) => (
                                      <TableCell
                                        key={aspekName}
                                        className="text-center"
                                      >
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                          {item.scores?.[aspekName] || 0}
                                        </span>
                                      </TableCell>
                                    ))}

                                    <TableCell className="text-center font-bold text-red-600 dark:text-red-400">
                                      {item.penalty?.total_pengurangan > 0
                                        ? item.penalty.total_pengurangan
                                        : 0}
                                    </TableCell>

                                    <TableCell className="text-center">
                                      <div className="inline-flex px-3 py-1 rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold text-sm shadow-sm">
                                        {parseInt(finalScore, 10)}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </>
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={
                                  (kategoriRekap.aspeks?.length || 0) + 5
                                }
                                className="h-32 text-center text-gray-500 dark:text-gray-400"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <Trophy className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                  <p>Hasil rekapitulasi belum tersedia</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto pb-1">
                      <Table className="w-full text-sm min-w-[600px] md:min-w-full">
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <TableHead className="w-16 text-center font-bold text-gray-900 dark:text-gray-100 bg-gray-100/50 dark:bg-gray-800/50">
                              NO.
                            </TableHead>
                            <TableHead className="text-center font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              NO TAMPIL
                            </TableHead>
                            <TableHead className="font-bold text-gray-900 dark:text-gray-100 min-w-[200px]">
                              NAMA SEKOLAH / TIM
                            </TableHead>
                            {kategoriRekap.aspeks?.map((aspekName) => (
                              <TableHead
                                key={aspekName}
                                className="text-center font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap"
                              >
                                NILAI {aspekName.toUpperCase()}
                              </TableHead>
                            ))}
                            {kategoriRekap.kurangi_penalty && (
                              <TableHead className="text-center font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                                PENALTY
                              </TableHead>
                            )}
                            <TableHead className="text-center font-bold text-gray-900 dark:text-gray-100">
                              TOTAL NILAI
                            </TableHead>
                            <TableHead className="text-center font-bold text-gray-900 dark:text-gray-100 bg-gray-100/50 dark:bg-gray-800/50">
                              KEJUARAAN
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {kategoriRekap.klasemen.length > 0 ? (
                            kategoriRekap.klasemen.map((item, index) => {
                              const rank = index + 1;
                              const nomorTampil = nomorTampilMap.get(
                                item.team_id,
                              );
                              const displayNomor = nomorTampil
                                ? String(nomorTampil).padStart(2, "0")
                                : "-";

                              const teamName =
                                item.Team?.team_name || item.team_name;
                              const teamLogo =
                                item.Team?.team_logo || item.team_logo;

                              const limitJuara = kategoriRekap.limit_juara
                                ? parseInt(kategoriRekap.limit_juara, 10)
                                : null;
                              const isWithinLimit =
                                !limitJuara || rank <= limitJuara;
                              const isGlobal =
                                activeKategoriObj?.jenis_juara === "juara_peringkat" ||
                                kategoriRekap.jenis_juara === "juara_peringkat" ||
                                kategoriRekap.tipe_penilaian === "global" ||
                                activeKategoriObj?.tipe_penilaian === "global";
                              const kejuaraan = isWithinLimit
                                ? isGlobal
                                  ? getKejuaraanTitle(
                                      rank,
                                      event.kejuaraan_template,
                                    )
                                  : `${activeKategoriObj?.nama_kategori || "Kategori"} Terbaik ${rank}`
                                : "-";

                              return (
                                <TableRow
                                  key={item.team_id}
                                  className={`transition-colors ${rank <= 3 ? "bg-orange-50/30 dark:bg-orange-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                                >
                                  <TableCell className="text-center py-4 bg-gray-50/50 dark:bg-gray-800/30">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getRankBadgeColor(index)}`}
                                      >
                                        {item.rank || rank}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center font-mono font-bold text-xl text-primary">
                                    {displayNomor}
                                  </TableCell>
                                  <TableCell className="font-bold text-gray-800 dark:text-gray-200">
                                    <div className="flex items-center gap-3">
                                      {teamLogo && (
                                        <div className="relative flex-shrink-0">
                                          <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}${teamLogo}`}
                                            alt={`${teamName} Logo`}
                                            width={32}
                                            height={32}
                                            className="rounded-full ring-1 ring-gray-200 dark:ring-gray-700 bg-white"
                                          />
                                        </div>
                                      )}
                                      <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                                          {teamName}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {item.team_sekolah_instansi ||
                                            item.Team?.team_sekolah_instansi}
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  {kategoriRekap.aspeks?.map((aspekName) => (
                                    <TableCell
                                      key={aspekName}
                                      className="text-center"
                                    >
                                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {item.scores?.[aspekName] || 0}
                                      </span>
                                    </TableCell>
                                  ))}
                                  {kategoriRekap.kurangi_penalty && (
                                    <TableCell className="text-center font-bold text-red-600 dark:text-red-400">
                                      {item.penalty?.total_pengurangan > 0
                                        ? item.penalty.total_pengurangan
                                        : 0}
                                    </TableCell>
                                  )}
                                  <TableCell className="text-center font-black text-gray-900 dark:text-white text-lg">
                                    {item.nilai_akhir}
                                  </TableCell>
                                  <TableCell className="text-center font-black tracking-wide text-red-700 dark:text-red-400 bg-gray-50/50 dark:bg-gray-800/30 whitespace-nowrap">
                                    {kejuaraan}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={
                                  5 +
                                  (kategoriRekap.aspeks?.length || 0) +
                                  (kategoriRekap.kurangi_penalty ? 1 : 0)
                                }
                                className="h-32 text-center text-muted-foreground"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <Trophy className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                  <p>
                                    Data klasemen belum tersedia untuk kategori
                                    ini.
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
