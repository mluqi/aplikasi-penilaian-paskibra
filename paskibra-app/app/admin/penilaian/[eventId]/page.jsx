"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import api from "@/service/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Star, Frown, Lock, ShieldCheck } from "lucide-react";
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

const TeamSelectionPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { eventId } = params;

  const [event, setEvent] = useState(null);
  const [submittedTeams, setSubmittedTeams] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || !eventId) return;
    setLoading(true);
    try {
      const [eventRes, submittedRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/penilaian/submitted-teams?event_id=${eventId}`),
      ]);

      setEvent(eventRes.data.event);

      const submissions = {};
      submittedRes.data.submissions.forEach((sub) => {
        submissions[sub.team_id] = sub;
      });
      setSubmittedTeams(submissions);
    } catch (error) {
      toast.error("Gagal memuat data event atau tim.");
    } finally {
      setLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectTeam = (team) => {
    router.push(`/admin/penilaian/${eventId}/${team.team_id}`);
  };

  if (loading) {
    return <div>Memuat daftar tim...</div>;
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
                <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/penilaian">Input Penilaian</BreadcrumbLink>
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
        <Button onClick={() => router.push("/admin/penilaian")} variant="outline" className="mb-4 w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Event
        </Button>
        <h1 className="text-2xl font-semibold mb-4">Pilih Tim untuk Dinilai</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {event.Event_teams?.length > 0 ? (
            event.Event_teams.map(({ Team }) => {
              const submission = submittedTeams[Team.team_id];
              const isLocked = submission?.is_lock;

              return (
                <Card key={Team.team_id} className="transition-all hover:shadow-md hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle>{Team.team_name}</CardTitle>
                    <CardDescription>{Team.team_sekolah_instansi}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleSelectTeam(submission || Team)}
                      disabled={isLocked}
                      variant={submission ? "secondary" : "default"}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" /> Terkunci
                        </>
                      ) : submission ? (
                        <>
                          <ShieldCheck className="mr-2 h-4 w-4" /> Edit Nilai
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 h-4 w-4" /> Nilai Tim Ini
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-10">
              <Frown className="mx-auto h-12 w-12 mb-4" />
              <p>Belum ada tim yang terdaftar pada event ini.</p>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default TeamSelectionPage;

