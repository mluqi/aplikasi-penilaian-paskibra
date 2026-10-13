"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";
import useAuth from "@/hooks/useAuth";
import api from "@/service/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Star,
  Frown,
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  MapPin,
  CalendarIcon,
  CheckCircle2,
  Gavel,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
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
import { cn } from "@/lib/utils";
import { TeamPenaltyManager } from "@/components/admin/events/PenaltyManagement";

const TeamSelectionPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { eventId } = params;

  const [event, setEvent] = useState(null);
  const [submittedTeams, setSubmittedTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [backupJuriId, setBackupJuriId] = useState("");
  const [selectedTeamForPenalty, setSelectedTeamForPenalty] = useState(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const isAsisten = user?.role === "asisten_juri";
  const activeTab = searchParams.get("view") || "penilaian";

  const handleUnlock = async (penilaianId) => {
    setIsUnlocking(true);
    try {
      const response = await api.patch(`/penilaian/unlock/${penilaianId}`);
      toast.success(response.data.message);
      if (isAsisten && backupJuriId) {
        fetchSubmissions(backupJuriId);
      } else {
        fetchSubmissions();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal membuka kunci penilaian.",
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  const fetchSubmissions = useCallback(
    async (juriIdToFetch) => {
      try {
        let url = `/penilaian/submitted-teams?event_id=${eventId}`;
        if (juriIdToFetch) url += `&juri_id=${juriIdToFetch}`;
        const submittedRes = await api.get(url);
        const submissions = {};
        submittedRes.data.submissions.forEach((sub) => {
          submissions[sub.team_id] = sub;
        });
        setSubmittedTeams(submissions);
      } catch (error) {
        console.error("Gagal memuat status penilaian", error);
      }
    },
    [eventId],
  );

  const fetchData = useCallback(async () => {
    if (!user || !eventId) return;
    setLoading(true);
    try {
      const eventRes = await api.get(`/events/${eventId}`);
      setEvent(eventRes.data.event);

      if (user.role !== "asisten_juri") {
        await fetchSubmissions();
      }
    } catch (error) {
      toast.error("Gagal memuat data event atau tim.");
    } finally {
      setLoading(false);
    }
  }, [user, eventId, fetchSubmissions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isAsisten && backupJuriId) {
      fetchSubmissions(backupJuriId);
    }
  }, [backupJuriId, isAsisten, fetchSubmissions]);

  const filteredTeams = useMemo(() => {
    if (!event?.Event_teams) return [];
    return event.Event_teams.filter(({ Team }) => {
      const search = searchQuery.toLowerCase();
      return (
        Team.team_name.toLowerCase().includes(search) ||
        (Team.team_sekolah_instansi &&
          Team.team_sekolah_instansi.toLowerCase().includes(search))
      );
    }).sort((a, b) => {
      const noA = a.nomor_tampil || Number.MAX_SAFE_INTEGER;
      const noB = b.nomor_tampil || Number.MAX_SAFE_INTEGER;
      return noA - noB;
    });
  }, [event, searchQuery]);

  const handleSelectTeam = (team) => {
    let url = `/admin/penilaian/${eventId}/${team.team_id}`;
    if (isAsisten && backupJuriId) {
      url += `?juri_id=${backupJuriId}`;
    }
    router.push(url);
  };

  const handleTabChange = (tab) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("view", tab);
    // Hapus parameter juri_id jika beralih tab untuk menghindari kebingungan
    currentParams.delete("juri_id");
    router.push(`${pathname}?${currentParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p>Memuat daftar tim...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div>Event tidak ditemukan.</div>;
  }

  return (
    <ProtectedRoute requiredAccess="input_assessment">
      <header className="flex h-16 shrink-0 items-center gap-2">
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
                <BreadcrumbLink href="/admin/penilaian">
                  Input Penilaian
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{event.event_name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Header Event Terpilih */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-border/50 p-4 md:p-6 mb-2">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-20 md:w-20 md:h-28 shrink-0 rounded-lg overflow-hidden border shadow-sm bg-muted/50">
                <Image
                  src={
                    event.event_poster
                      ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                      : "/default-poster.png"
                  }
                  alt={`Poster ${event.event_name}`}
                  fill
                  className="object-cover"
                  onError={(e) => (e.currentTarget.src = "/default-poster.png")}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground line-clamp-2">
                  {event.event_name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-primary" />{" "}
                    {format(new Date(event.event_tanggal), "d MMMM yyyy", {
                      locale: id,
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />{" "}
                    {event.event_tempat}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/penilaian")}
              className="w-full md:w-auto shadow-sm shrink-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Ganti Event
            </Button>
          </div>
        </div>

        {/* Pencarian dan Navigasi View */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pilih Tim</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "penalti"
                ? "Pilih tim untuk memberikan poin penalti atau pelanggaran."
                : "Daftar tim peserta yang harus Anda nilai pada event ini."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {isAsisten && (
              <div className="flex bg-muted/50 p-1 rounded-xl w-full sm:w-auto border border-border/50">
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2",
                    activeTab === "penilaian"
                      ? "bg-white dark:bg-gray-800 shadow-sm text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => handleTabChange("penilaian")}
                >
                  <Star className="w-4 h-4" /> Input Penilaian
                </button>
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2",
                    activeTab === "penalti"
                      ? "bg-white dark:bg-gray-800 shadow-sm text-orange-600 dark:text-orange-500"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => handleTabChange("penalti")}
                >
                  <Gavel className="w-4 h-4" /> Beri Penalti
                </button>
              </div>
            )}
            <div className="relative w-full sm:w-64 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama tim atau sekolah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-gray-900 shadow-sm rounded-xl h-10"
              />
            </div>
          </div>
        </div>

        {isAsisten && activeTab === "penilaian" && (
          <div className="mb-2 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
            <h3 className="font-semibold text-amber-800 dark:text-amber-500 mb-2">
              Pilih Juri yang Akan di-Backup
            </h3>
            <Select value={backupJuriId} onValueChange={setBackupJuriId}>
              <SelectTrigger className="w-full md:w-96 bg-white dark:bg-gray-900">
                <SelectValue placeholder="Pilih Juri..." />
              </SelectTrigger>
              <SelectContent>
                {event.Event_juris?.map((juri) => (
                  <SelectItem
                    key={juri.User?.user_id || juri.juri_id}
                    value={juri.User?.user_id || juri.juri_id}
                  >
                    {juri.User?.user_name} (ID:{" "}
                    {juri.User?.user_id || juri.juri_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isAsisten && activeTab === "penilaian" && !backupJuriId ? (
          <div className="text-center py-12 border rounded-xl bg-muted/20">
            <p className="text-muted-foreground font-medium">
              Silakan pilih Juri terlebih dahulu untuk melihat dan mem-backup
              nilai tim.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] md:w-[70px] lg:w-[100px] text-center font-bold md:text-xs lg:text-sm px-2 lg:px-4">
                    No. Tampil
                  </TableHead>
                  <TableHead className="w-[80px] md:w-[60px] lg:w-[80px] text-center font-bold md:text-xs lg:text-sm px-2 lg:px-4">
                    Logo
                  </TableHead>
                  <TableHead className="font-bold md:text-xs lg:text-sm px-2 lg:px-4">
                    Nama Tim
                  </TableHead>
                  {activeTab === "penilaian" ? (
                    <>
                      <TableHead className="w-[80px] md:w-[60px] lg:w-[80px] text-center font-bold md:text-xs lg:text-sm px-2 lg:px-4">
                        Status <span className="lg:hidden">& Aksi</span>
                      </TableHead>
                      <TableHead className="text-right font-bold md:text-xs lg:text-sm px-2 lg:px-4 hidden lg:table-cell">
                        Aksi
                      </TableHead>
                    </>
                  ) : (
                    <TableHead className="text-right font-bold md:text-xs lg:text-sm px-2 lg:px-4">
                      Aksi
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.length > 0 ? (
                  filteredTeams.map(({ Team, nomor_tampil }) => {
                    const submission = submittedTeams[Team.team_id];
                    const isLocked = submission?.is_lock;

                    return (
                      <TableRow
                        key={Team.team_id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="text-center font-bold text-lg md:text-sm lg:text-lg px-2 lg:px-4">
                          {nomor_tampil
                            ? String(nomor_tampil).padStart(2, "0")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center px-2 lg:px-4">
                          <div className="relative w-10 h-10 md:w-8 md:h-8 lg:w-10 lg:h-10 mx-auto rounded-full border shadow-sm bg-white overflow-hidden shrink-0">
                            <Image
                              src={
                                Team.team_logo
                                  ? `${process.env.NEXT_PUBLIC_API_URL}${Team.team_logo}`
                                  : "/default-logo.png"
                              }
                              alt={`Logo ${Team.team_name}`}
                              fill
                              className="object-contain p-1"
                              onError={(e) =>
                                (e.currentTarget.src = "/default-logo.png")
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground px-2 lg:px-4">
                          <div
                            className="max-w-[300px] sm:max-w-[100px] md:max-w-[300px] lg:max-w-[200px] md:text-xs lg:text-base"
                            title={Team.team_name}
                          >
                            {Team.team_name}
                          </div>
                          <div
                            className="text-sm md:text-xs lg:text-sm font-normal text-muted-foreground mt-0.5 max-w-[300px] sm:max-w-[100px] md:max-w-[300px] lg:max-w-[200px]"
                            title={Team.team_sekolah_instansi}
                          >
                            {Team.team_sekolah_instansi}
                          </div>
                        </TableCell>
                        {activeTab === "penilaian" ? (
                          <>
                            <TableCell className="text-center px-2 lg:px-4">
                              <div className="flex flex-col items-center justify-center gap-1.5 lg:block">
                                {isLocked ? (
                                  <Badge
                                    variant="destructive"
                                    className="shadow-sm md:text-[10px] md:px-1.5 md:py-0 lg:text-xs lg:px-2.5 lg:py-0.5"
                                  >
                                    <Lock className="mr-1.5 h-3 w-3 md:mr-1 md:h-2.5 md:w-2.5 lg:mr-1.5 lg:h-3 lg:w-3" />{" "}
                                    Terkunci
                                  </Badge>
                                ) : submission ? (
                                  <Badge
                                    variant="secondary"
                                    className="shadow-sm bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-50 md:text-[10px] md:px-1.5 md:py-0 lg:text-xs lg:px-2.5 lg:py-0.5"
                                  >
                                    <CheckCircle2 className="mr-1.5 h-3 w-3 md:mr-1 md:h-2.5 md:w-2.5 lg:mr-1.5 lg:h-3 lg:w-3" />{" "}
                                    Sudah Dinilai
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="shadow-sm text-muted-foreground border-border/60 md:text-[10px] md:px-1.5 md:py-0 lg:text-xs lg:px-2.5 lg:py-0.5"
                                  >
                                    Belum Dinilai
                                  </Badge>
                                )}

                                {isLocked && isAsisten ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="shadow-sm h-7 text-[11px] px-2 w-full max-w-[100px] lg:hidden mt-1 md:mt-0 border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      handleUnlock(submission.penilaian_id)
                                    }
                                    disabled={isUnlocking}
                                  >
                                    <Unlock className="mr-1 h-3.5 w-3.5" /> Buka
                                    Kunci
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="shadow-sm h-7 text-[11px] px-2 w-full max-w-[100px] lg:hidden mt-1 md:mt-0"
                                    onClick={() =>
                                      handleSelectTeam(submission || Team)
                                    }
                                    disabled={isLocked}
                                    variant={submission ? "outline" : "default"}
                                  >
                                    {isLocked ? (
                                      <>
                                        <Lock className="mr-1 h-3.5 w-3.5" />{" "}
                                        Terkunci
                                      </>
                                    ) : submission ? (
                                      <>
                                        <ShieldCheck className="mr-1 h-3.5 w-3.5" />{" "}
                                        Edit Nilai
                                      </>
                                    ) : (
                                      <>
                                        <Star className="mr-1 h-3.5 w-3.5" />{" "}
                                        Nilai Tim
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right px-2 lg:px-4 hidden lg:table-cell">
                              <div className="flex items-center justify-end gap-2">
                                {isLocked && isAsisten ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="shadow-sm h-9 text-sm px-3 border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      handleUnlock(submission.penilaian_id)
                                    }
                                    disabled={isUnlocking}
                                  >
                                    <Unlock className="mr-2 h-4 w-4" /> Buka
                                    Kunci
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="shadow-sm h-9 text-sm px-3"
                                    onClick={() =>
                                      handleSelectTeam(submission || Team)
                                    }
                                    disabled={isLocked}
                                    variant={submission ? "outline" : "default"}
                                  >
                                    {isLocked ? (
                                      <>
                                        <Lock className="mr-2 h-4 w-4" />{" "}
                                        Terkunci
                                      </>
                                    ) : submission ? (
                                      <>
                                        <ShieldCheck className="mr-2 h-4 w-4" />{" "}
                                        Edit Nilai
                                      </>
                                    ) : (
                                      <>
                                        <Star className="mr-2 h-4 w-4" /> Nilai
                                        Tim Ini
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <TableCell className="text-right px-2 lg:px-4">
                            <Button
                              size="sm"
                              className="shadow-sm h-8 text-xs px-3 bg-orange-600 hover:bg-orange-700 text-white border-none w-full lg:w-auto"
                              onClick={() => setSelectedTeamForPenalty(Team)}
                            >
                              <Gavel className="mr-2 h-4 w-4 hidden sm:inline-block" />{" "}
                              Input Penalti
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Frown className="h-10 w-10 mb-3 text-muted-foreground/40" />
                        <p className="text-base font-semibold text-foreground">
                          Tim Tidak Ditemukan
                        </p>
                        <p className="text-sm mt-1">
                          Tidak ada tim yang cocok dengan pencarian Anda.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      {/* Dialog untuk Mengelola Penalti per Tim */}
      <Dialog
        open={!!selectedTeamForPenalty}
        onOpenChange={(open) => !open && setSelectedTeamForPenalty(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          {selectedTeamForPenalty && (
            <TeamPenaltyManager
              eventId={eventId}
              team={selectedTeamForPenalty}
            />
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
};

export default TeamSelectionPage;
