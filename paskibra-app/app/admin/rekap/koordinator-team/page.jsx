"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/service/api";
import { toast } from "sonner";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Frown, ArrowLeft } from "lucide-react";
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
import { format } from "date-fns";
import { id } from "date-fns/locale";

const KoordinatorTeamRekapPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await api.get("/events");
        setEvents(response.data.events);
      } catch (error) {
        toast.error("Gagal memuat daftar event.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!activeEvent || !user) {
      return;
    }

    const fetchTeams = async () => {
      setLoadingTeams(true);
      try {
        const response = await api.get(`/rekap/${activeEvent.event_id}`);
        setTeams(response.data.teams || []);
      } catch (error) {
        toast.error("Gagal memuat data tim.");
        setTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [activeEvent, user]);

  return (
    <ProtectedRoute requiredAccess="view_recap">
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
                <BreadcrumbPage>Rekap Nilai Tim</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {activeEvent ? (
          <>
            <Button
              variant="outline"
              onClick={() => setActiveEvent(null)}
              className="mb-4 w-fit"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Event
            </Button>
            <h1 className="text-2xl font-semibold">
              Daftar Tim Anda di Event: {activeEvent.event_name}
            </h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loadingTeams ? (
                <p>Memuat tim...</p>
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <Card key={team.team_id}>
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                      <Image
                        src={
                          team.team_logo
                            ? `${process.env.NEXT_PUBLIC_API_URL}${team.team_logo}`
                            : "/default-logo.png"
                        }
                        alt={`Logo ${team.team_name}`}
                        width={48}
                        height={48}
                        className="rounded-md border object-contain p-0.5"
                        onError={(e) =>
                          (e.currentTarget.src = "/default-logo.png")
                        }
                      />
                      <div className="flex-1">
                        <CardTitle>{team.team_name}</CardTitle>
                        <CardDescription>
                          {team.team_sekolah_instansi}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">
                          Nilai Akhir
                        </p>
                        <p className="text-3xl font-bold">
                          {team.RekapNilais && team.RekapNilais.length > 0
                            ? parseFloat(
                                team.RekapNilais[0].nilai_akhir
                              ).toFixed(2)
                            : "Belum Dinilai"}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full" variant="outline">
                        <Link
                          href={`/admin/rekap/${activeEvent.event_id}/${team.team_id}`}
                        >
                          Lihat Detail Penilaian
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-10">
                  <Frown className="mx-auto h-12 w-12 mb-4" />
                  <p>Tidak ada tim Anda yang berpartisipasi di event ini.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Pilih Event</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <p>Memuat event...</p>
              ) : events.length > 0 ? (
                events.map((event) => (
                  <Card key={event.event_id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle>{event.event_name}</CardTitle>
                      <CardDescription>
                        {format(new Date(event.event_tanggal), "d MMMM yyyy", {
                          locale: id,
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                      <Button
                        className="w-full"
                        onClick={() => setActiveEvent(event)}
                      >
                        Lihat Tim <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-10">
                  <Frown className="mx-auto h-12 w-12 mb-4" />
                  <p>Tidak ada event yang tersedia.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
};

export default KoordinatorTeamRekapPage;
