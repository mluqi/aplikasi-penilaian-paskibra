"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ScoringPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { eventId, teamId } = params;

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

  const scoreOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  const allSubAspekIds = useMemo(() => {
    return aspeks.flatMap((aspek) =>
      aspek.SubAspeks.map((sub) => sub.subaspek_id),
    );
  }, [aspeks]);

  const isFormComplete = useMemo(() => {
    if (allSubAspekIds.length === 0) return false;
    return allSubAspekIds.every((id) => scores[id] !== undefined);
  }, [scores, allSubAspekIds]);

  const filledSubAspeksCount = Object.keys(scores).length;
  const totalSubAspeksCount = allSubAspekIds.length;
  const progressPercentage =
    totalSubAspeksCount === 0
      ? 0
      : (filledSubAspeksCount / totalSubAspeksCount) * 100;

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId || !teamId || !user) return;
      setLoading(true);
      try {
        const [eventRes, teamRes, aspekRes, submittedRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/teams/${teamId}`),
          api.get(`/aspek?event_id=${eventId}`),
          api.get(`/penilaian/submitted-teams?event_id=${eventId}`),
        ]);

        setEvent(eventRes.data.event);
        setTeam(teamRes.data.team);
        setAspeks(aspekRes.data);

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
              existingScores[sub.subaspek_id] = parseFloat(sub.nilai);
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
    const score = Math.max(0, Math.min(100, Number(value)));
    setScores((prev) => ({ ...prev, [subAspekId]: score }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete) {
      toast.error("Harap isi semua nilai sub-aspek sebelum menyimpan.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        event_id: eventId,
        team_id: teamId,
        juri_id: user.user_id,
        catatan,
        penilaian_detail: aspeks.map((aspek) => ({
          aspek_id: aspek.aspek_id,
          sub_aspek_nilai: aspek.SubAspeks.map((sub) => ({
            subaspek_id: sub.subaspek_id,
            nilai: scores[sub.subaspek_id],
          })),
        })),
      };

      const response = penilaianId
        ? await api.put(`/penilaian/${penilaianId}`, payload)
        : await api.post("/penilaian", payload);

      toast.success(response.data.message);
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

  if (loading) return <div>Memuat form penilaian...</div>;
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
          <Button
            onClick={() => router.push(`/admin/penilaian/${eventId}`)}
            variant="outline"
            className="mb-4"
            disabled={isLocked}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardHeader className="text-center bg-muted/10 border-b pb-6">
              <CardTitle className="text-2xl font-bold">
                Form Penilaian: {team.team_name}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Event:{" "}
                <span className="font-semibold text-foreground">
                  {event.event_name}
                </span>{" "}
                | Sekolah/Instansi:{" "}
                <span className="font-semibold text-foreground">
                  {team.team_sekolah_instansi}
                </span>
              </CardDescription>

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
              <Accordion
                type="multiple"
                defaultValue={aspeks.map((a) => a.aspek_id)}
                className="w-full space-y-4"
              >
                {aspeks.map((aspek) => {
                  const aspectSubIds = aspek.SubAspeks.map(
                    (s) => s.subaspek_id,
                  );
                  const filledInThisAspect = aspectSubIds.filter(
                    (id) => scores[id] !== undefined,
                  ).length;
                  const isAspectComplete =
                    filledInThisAspect === aspectSubIds.length;

                  return (
                    <AccordionItem
                      key={aspek.aspek_id}
                      value={aspek.aspek_id}
                      className={cn(
                        "border rounded-xl px-4 md:px-6 transition-colors",
                        isAspectComplete
                          ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30"
                          : "bg-white dark:bg-gray-900",
                      )}
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex flex-col items-start text-left">
                            <span className="font-bold text-lg">
                              {aspek.nama_aspek}
                            </span>
                            <span className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                              <span className="bg-muted px-2 py-0.5 rounded-md font-medium text-xs border">
                                Bobot: {aspek.bobot}%
                              </span>
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
                      <AccordionContent>
                        <div className="divide-y divide-border/50 pt-2">
                          {aspek.SubAspeks.map((sub) => (
                            <div
                              key={sub.subaspek_id}
                              className="flex flex-col gap-3 py-5"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <Label
                                    htmlFor={sub.subaspek_id}
                                    className="text-base font-semibold"
                                  >
                                    {sub.nama_subaspek}
                                  </Label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Bobot penilaian:{" "}
                                    <span className="font-medium text-foreground">
                                      {sub.bobot}%
                                    </span>
                                  </p>
                                </div>
                                {scores[sub.subaspek_id] !== undefined && (
                                  <div className="hidden md:flex h-10 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                                    {scores[sub.subaspek_id]}
                                  </div>
                                )}
                              </div>

                              {/* Interactive Score Grid */}
                              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mt-2">
                                {scoreOptions.map((scoreValue) => {
                                  const isSelected =
                                    scores[sub.subaspek_id] === scoreValue;
                                  return (
                                    <button
                                      key={scoreValue}
                                      type="button"
                                      onClick={() =>
                                        handleScoreChange(
                                          sub.subaspek_id,
                                          scoreValue,
                                        )
                                      }
                                      disabled={isLocked}
                                      className={cn(
                                        "h-12 md:h-10 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center border-2",
                                        isSelected
                                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                                          : "bg-background text-muted-foreground border-border/50 hover:border-primary/40 hover:bg-muted",
                                        isLocked &&
                                          !isSelected &&
                                          "opacity-50 cursor-not-allowed hover:border-border/50 hover:bg-background",
                                      )}
                                    >
                                      {scoreValue}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
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
                      onChange={(e) => setCatatan(e.target.value)}
                      disabled={isLocked}
                      placeholder="Ketikkan catatan evaluasi di sini..."
                      className="min-h-[100px] bg-white dark:bg-gray-900 border-amber-200 dark:border-amber-800/50 focus-visible:ring-amber-500/30"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t p-6 flex-col sm:flex-row gap-3">
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
                  disabled={isSubmitting || !isFormComplete || isLocked}
                >
                  {isSubmitting ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" /> Simpan
                    </>
                  )}
                </Button>
                {penilaianId && !isLocked && (
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
      </main>
    </ProtectedRoute>
  );
};

export default ScoringPage;
