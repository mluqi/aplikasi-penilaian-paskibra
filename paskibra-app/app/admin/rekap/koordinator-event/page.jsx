"use client";

import { useState, useEffect } from "react";
import api from "@/service/api";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { ArrowRight, Frown, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const KoordinatorEventRekapPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [rekapData, setRekapData] = useState({ rekap: [], aspeks: [] });
  const [loading, setLoading] = useState(true);
  const [loadingRekap, setLoadingRekap] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      try {
        const response = await api.get("/events");
        // Filter events yang dikoordinatori oleh user saat ini
        const myEvents = response.data.events.filter(
          (event) => event.koordinator_id === user.id
        );
        setEvents(myEvents);
      } catch (error) {
        toast.error("Gagal memuat daftar event Anda.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  useEffect(() => {
    if (!activeEvent) {
      return;
    }

    const fetchRekap = async () => {
      setLoadingRekap(true);
      try {
        const response = await api.get(`/rekap/${activeEvent.event_id}`);
        setRekapData(response.data);
      } catch (error) {
        toast.error("Gagal memuat data rekapitulasi.");
        setRekapData({ rekap: [], aspeks: [] });
      } finally {
        setLoadingRekap(false);
      }
    };

    fetchRekap();
  }, [activeEvent]);

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
                <BreadcrumbPage>Rekap Nilai Event</BreadcrumbPage>
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
              Rekapitulasi Peringkat: {activeEvent.event_name}
            </h1>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Peringkat</TableHead>
                    <TableHead>Nama Tim</TableHead>
                    {rekapData.aspeks?.map((k) => (
                      <TableHead key={k} className="text-center">
                        {k}
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-bold">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRekap ? (
                    <TableRow>
                      <TableCell
                        colSpan={rekapData.aspeks?.length + 3}
                        className="h-24 text-center"
                      >
                        Memuat data rekapitulasi...
                      </TableCell>
                    </TableRow>
                  ) : rekapData.rekap?.length > 0 ? (
                    rekapData.rekap.map((s) => (
                      <TableRow key={s.team_id}>
                        <TableCell className="text-center font-bold text-lg">
                          {s.rank}
                        </TableCell>
                        <TableCell className="font-medium">
                          <p>{s.team_name}</p>
                          <p className="text-sm text-muted-foreground font-normal">
                            {s.team_sekolah_instansi}
                          </p>
                        </TableCell>
                        {rekapData.aspeks.map((k) => (
                          <TableCell key={k} className="text-center">
                            {s.scores[k]?.toFixed(2) || "0.00"}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-semibold">
                          {s.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={rekapData.aspeks?.length + 3}
                        className="h-24 text-center"
                      >
                        Belum ada penilaian yang masuk.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Pilih Event Anda</h1>
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
                        Lihat Rekap <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-10">
                  <Frown className="mx-auto h-12 w-12 mb-4" />
                  <p>Anda tidak mengelola event manapun.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
};

export default KoordinatorEventRekapPage;
