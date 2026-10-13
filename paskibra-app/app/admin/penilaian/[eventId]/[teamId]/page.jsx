"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import api from "@/service/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Check,
  Lock,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  Gavel,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ScoringContent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { eventId, teamId } = params;
  const searchParams = useSearchParams();
  const backupJuriId = searchParams.get("juri_id");

  const [event, setEvent] = useState(null);
  const [team, setTeam] = useState(null);
  const [aspeks, setAspeks] = useState([]);
  const [scores, setScores] = useState({});
  const [catatan, setCatatan] = useState("");
  const [penilaianId, setPenilaianId] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);

  // State untuk prompt alasan nilai 0
  const [zeroPrompt, setZeroPrompt] = useState({
    isOpen: false,
    subAspekId: null,
    aspekName: "",
    subAspekName: "",
  });
  const [selectedReason, setSelectedReason] = useState("");
  const zeroReasons = [
    "Tidak dilaksanakan",
    "Gerakan terlewati oleh gerakan yang lain",
    "Aba-aba salah",
  ];

  const allSubAspekIds = useMemo(() => {
    return aspeks.flatMap((aspek) =>
      aspek.SubAspeks.map((sub) => sub.subaspek_id),
    );
  }, [aspeks]);

  const isFormComplete = useMemo(() => {
    if (allSubAspekIds.length === 0) return false;
    return allSubAspekIds.every(
      (id) => scores[id] !== undefined && scores[id] >= 0,
    );
  }, [scores, allSubAspekIds]);

  const filledSubAspeksCount = allSubAspekIds.filter(
    (id) => scores[id] !== undefined && scores[id] >= 0,
  ).length;
  const totalSubAspeksCount = allSubAspekIds.length;
  const progressPercentage =
    totalSubAspeksCount === 0
      ? 0
      : (filledSubAspeksCount / totalSubAspeksCount) * 100;

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
  }, [scores]);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId || !teamId || !user) return;
      setLoading(true);
      try {
        const [eventRes, teamRes, aspekRes, submittedRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/teams/${teamId}`),
          api.get(`/aspek?event_id=${eventId}`),
          api.get(
            `/penilaian/submitted-teams?event_id=${eventId}${user.role === "asisten_juri" && backupJuriId ? `&juri_id=${backupJuriId}` : ""}`,
          ),
        ]);

        setEvent(eventRes.data.event);
        setTeam(teamRes.data.team);

        // Filter aspek sesuai tugas Juri
        const targetJuriId =
          user.role === "asisten_juri" ? backupJuriId : user.id;
        const currentJuriAssignment = eventRes.data.event.Event_juris?.find(
          (j) => j.juri_id === targetJuriId || j.User?.user_id === targetJuriId,
        );
        let allowedAspeks = [];
        if (user.role === "admin" || user.role === "superadmin") {
          allowedAspeks = aspekRes.data;
        } else if (currentJuriAssignment && currentJuriAssignment.Aspeks) {
          const allowedAspekIds = new Set(
            currentJuriAssignment.Aspeks.map((a) => a.aspek_id),
          );
          allowedAspeks = aspekRes.data.filter((a) =>
            allowedAspekIds.has(a.aspek_id),
          );
        }

        allowedAspeks.sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
        allowedAspeks.forEach((aspek) => {
          if (aspek.SubAspeks) {
            aspek.SubAspeks.sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
          }
        });

        setAspeks(allowedAspeks);

        const submission = submittedRes.data.submissions.find(
          (s) => s.team_id === teamId,
        );

        if (submission) {
          setPenilaianId(submission.penilaian_id);
          setIsLocked(submission.is_lock);
          const response = await api.get(
            `/penilaian/${submission.penilaian_id}`,
          );
          const existingData = response.data;
          setCatatan(existingData.catatan || "");
          const existingScores = {};
          existingData.AspekNilais.forEach((aspek) => {
            aspek.SubAspekNilais.forEach((sub) => {
              if (sub.nilai !== null && sub.nilai !== undefined) {
                const val = parseInt(sub.nilai, 10);
                if (val >= 0) {
                  existingScores[sub.subaspek_id] = val;
                }
              }
            });
          });
          setScores(existingScores);
        }
      } catch (error) {
        toast.error("Gagal memuat data untuk penilaian.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, teamId, user]);

  const handleScoreChange = (subAspekId, value) => {
    if (value === "") {
      setScores((prev) => {
        const newScores = { ...prev };
        delete newScores[subAspekId];
        return newScores;
      });
    } else {
      setScores((prev) => ({ ...prev, [subAspekId]: Number(value) }));
    }
    setIsDirty(true);
  };

  // Fitur Auto Save
  useEffect(() => {
    if (!isDirty || isLocked || loading) return;

    const timer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        const payload = {
          event_id: eventId,
          team_id: teamId,
          juri_id: user.role === "asisten_juri" ? backupJuriId : user.id,
          catatan,
          penilaian_detail: aspeks.map((aspek) => ({
            aspek_id: aspek.aspek_id,
            sub_aspek_nilai: aspek.SubAspeks.map((sub) => ({
              subaspek_id: sub.subaspek_id,
              nilai:
                scores[sub.subaspek_id] !== undefined
                  ? scores[sub.subaspek_id]
                  : null,
            })),
          })),
        };

        if (penilaianId) {
          await api.put(`/penilaian/${penilaianId}`, payload);
        } else {
          const response = await api.post("/penilaian", payload);
          if (response.data?.data?.penilaian_id) {
            setPenilaianId(response.data.data.penilaian_id);
          }
        }
        setIsDirty(false); // Reset status dirty setelah berhasil tersimpan
      } catch (error) {
        console.error("Auto-save gagal:", error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000); // Jeda 2 detik setelah juri berhenti mengklik

    return () => clearTimeout(timer);
  }, [
    scores,
    catatan,
    isDirty,
    isLocked,
    loading,
    eventId,
    teamId,
    user,
    backupJuriId,
    aspeks,
    penilaianId,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormComplete) {
      const missingCount = totalSubAspeksCount - filledSubAspeksCount;
      toast.error(
        `Tidak dapat menyimpan! Masih ada ${missingCount} butir penilaian yang belum dinilai. Harap lengkapi semua nilai terlebih dahulu.`,
      );
      // Auto-scroll ke butir pertama yang belum dinilai
      const firstUnfilledId = allSubAspekIds.find(
        (id) => scores[id] === undefined || scores[id] === null || scores[id] < 0,
      );
      if (firstUnfilledId) {
        const el = document.getElementById(`subaspek-row-${firstUnfilledId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        event_id: eventId,
        team_id: teamId,
        juri_id: user.role === "asisten_juri" ? backupJuriId : user.id,
        catatan,
        penilaian_detail: aspeks.map((aspek) => ({
          aspek_id: aspek.aspek_id,
          sub_aspek_nilai: aspek.SubAspeks.map((sub) => ({
            subaspek_id: sub.subaspek_id,
            nilai:
              scores[sub.subaspek_id] !== undefined
                ? scores[sub.subaspek_id]
                : null,
          })),
        })),
      };

      const response = penilaianId
        ? await api.put(`/penilaian/${penilaianId}`, payload)
        : await api.post("/penilaian", payload);

      toast.success(response.data.message);
      setIsDirty(false);
      router.push(`/admin/penilaian/${eventId}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menyimpan penilaian.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLock = async () => {
    if (!isFormComplete) {
      const missingCount = totalSubAspeksCount - filledSubAspeksCount;
      toast.error(
        `Tidak dapat mengunci! Masih ada ${missingCount} butir penilaian yang belum dinilai.`,
      );
      const firstUnfilledId = allSubAspekIds.find(
        (id) => scores[id] === undefined || scores[id] === null || scores[id] < 0,
      );
      if (firstUnfilledId) {
        const el = document.getElementById(`subaspek-row-${firstUnfilledId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    setIsLocking(true);
    try {
      await api.patch(`/penilaian/lock/${penilaianId}`);
      toast.success("Penilaian berhasil dikunci.");
      router.push(`/admin/penilaian/${eventId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengunci penilaian.");
    } finally {
      setIsLocking(false);
    }
  };

  const handleBackClick = () => {
    if (isDirty) {
      setShowBackDialog(true);
    } else {
      router.push(`/admin/penilaian/${eventId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Memuat form penilaian...
        </p>
      </div>
    );
  }
  if (!event || !team) return <div>Data event atau tim tidak ditemukan.</div>;

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
                <BreadcrumbLink href={`/admin/penilaian/${eventId}`}>
                  {event.event_name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{team.team_name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-4">
            <Button onClick={handleBackClick} type="button" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
          </div>
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardHeader className="text-center bg-muted/10 border-b pb-6">
              <CardTitle className="text-2xl font-bold">
                Form Penilaian: {team.team_name}
              </CardTitle>
              <CardDescription className="text-base mt-2 flex flex-col items-center justify-center gap-2">
                <div>
                  Event:{" "}
                  <span className="font-semibold text-foreground">
                    {event.event_name}
                  </span>{" "}
                  | Sekolah/Instansi:{" "}
                  <span className="font-semibold text-foreground">
                    {team.team_sekolah_instansi}
                  </span>
                </div>
                <div className="h-6 flex items-center justify-center mt-1">
                  {isAutoSaving ? (
                    <span className="flex items-center text-sm text-muted-foreground font-medium animate-pulse">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Menyimpan otomatis...
                    </span>
                  ) : isDirty ? (
                    <span className="flex items-center text-sm text-amber-600 font-medium">
                      <AlertCircle className="w-4 h-4 mr-2" /> Belum disimpan
                    </span>
                  ) : (
                    <span className="flex items-center text-sm text-emerald-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Tersimpan
                    </span>
                  )}
                </div>
              </CardDescription>

              {/* Real-time Total Score Indicator */}
              <div className="mt-6 flex justify-center">
                <div className="inline-flex flex-col items-center justify-center bg-white dark:bg-gray-950 px-10 py-5 rounded-[2rem] border-2 border-primary/10 shadow-sm transition-all duration-300">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Total Nilai
                  </span>
                  <span
                    className={cn(
                      "text-6xl font-black tabular-nums transition-colors duration-500",
                      isFormComplete
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-primary",
                    )}
                  >
                    {totalScore}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 max-w-xl mx-auto w-full">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="font-medium text-muted-foreground">
                    Progres Penilaian
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      isFormComplete ? "text-emerald-600" : "text-primary",
                    )}
                  >
                    {filledSubAspeksCount} / {totalSubAspeksCount} Sub-aspek
                  </span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 ease-out",
                      isFormComplete ? "bg-emerald-500" : "bg-primary",
                    )}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {aspeks.length === 0 && (
                <div className="text-center py-10">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Tidak Ada Tugas Aspek
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Anda belum ditugaskan untuk menilai aspek apapun pada event
                    ini.
                  </p>
                </div>
              )}

              <Accordion
                type="multiple"
                defaultValue={aspeks.map((a) => a.aspek_id)}
                className="w-full space-y-4"
              >
                {aspeks.map((aspek) => {
                  // 1. Cek secara dinamis kolom mana saja yang benar-benar memiliki nilai (tidak kosong dan bukan "0")
                  const hasKurangSekali = aspek.SubAspeks.some((sub) => {
                    const parts = String(sub.nilai_kurang_sekali || "")
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean);
                    return parts.some((p) => p !== "0");
                  });
                  const hasKurang = aspek.SubAspeks.some((sub) => {
                    const parts = String(sub.nilai_kurang || "")
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean);
                    return parts.some((p) => p !== "0");
                  });
                  const hasCukup = aspek.SubAspeks.some((sub) => {
                    const parts = String(sub.nilai_cukup || "")
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean);
                    return parts.some((p) => p !== "0");
                  });
                  const hasBaik = aspek.SubAspeks.some((sub) => {
                    const parts = String(sub.nilai_baik || "")
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean);
                    return parts.some((p) => p !== "0");
                  });
                  const hasSangatBaik = aspek.SubAspeks.some((sub) => {
                    const parts = String(sub.nilai_sangat_baik || "")
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean);
                    return parts.some((p) => p !== "0");
                  });

                  // 2. Kumpulkan hanya kolom yang aktif
                  const activeColumns = [
                    {
                      key: "nol",
                      label: "0",
                      show: true,
                      widthClass: "w-auto px-1 sm:px-2 text-center",
                      headerClass:
                        "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400 border-slate-200 dark:border-slate-800",
                      activeClass:
                        "bg-slate-700 border-slate-700 text-white shadow-md scale-[1.02]",
                      hoverClass:
                        "hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-300",
                    },
                    {
                      key: "kurang_sekali",
                      label: "K. Sekali",
                      show: hasKurangSekali,
                      widthClass: "w-auto px-1 sm:px-2 text-center",
                      headerClass:
                        "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900",
                      activeClass:
                        "bg-rose-700 border-rose-700 text-white shadow-md scale-[1.02]",
                      hoverClass:
                        "hover:border-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-800 dark:hover:text-rose-300",
                    },
                    {
                      key: "kurang",
                      label: "Kurang",
                      show: hasKurang,
                      widthClass: "w-auto px-1 sm:px-2 text-center",
                      headerClass:
                        "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900",
                      activeClass:
                        "bg-red-600 border-red-600 text-white shadow-md scale-[1.02]",
                      hoverClass:
                        "hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300",
                    },
                    {
                      key: "cukup",
                      label: "Cukup",
                      show: hasCukup,
                      widthClass: "w-auto px-1 sm:px-2 text-center",
                      headerClass:
                        "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-900",
                      activeClass:
                        "bg-orange-500 border-orange-500 text-white shadow-md scale-[1.02]",
                      hoverClass:
                        "hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-700 dark:hover:text-orange-300",
                    },
                    {
                      key: "baik",
                      label: "Baik",
                      show: hasBaik,
                      widthClass: "w-auto px-1 sm:px-2 text-center",
                      headerClass:
                        "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900",
                      activeClass:
                        "bg-blue-600 border-blue-600 text-white shadow-md scale-[1.02]",
                      hoverClass:
                        "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300",
                    },
                    {
                      key: "sangat_baik",
                      label: "S. Baik",
                      show: hasSangatBaik,
                      widthClass: "w-auto px-1 sm:px-2 text-center",
                      headerClass:
                        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
                      activeClass:
                        "bg-emerald-600 border-emerald-600 text-white shadow-md scale-[1.02]",
                      hoverClass:
                        "hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300",
                    },
                  ].filter((col) => col.show);

                  const aspectSubIds = aspek.SubAspeks.map(
                    (s) => s.subaspek_id,
                  );
                  const filledInThisAspect = aspectSubIds.filter(
                    (id) => scores[id] !== undefined && scores[id] >= 0,
                  ).length;
                  const isAspectComplete =
                    filledInThisAspect === aspectSubIds.length;

                  const aspectScore = aspectSubIds.reduce(
                    (sum, id) => sum + (scores[id] || 0),
                    0,
                  );

                  return (
                    <AccordionItem
                      key={aspek.aspek_id}
                      value={aspek.aspek_id}
                      className={cn(
                        "border rounded-xl overflow-hidden transition-colors",
                        isAspectComplete
                          ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30"
                          : "bg-white dark:bg-gray-900",
                      )}
                    >
                      <AccordionTrigger className="hover:no-underline py-4 px-4 md:px-6">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex flex-col items-start text-left">
                            <span className="font-bold text-lg">
                              {aspek.nama_aspek}
                            </span>
                          </div>
                          <div>
                            {isAspectComplete ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm gap-1 pl-1.5 pointer-events-none">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-muted-foreground gap-1 border-dashed bg-background pointer-events-none"
                              >
                                <AlertCircle className="h-3.5 w-3.5" />{" "}
                                {filledInThisAspect}/{aspectSubIds.length}{" "}
                                Dinilai
                              </Badge>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <div className="overflow-x-auto w-full border-t border-border/50">
                          <Table className="w-full">
                            <TableHeader>
                              <TableRow className="hover:bg-transparent">
                                <TableHead className="bg-muted/20 px-2 sm:px-3 font-bold text-foreground leading-tight text-[11px] sm:text-xs max-w-[130px] sm:max-w-[180px]">
                                  Sub Aspek Penilaian
                                </TableHead>
                                {activeColumns.map((col, idx) => (
                                  <TableHead
                                    key={col.key}
                                    className={cn(
                                      "text-center font-bold border-b-2 whitespace-nowrap py-1.5 px-0.5 sm:px-1 text-[10px] sm:text-[10px]",
                                      col.widthClass,
                                      col.headerClass,
                                      idx === activeColumns.length - 1 &&
                                        "pr-1.5 sm:pr-3",
                                    )}
                                  >
                                    {col.label}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(() => {
                                const renderedRows = [];
                                let lastCategory = null;

                                (aspek.SubAspeks || []).forEach((sub, subIdx) => {
                                  const currentCategory = (
                                    sub.kategori || ""
                                  ).trim();

                                  // Tampilkan header banner jika kategori berganti dan ada nilainya
                                  if (
                                    currentCategory &&
                                    currentCategory !== lastCategory
                                  ) {
                                    renderedRows.push(
                                      <TableRow
                                        key={`cat-${currentCategory}-${sub.subaspek_id}-${subIdx}`}
                                        className="bg-yellow-100 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/30 border-y border-yellow-200 dark:border-yellow-800"
                                      >
                                        <TableCell
                                          colSpan={activeColumns.length + 1}
                                          className="font-bold text-yellow-800 dark:text-yellow-500 py-2 px-4 md:px-6 uppercase text-xs sm:text-sm tracking-wide text-center"
                                        >
                                          {currentCategory}
                                        </TableCell>
                                      </TableRow>,
                                    );
                                  }

                                  lastCategory = currentCategory;

                                  renderedRows.push(
                                    <TableRow
                                      key={sub.subaspek_id}
                                      id={`subaspek-row-${sub.subaspek_id}`}
                                      className="hover:bg-muted/30"
                                    >
                                        <TableCell className="font-medium text-[11px] sm:text-xs align-middle py-2 px-2 sm:px-3 border-r border-border/30 max-w-[140px] sm:max-w-[200px]">
                                          <div
                                            className="whitespace-normal break-words leading-tight"
                                            title={sub.nama_subaspek}
                                          >
                                            {sub.nama_subaspek}
                                          </div>
                                        </TableCell>
                                        {activeColumns.map((col, idx) => {
                                          const rawValue =
                                            col.key === "nol"
                                              ? "0"
                                              : col.key === "kurang_sekali"
                                                ? sub.nilai_kurang_sekali
                                                : col.key === "kurang"
                                                  ? sub.nilai_kurang
                                                  : col.key === "cukup"
                                                    ? sub.nilai_cukup
                                                    : col.key === "baik"
                                                      ? sub.nilai_baik
                                                      : sub.nilai_sangat_baik;

                                          // Pisahkan nilai dan hitung jumlah tombol untuk menentukan ukuran tombol yang seragam
                                          let values = [];
                                          if (col.key === "nol") {
                                            values = ["0"];
                                          } else {
                                            values = String(rawValue || "")
                                              .split(",")
                                              .map((v) => v.trim())
                                              .filter((v) => v && v !== "0");
                                          }

                                          // Tombol fixed di 1 ukuran seragam yang ringkas agar muat 1 layar
                                          const buttonSizeClass =
                                            "w-7.5 h-7.5 sm:w-9 sm:h-9 text-[11px] sm:text-xs";

                                          return (
                                            <TableCell
                                              key={col.key}
                                              className={cn(
                                                "py-1.5 px-0.5 sm:px-1 align-middle text-center w-auto",
                                                col.widthClass,
                                                idx ===
                                                  activeColumns.length - 1 &&
                                                  "pr-1.5 sm:pr-3",
                                              )}
                                            >
                                              <div className="flex flex-nowrap items-center justify-center gap-0.5 sm:gap-1 mx-auto">
                                                {values.map((val) => {
                                                  const scoreValue =
                                                    Number(val);
                                                  const isSelected =
                                                    scores[sub.subaspek_id] ===
                                                    scoreValue;

                                                  return (
                                                    <button
                                                      key={val}
                                                      type="button"
                                                      onClick={() => {
                                                        if (scoreValue === 0) {
                                                          if (isSelected) {
                                                            handleScoreChange(
                                                              sub.subaspek_id,
                                                              "",
                                                            );
                                                          } else {
                                                            setZeroPrompt({
                                                              isOpen: true,
                                                              subAspekId:
                                                                sub.subaspek_id,
                                                              aspekName:
                                                                aspek.nama_aspek,
                                                              subAspekName:
                                                                sub.nama_subaspek,
                                                            });
                                                          }
                                                        } else {
                                                          handleScoreChange(
                                                            sub.subaspek_id,
                                                            isSelected
                                                              ? ""
                                                              : scoreValue,
                                                          );
                                                        }
                                                      }}
                                                      disabled={isLocked}
                                                      className={cn(
                                                        buttonSizeClass,
                                                        "flex-none shrink-0 rounded-md sm:rounded-lg font-bold transition-all duration-200 border sm:border-2 md:border lg:border-2 flex items-center justify-center shadow-sm tracking-tight sm:tracking-normal",
                                                        isSelected
                                                          ? col.activeClass
                                                          : cn(
                                                              "bg-background text-muted-foreground border-border/50",
                                                              col.hoverClass,
                                                            ),
                                                        isLocked &&
                                                          !isSelected &&
                                                          "opacity-50 cursor-not-allowed hover:border-border/50 hover:bg-background hover:text-muted-foreground",
                                                      )}
                                                    >
                                                      {scoreValue}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </TableCell>
                                          );
                                        })}
                                      </TableRow>,
                                    );
                                  });

                                  return renderedRows;
                              })()}
                            </TableBody>
                          </Table>
                          <Table>
                            <TableBody>
                              <TableRow className="bg-muted/20 hover:bg-muted/20">
                                <TableCell
                                  colSpan={activeColumns.length}
                                  className="text-right font-bold py-4 px-4 md:px-6 uppercase"
                                >
                                  Total Nilai {aspek.nama_aspek}
                                </TableCell>
                                <TableCell className="text-center font-black text-xl text-primary py-4 px-4 md:px-6 w-[120px]">
                                  {aspectScore}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              <div className="mt-8 bg-amber-50/50 dark:bg-amber-950/10 p-4 md:p-6 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div className="w-full">
                    <Label
                      htmlFor="catatan"
                      className="text-amber-900 dark:text-amber-200 font-semibold text-base"
                    >
                      Catatan Evaluasi Juri (Opsional)
                    </Label>
                    <p className="text-sm text-amber-700/70 dark:text-amber-400/70 mb-3 mt-1">
                      Berikan masukan, kritik, atau saran membangun untuk tim
                      ini.
                    </p>
                    <Textarea
                      id="catatan"
                      value={catatan}
                      onChange={(e) => {
                        setCatatan(e.target.value);
                        setIsDirty(true);
                      }}
                      disabled={isLocked}
                      placeholder="Ketikkan catatan evaluasi di sini..."
                      className="min-h-[100px] bg-white dark:bg-gray-900 border-amber-200 dark:border-amber-800/50 focus-visible:ring-amber-500/30"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t p-6 flex-col gap-4">
              {!isFormComplete && (
                <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs sm:text-sm text-amber-800 dark:text-amber-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">⚠️ Belum Lengkap:</span>
                    <span>
                      Masih ada <strong>{totalSubAspeksCount - filledSubAspeksCount}</strong> dari {totalSubAspeksCount} butir penilaian yang belum dinilai.
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    Semua nilai wajib diisi untuk menyimpan
                  </span>
                </div>
              )}
              <div className="w-full flex flex-col sm:flex-row gap-3 md:justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className={cn(
                    "w-full sm:w-auto min-w-[200px] text-base",
                    isFormComplete
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "",
                  )}
                  disabled={isSubmitting || isLocked || isAutoSaving}
                >
                  {isSubmitting ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" /> Simpan
                    </>
                  )}
                </Button>
                {penilaianId && !isLocked && user?.role === "asisten_juri" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="lg"
                        className="w-full sm:w-auto text-base"
                        disabled={isLocking}
                      >
                        <Lock className="mr-2 h-5 w-5" /> Kunci Penilaian
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Kunci Penilaian Ini?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Setelah dikunci, penilaian ini tidak dapat diubah
                          lagi. Pastikan semua nilai sudah benar sebelum
                          melanjutkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLock}>
                          Ya, Kunci Penilaian
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardFooter>
          </Card>
        </form>

        <AlertDialog open={showBackDialog} onOpenChange={setShowBackDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Perubahan Belum Disimpan</AlertDialogTitle>
              <AlertDialogDescription>
                Anda memiliki nilai yang belum tersimpan secara permanen. Apakah
                Anda yakin ingin kembali?
                <br />
                (Catatan: Auto-save mungkin belum selesai memproses input
                terakhir Anda).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push(`/admin/penilaian/${eventId}`)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Ya, Tinggalkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog
          open={zeroPrompt.isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setZeroPrompt({
                isOpen: false,
                subAspekId: null,
                aspekName: "",
                subAspekName: "",
              });
              setSelectedReason("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alasan Nilai 0</DialogTitle>
              <DialogDescription>
                Pilih alasan mengapa <strong>{zeroPrompt.subAspekName}</strong>{" "}
                diberi nilai 0.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              {zeroReasons.map((reason, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="zeroReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm font-medium">{reason}</span>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setZeroPrompt({
                    isOpen: false,
                    subAspekId: null,
                    aspekName: "",
                    subAspekName: "",
                  })
                }
              >
                Batal
              </Button>
              <Button
                onClick={() => {
                  if (!selectedReason) {
                    toast.error("Pilih alasan terlebih dahulu.");
                    return;
                  }
                  const { subAspekId, aspekName, subAspekName } = zeroPrompt;
                  handleScoreChange(subAspekId, 0);

                  const noteToAdd = `[${aspekName} - ${subAspekName}]: ${selectedReason}`;
                  setCatatan((prev) =>
                    prev ? prev + "\n" + noteToAdd : noteToAdd,
                  );
                  setIsDirty(true);

                  setZeroPrompt({
                    isOpen: false,
                    subAspekId: null,
                    aspekName: "",
                    subAspekName: "",
                  });
                  setSelectedReason("");
                }}
              >
                Konfirmasi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </ProtectedRoute>
  );
};

export default function ScoringPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Memuat Form Penilaian...
        </div>
      }
    >
      <ScoringContent />
    </Suspense>
  );
}
