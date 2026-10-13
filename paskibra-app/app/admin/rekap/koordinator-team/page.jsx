"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  ArrowRight,
  Frown,
  ArrowLeft,
  CheckCircle2,
  Printer,
} from "lucide-react";
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
import { useReactToPrint } from "react-to-print";

const KoordinatorTeamRekapPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [myTeamIds, setMyTeamIds] = useState([]);

  const printRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Rekap_Nilai_${activeEvent?.event_name?.replace(/\s+/g, "_") || "Tim"}`,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, teamsRes] = await Promise.all([
          api.get("/events"),
          api.get("/teams"),
        ]);

        const fetchedTeams =
          teamsRes.data.teams || teamsRes.data.data || teamsRes.data || [];
        const teamIds = fetchedTeams.map((t) => t.team_id);
        setMyTeamIds(teamIds);

        // Filter hanya event yang memiliki tim dari koordinator ini
        const filteredEvents = eventsRes.data.events.filter((event) =>
          event.Event_teams?.some((et) => teamIds.includes(et.team_id)),
        );
        setEvents(filteredEvents);
      } catch (error) {
        toast.error("Gagal memuat data event dan tim.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => setActiveEvent(null)}
                className="w-fit"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Event
              </Button>
              <Button onClick={handlePrint} className="w-fit shadow-sm">
                <Printer className="mr-2 h-4 w-4" /> Cetak Rekap (PDF)
              </Button>
            </div>

            <div ref={printRef} className="print:p-8 print:bg-white">
              <div className="hidden print:block mb-6 text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-black">
                  Rekap Nilai Tim
                </h1>
                <h2 className="text-lg text-gray-700">
                  Event: {activeEvent.event_name}
                </h2>
              </div>

              <h1 className="text-2xl font-semibold mb-4 print:hidden">
                Daftar Tim Anda di Event: {activeEvent.event_name}
              </h1>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print:hidden">
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
                          <p className="text-3xl font-bold text-foreground">
                            {team.RekapNilais && team.RekapNilais.length > 0
                              ? parseInt(team.RekapNilais[0].nilai_akhir)
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

              {/* Tabel Khusus Print */}
              <div className="hidden print:block mt-8">
                <table className="w-full border-collapse border border-gray-300 text-black text-[10px]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-1 text-center w-12">
                        No.
                      </th>
                      <th className="border border-gray-300 p-1 text-left">
                        Nama Tim
                      </th>
                      <th className="border border-gray-300 p-1 text-left">
                        Sekolah / Instansi
                      </th>
                      <th className="border border-gray-300 p-1 text-center w-32">
                        Nilai Akhir
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.length > 0 ? (
                      teams.map((team, index) => (
                        <tr key={team.team_id} className="break-inside-avoid">
                          <td className="border border-gray-300 p-1 text-center">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 p-1 font-semibold">
                            {team.team_name}
                          </td>
                          <td className="border border-gray-300 p-1">
                            {team.team_sekolah_instansi}
                          </td>
                          <td className="border border-gray-300 p-1 text-center font-bold text-[10px]">
                            {team.RekapNilais && team.RekapNilais.length > 0
                              ? parseInt(team.RekapNilais[0].nilai_akhir)
                              : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="border border-gray-300 p-3 text-center italic text-gray-500"
                        >
                          Tidak ada data tim.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Pilih Event</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <p>Memuat event...</p>
              ) : events.length > 0 ? (
                events.map((event) => {
                  const isRegistered = event.Event_teams?.some((et) =>
                    myTeamIds.includes(et.team_id),
                  );
                  return (
                    <Card
                      key={event.event_id}
                      className="flex flex-col relative overflow-hidden group"
                    >
                      <div className="relative h-40 w-full bg-muted/50 border-b border-border/50">
                        <Image
                          src={
                            event.event_poster
                              ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                              : "/default-poster.png"
                          }
                          alt={`Poster ${event.event_name}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {isRegistered && (
                          <div className="absolute top-0 right-0 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Terdaftar
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle>{event.event_name}</CardTitle>
                        <CardDescription>
                          {format(
                            new Date(event.event_tanggal),
                            "d MMMM yyyy",
                            {
                              locale: id,
                            },
                          )}
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
                  );
                })
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
