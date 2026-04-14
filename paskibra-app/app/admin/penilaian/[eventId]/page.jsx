"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  CardContent, 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Star,
  Frown,
  Lock,
  ShieldCheck,
  Search,
  MapPin,
  CalendarIcon,
  CheckCircle2,
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

const TeamSelectionPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { eventId } = params;

  const [event, setEvent] = useState(null);
  const [submittedTeams, setSubmittedTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredTeams = useMemo(() => {
    if (!event?.Event_teams) return [];
    return event.Event_teams.filter(({ Team }) => {
      const search = searchQuery.toLowerCase();
      return (
        Team.team_name.toLowerCase().includes(search) ||
        (Team.team_sekolah_instansi &&
          Team.team_sekolah_instansi.toLowerCase().includes(search))
      );
    });
  }, [event, searchQuery]);

  const handleSelectTeam = (team) => {
    router.push(`/admin/penilaian/${eventId}/${team.team_id}`);
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

        {/* Pencarian dan Filter Tim */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pilih Tim</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Daftar tim peserta yang harus Anda nilai pada event ini.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama tim atau sekolah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-900 shadow-sm rounded-xl"
            />
          </div>
        </div>

        {/* Grid Tim Peserta */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTeams.length > 0 ? (
            filteredTeams.map(({ Team }) => {
              const submission = submittedTeams[Team.team_id];
              const isLocked = submission?.is_lock;

              return (
                <Card
                  key={Team.team_id}
                  className="group overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border-border/50 relative"
                >
                  <CardContent className="p-5 flex-1 flex flex-col items-center text-center pt-8">
                    <div className="relative w-20 h-20 mb-4 rounded-full border shadow-sm bg-white flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                      <Image
                        src={
                          Team.team_logo
                            ? `${process.env.NEXT_PUBLIC_API_URL}${Team.team_logo}`
                            : "/default-logo.png"
                        }
                        alt={`Logo ${Team.team_name}`}
                        fill
                        className="object-contain p-1.5"
                        onError={(e) =>
                          (e.currentTarget.src = "/default-logo.png")
                        }
                      />
                    </div>
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors text-foreground">
                      {Team.team_name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-5">
                      {Team.team_sekolah_instansi}
                    </p>

                    <div className="mt-auto pt-2">
                      {isLocked ? (
                        <Badge variant="destructive" className="shadow-sm px-3">
                          <Lock className="mr-1.5 h-3 w-3" /> Terkunci
                        </Badge>
                      ) : submission ? (
                        <Badge
                          variant="secondary"
                          className="shadow-sm bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-50 px-3"
                        >
                          <CheckCircle2 className="mr-1.5 h-3 w-3" /> Sudah
                          Dinilai
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="shadow-sm px-3 text-muted-foreground border-border/60"
                        >
                          Belum Dinilai
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-5 pt-0 bg-muted/10 border-t border-border/50">
                    <Button
                      className="w-full shadow-sm mt-4 group-hover:shadow-md transition-all"
                      onClick={() => handleSelectTeam(submission || Team)}
                      disabled={isLocked}
                      variant={submission ? "outline" : "default"}
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
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-muted/20 border-dashed">
              <Frown className="h-14 w-14 mb-4 text-muted-foreground/40" />
              <p className="text-xl font-semibold text-foreground">
                Tim Tidak Ditemukan
              </p>
              <p className="text-muted-foreground mt-2 max-w-md">
                Tidak ada tim yang cocok dengan pencarian Anda atau belum ada
                tim yang terdaftar pada event ini.
              </p>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default TeamSelectionPage;
