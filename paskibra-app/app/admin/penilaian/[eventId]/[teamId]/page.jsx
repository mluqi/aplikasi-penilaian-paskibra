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
import { ArrowLeft, Check, Lock } from "lucide-react";
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
      aspek.SubAspeks.map((sub) => sub.subaspek_id)
    );
  }, [aspeks]);

  const isFormComplete = useMemo(() => {
    if (allSubAspekIds.length === 0) return false;
    return allSubAspekIds.every((id) => scores[id] !== undefined);
  }, [scores, allSubAspekIds]);

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
          (s) => s.team_id === teamId
        );

        if (submission) {
          setPenilaianId(submission.penilaian_id);
          setIsLocked(submission.is_lock);
          const response = await api.get(
            `/penilaian/${submission.penilaian_id}`
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
        error.response?.data?.message || "Gagal menyimpan penilaian."
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
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Form Penilaian: {team.team_name}</CardTitle>
              <CardDescription>
                Event: {event.event_name} | Sekolah/Instansi:{" "}
                {team.team_sekolah_instansi}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion
                type="multiple"
                defaultValue={aspeks.map((a) => a.aspek_id)}
                className="w-full space-y-4"
              >
                {aspeks.map((aspek) => (
                  <AccordionItem
                    key={aspek.aspek_id}
                    value={aspek.aspek_id}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">
                          {aspek.nama_aspek}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Bobot: {aspek.bobot}%
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="divide-y divide-border pt-2">
                        {aspek.SubAspeks.map((sub) => (
                          <div
                            key={sub.subaspek_id}
                            className="flex items-center justify-between gap-4 py-3"
                          >
                            <div>
                              <Label
                                htmlFor={sub.subaspek_id}
                                className="font-medium"
                              >
                                {sub.nama_subaspek}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Bobot: {sub.bobot}%
                              </p>
                            </div>
                            <div className="flex flex-wrap justify-end gap-1.5 w-full md:max-w-sm lg:max-w-4xl">
                              {scoreOptions.map((scoreValue) => (
                                <Button
                                  key={scoreValue}
                                  type="button"
                                  variant={
                                    scores[sub.subaspek_id] === scoreValue
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() =>
                                    handleScoreChange(
                                      sub.subaspek_id,
                                      scoreValue
                                    )
                                  }
                                  disabled={isLocked}
                                  className="h-12 w-16 text-sm"
                                >
                                  {scoreValue}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-8">
                <Label htmlFor="catatan">Catatan (Opsional)</Label>
                <Textarea
                  id="catatan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  disabled={isLocked}
                  placeholder="Tambahkan catatan atau masukan untuk tim..."
                  className="mt-2"
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-[50%] flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !isFormComplete || isLocked}
                >
                  {isSubmitting ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Simpan Penilaian
                    </>
                  )}
                </Button>
                {penilaianId && !isLocked && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        className="w-full"
                        disabled={isLocking}
                      >
                        <Lock className="mr-2 h-4 w-4" /> Kunci Penilaian
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
