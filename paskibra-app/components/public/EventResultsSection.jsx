"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Trophy, Award, Medal, Crown, Loader2, Heart } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// Helper untuk menggenerate penamaan kejuaraan standar Paskibra berdasarkan peringkat
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

const truncateText = (text, maxLength = 24) => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export default function EventResultsSection({ eventId, event }) {
  const [kategoriList, setKategoriList] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [kategoriRekap, setKategoriRekap] = useState({
    klasemen: [],
    aspeks: [],
    kurangi_penalty: false,
  });
  const [eVotingRekap, setEVotingRekap] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingTab, setLoadingTab] = useState(false);

  const nomorTampilMap = useMemo(() => {
    if (!event?.Event_teams) return new Map();
    return new Map(
      event.Event_teams.map((et) => [et.team_id, et.nomor_tampil]),
    );
  }, [event]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(
          `${apiUrl}/api/rekap/public/kategori/${eventId}`,
        ).then((r) => r.json());
        if (res.data && res.data.length > 0) {
          const sorted = [...res.data].sort(
            (a, b) => (a.urutan || 0) - (b.urutan || 0),
          );
          setKategoriList(sorted);
          setActiveTab(sorted[0].id);
        } else if (event?.xenplatform_id) {
          setActiveTab("e-voting");
        }
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchCategories();
  }, [eventId, event?.xenplatform_id]);

  useEffect(() => {
    if (!activeTab) return;
    const fetchKlasemen = async () => {
      setLoadingTab(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (activeTab === "e-voting") {
          const res = await fetch(
            `${apiUrl}/api/rekap/public/${eventId}?type=evoting`,
          ).then((r) => r.json());
          if (res.donasi) {
            setEVotingRekap(res.donasi);
            setKategoriRekap({
              klasemen: [],
              aspeks: [],
              kurangi_penalty: false,
            });
          }
        } else {
          const res = await fetch(
            `${apiUrl}/api/rekap/public/klasemen/${activeTab}`,
          ).then((r) => r.json());
          if (res.klasemen) {
            const katObj = kategoriList.find((k) => k.id === activeTab);
            setKategoriRekap({
              klasemen: res.klasemen,
              aspeks: res.aspeks || [],
              kurangi_penalty: res.kurangi_penalty || false,
              limit_juara:
                res.limit_juara !== undefined
                  ? res.limit_juara
                  : katObj?.limit_juara ?? null,
            });
            setEVotingRekap([]);
          }
        }
      } catch (err) {
        console.error("Gagal memuat klasemen:", err);
      } finally {
        setLoadingTab(false);
      }
    };
    fetchKlasemen();
  }, [activeTab, eventId, kategoriList]);

  if (loadingInitial) {
    return (
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/60 dark:border-gray-800/60 p-6 md:p-10 flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  const allTabs = [...kategoriList];
  if (event?.xenplatform_id) {
    allTabs.push({ id: "e-voting", nama_kategori: "E-Voting" });
  }

  if (allTabs.length === 0) return null;

  const isEvoting = activeTab === "e-voting";
  const activeKategoriObj = kategoriList.find((k) => k.id === activeTab);
  const isJuaraUmum =
    activeKategoriObj?.jenis_juara === "juara_umum" ||
    activeKategoriObj?.is_juara_umum;
  const juaraUmum =
    isJuaraUmum && kategoriRekap.klasemen.length > 0
      ? kategoriRekap.klasemen[0]
      : null;

  return (
    <div
      id="hasil-klasemen"
      className="bg-white dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/60 dark:border-gray-800/60 p-6 md:p-10"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
          <div className="p-2.5 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl">
            <Trophy className="text-yellow-600 dark:text-yellow-400 h-6 w-6" />
          </div>
          {isEvoting
            ? "Hasil E-Voting"
            : `Hasil Klasemen ${
                activeKategoriObj ? `- ${activeKategoriObj.nama_kategori}` : ""
              }`}
        </h2>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full sm:w-[250px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            {allTabs.map((kat) => (
              <SelectItem key={kat.id} value={kat.id}>
                {kat.nama_kategori}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Card Juara Umum di Bagian Atas Tabel */}
      {isJuaraUmum && juaraUmum && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-6 text-white shadow-lg shadow-yellow-500/20 md:p-8 mb-6">
          <Trophy className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-white/10" />
          <div className="relative flex items-center gap-4">
            {juaraUmum.team_logo || juaraUmum.Team?.team_logo ? (
              <div className="relative flex-shrink-0">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${juaraUmum.team_logo || juaraUmum.Team?.team_logo}`}
                  alt={
                    juaraUmum.team_name ||
                    juaraUmum.Team?.team_name ||
                    "Juara Umum"
                  }
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
                {juaraUmum.team_name || juaraUmum.Team?.team_name}
              </p>
              {(juaraUmum.team_sekolah_instansi ||
                juaraUmum.Team?.team_sekolah_instansi) && (
                <p className="text-sm text-yellow-50/90">
                  {juaraUmum.team_sekolah_instansi ||
                    juaraUmum.Team?.team_sekolah_instansi}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {loadingTab ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
        </div>
      ) : isEvoting ? (
        <>
          {/* Desktop E-Voting Table */}
          <div className="w-full overflow-x-auto pb-1 hidden md:block">
            <Table className="w-full text-sm">
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
                    const teamLogo = item.Team?.team_logo || item.team_logo;
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
                            item.team_id || item.id || item.Team?.team_id,
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

          {/* Mobile E-Voting Cards */}
          <div className="space-y-3 p-4 md:hidden">
            {eVotingRekap.length > 0 ? (
              eVotingRekap.map((item, index) => {
                const teamName = item.Team?.team_name || item.team_name || "-";
                const teamSekolah =
                  item.Team?.team_sekolah_instansi ||
                  item.team_sekolah_instansi ||
                  "-";
                const points = Math.floor((Number(item.balance) || 0) / 1000);
                const nomorTampil =
                  item.nomor_tampil !== undefined && item.nomor_tampil !== null
                    ? item.nomor_tampil
                    : nomorTampilMap.get(
                        item.team_id || item.id || item.Team?.team_id,
                      );
                const displayNomor = nomorTampil
                  ? String(nomorTampil).padStart(2, "0")
                  : "-";

                return (
                  <div
                    key={
                      item.team_id || item.id || item.Team?.team_id || index
                    }
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 shadow-sm ${
                      index < 3
                        ? "border-yellow-200 bg-yellow-50/40 dark:border-yellow-900/40 dark:bg-yellow-900/10"
                        : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-800/50"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 ${getRankBadgeColor(index)}`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          No. {displayNomor}
                        </span>
                        <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                          {truncateText(teamName)}
                        </p>
                      </div>
                      <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                        {truncateText(teamSekolah)}
                      </p>
                    </div>
                    <div className="ml-2 shrink-0 text-right">
                      <p className="text-base font-black text-green-600 dark:text-green-400">
                        {points.toLocaleString("id-ID")}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                        Poin
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-32 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
                <Heart className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p>Data E-Voting belum tersedia.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full overflow-x-auto pb-1 hidden md:block">
          <Table className="w-full text-sm">
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
                {(!isJuaraUmum && kategoriRekap.kurangi_penalty) ||
                isJuaraUmum ? (
                  <TableHead className="text-center font-bold text-red-600 dark:text-red-400">
                    PENALTY
                  </TableHead>
                ) : null}
                <TableHead className="text-center font-bold text-gray-900 dark:text-gray-100">
                  {isJuaraUmum ? "JUMLAH" : "TOTAL NILAI"}
                </TableHead>
                {!isJuaraUmum && (
                  <TableHead className="text-center font-bold text-gray-900 dark:text-gray-100 bg-gray-100/50 dark:bg-gray-800/50">
                    KEJUARAAN
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {kategoriRekap.klasemen.length > 0 ? (
                <>
                  {kategoriRekap.klasemen.map((item, index) => {
                    const rank = index + 1;
                    const nomorTampil = nomorTampilMap.get(item.team_id);
                    const displayNomor = nomorTampil
                      ? String(nomorTampil).padStart(2, "0")
                      : "-";
                    const limitJuara =
                      kategoriRekap.limit_juara ??
                      activeKategoriObj?.limit_juara
                        ? parseInt(
                            kategoriRekap.limit_juara ??
                              activeKategoriObj?.limit_juara,
                            10,
                          )
                        : null;
                    const isWithinLimit = !limitJuara || rank <= limitJuara;
                    const isGlobal =
                      activeKategoriObj?.jenis_juara === "juara_peringkat" ||
                      kategoriRekap.jenis_juara === "juara_peringkat" ||
                      kategoriRekap.tipe_penilaian === "global" ||
                      activeKategoriObj?.tipe_penilaian === "global";
                    const kejuaraan = isWithinLimit
                      ? isGlobal
                        ? getKejuaraanTitle(rank, event.kejuaraan_template)
                        : `${activeKategoriObj?.nama_kategori || "Kategori"} Terbaik ${rank}`
                      : "-";
                    const teamName =
                      item.team_name || item.Team?.team_name || "-";
                    const teamSekolah =
                      item.team_sekolah_instansi ||
                      item.Team?.team_sekolah_instansi ||
                      "-";
                    const teamLogo = item.team_logo || item.Team?.team_logo;
                    const finalScore = item.nilai_akhir ?? item.total ?? 0;

                    return (
                      <TableRow
                        key={item.team_id}
                        className={`transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${rank <= 3 ? "bg-gradient-to-r from-yellow-50/50 via-transparent to-transparent dark:from-yellow-900/10" : ""}`}
                      >
                        <TableCell className="text-center py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getRankBadgeColor(index)}`}
                            >
                              {item.rank || rank}
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
                          <TableCell key={aspekName} className="text-center">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {item.scores?.[aspekName] || 0}
                            </span>
                          </TableCell>
                        ))}
                        {(!isJuaraUmum && kategoriRekap.kurangi_penalty) ||
                        isJuaraUmum ? (
                          <TableCell className="text-center font-bold text-red-600 dark:text-red-400">
                            {item.penalty?.total_pengurangan > 0
                              ? item.penalty.total_pengurangan
                              : 0}
                          </TableCell>
                        ) : null}
                        <TableCell className="text-center">
                          <div className="inline-flex px-3 py-1 rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold text-sm shadow-sm">
                            {parseInt(finalScore, 10)}
                          </div>
                        </TableCell>
                        {!isJuaraUmum && (
                          <TableCell className="text-center font-black tracking-wide text-red-700 dark:text-red-400 bg-gray-50/50 dark:bg-gray-800/30 whitespace-nowrap">
                            {kejuaraan}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      (kategoriRekap.aspeks?.length || 0) + (isJuaraUmum ? 5 : 6)
                    }
                    className="h-32 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Trophy className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                      <p>Data klasemen belum tersedia untuk kategori ini.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {/* --- ACCORDION VIEW FOR MOBILE --- */}
      {!loadingTab && (
        <div className="md:hidden ">
          {kategoriRekap.klasemen.length > 0 ? (
            <Accordion type="single" collapsible>
              {kategoriRekap.klasemen.map((item, index) => {
                const rank = item.rank || index + 1;
                const nomorTampil = nomorTampilMap.get(item.team_id);
                const displayNomor = nomorTampil
                  ? String(nomorTampil).padStart(2, "0")
                  : "-";
                const limitJuara =
                  kategoriRekap.limit_juara ??
                  activeKategoriObj?.limit_juara
                    ? parseInt(
                        kategoriRekap.limit_juara ??
                          activeKategoriObj?.limit_juara,
                        10,
                      )
                    : null;
                const isWithinLimit = !limitJuara || rank <= limitJuara;
                const isGlobal =
                  activeKategoriObj?.jenis_juara === "juara_peringkat" ||
                  kategoriRekap.jenis_juara === "juara_peringkat" ||
                  kategoriRekap.tipe_penilaian === "global" ||
                  activeKategoriObj?.tipe_penilaian === "global";
                const kejuaraan = isWithinLimit
                  ? isGlobal
                    ? getKejuaraanTitle(rank, event.kejuaraan_template)
                    : `${activeKategoriObj?.nama_kategori || "Kategori"} Terbaik ${rank}`
                  : "-";
                const teamName = item.team_name || item.Team?.team_name || "-";
                const teamSekolah =
                  item.team_sekolah_instansi ||
                  item.Team?.team_sekolah_instansi ||
                  "-";
                const teamLogo = item.team_logo || item.Team?.team_logo;
                const finalScore = item.nilai_akhir ?? item.total ?? 0;

                return (
                  <AccordionItem
                    key={item.team_id}
                    value={item.team_id}
                    className="border rounded-lg bg-white dark:bg-gray-800/50 shadow-sm mb-3 last:mb-0"
                  >
                    <AccordionTrigger className="p-3 text-left hover:no-underline">
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 ${getRankBadgeColor(index)}`}
                        >
                          {rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[10px] text-gray-900 dark:text-white text-xs">
                            {truncateText(teamName)}
                          </p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-400">
                            {truncateText(teamSekolah)}
                          </p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="font-black text-base text-gray-900 dark:text-white">
                            {parseInt(finalScore, 10)}
                          </p>
                          {!isJuaraUmum && (
                            <p className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                              {kejuaraan}
                            </p>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t border-gray-100 dark:border-gray-700/50">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 dark:text-gray-400">
                            No. Tampil
                          </span>
                          <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                            {displayNomor}
                          </span>
                        </div>
                        <hr className="border-dashed" />
                        {kategoriRekap.aspeks?.map((aspekName) => (
                          <div
                            key={aspekName}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-500 dark:text-gray-400">
                              Nilai {aspekName}
                            </span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {item.scores?.[aspekName] || 0}
                            </span>
                          </div>
                        ))}
                        {((!isJuaraUmum && kategoriRekap.kurangi_penalty) ||
                          isJuaraUmum) && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">
                              Penalty
                            </span>
                            <span className="font-bold text-red-600 dark:text-red-400">
                              {item.penalty?.total_pengurangan > 0
                                ? item.penalty.total_pengurangan
                                : 0}
                            </span>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : null}
        </div>
      )}
    </div>
  );
}
