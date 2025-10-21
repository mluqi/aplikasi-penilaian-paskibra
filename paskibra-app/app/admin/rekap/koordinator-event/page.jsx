"use client";

import { useState, useEffect } from "react";
import api from "@/service/api";
import { toast } from "sonner";
import Link from "next/link";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const KoordinatorEventRekapPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [rekapData, setRekapData] = useState({ rekap: [], aspeks: [] });
  const [loading, setLoading] = useState(true);

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
        if (myEvents.length > 0) {
          setSelectedEvent(myEvents[0].event_id);
        }
      } catch (error) {
        toast.error("Gagal memuat daftar event Anda.");
      }
    };
    fetchEvents();
  }, [user]);

  useEffect(() => {
    if (!selectedEvent) {
      setLoading(false);
      return;
    }

    const fetchRekap = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/rekap/${selectedEvent}`);
        setRekapData(response.data);
      } catch (error) {
        toast.error("Gagal memuat data rekapitulasi.");
        setRekapData({ rekap: [], aspeks: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchRekap();
  }, [selectedEvent]);

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Rekapitulasi Peringkat</h1>
          <div className="w-full max-w-xs">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Event Anda" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.event_id} value={event.event_id}>
                    {event.event_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
                <TableHead className="text-center font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={rekapData.aspeks?.length + 3}
                    className="h-24 text-center"
                  >
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : rekapData.rekap?.length > 0 ? (
                rekapData.rekap.map((s) => (
                  <TableRow key={s.team_id}>
                    <TableCell className="text-center font-bold text-lg">
                      {s.rank}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/rekap/${selectedEvent}/${s.team_id}`}
                        className="hover:underline"
                      >
                        {s.team_name}
                        <p className="text-sm text-muted-foreground font-normal">
                          {s.team_sekolah_instansi}
                        </p>
                      </Link>
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
      </main>
    </ProtectedRoute>
  );
};

export default KoordinatorEventRekapPage;
