"use client";

import { useState, useEffect, useRef } from "react";
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
  CardContent,
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
import {
  ArrowRight,
  Frown,
  ArrowLeft,
  Printer,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";

const KoordinatorEventRekapPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [rekapData, setRekapData] = useState({ rekap: [], aspeks: [] });
  const [loading, setLoading] = useState(true);
  const [loadingRekap, setLoadingRekap] = useState(false);

  const printTableRef = useRef();
  const handlePrintTable = useReactToPrint({
    contentRef: printTableRef,
    documentTitle: `Rekap_Nilai_Keseluruhan_${activeEvent?.event_name?.replace(/\s+/g, "_") || "Event"}`,
  });

  const handleSetActiveEvent = (event) => {
    setActiveEvent(event);
    const params = new URLSearchParams(searchParams.toString());
    if (event) {
      params.set("event", event.event_id);
    } else {
      params.delete("event");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const eventIdFromUrl = searchParams.get("event");
    if (eventIdFromUrl) {
      if (
        events.length > 0 &&
        (!activeEvent || activeEvent.event_id !== eventIdFromUrl)
      ) {
        const foundEvent = events.find((e) => e.event_id === eventIdFromUrl);
        if (foundEvent) setActiveEvent(foundEvent);
      }
    } else if (activeEvent) {
      setActiveEvent(null);
    }
  }, [events, searchParams, activeEvent]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      try {
        const response = await api.get("/events");
        // Filter events yang dikoordinatori oleh user saat ini
        const myEvents = response.data.events.filter(
          (event) => event.koordinator_id === user.id,
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

  const handleViewTeamDetails = (team) => {
    router.push(`/admin/rekap/${activeEvent.event_id}/detail/${team.team_id}`);
  };

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => handleSetActiveEvent(null)}
                className="w-fit"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Event
              </Button>
              <Button onClick={handlePrintTable} className="w-fit shadow-sm">
                <Printer className="mr-2 h-4 w-4" /> Cetak Rekap Keseluruhan
              </Button>
            </div>

            <div
              ref={printTableRef}
              className="print:p-8 print:bg-white print:text-black"
            >
              <div className="hidden print:block mb-6 text-center border-b pb-4 border-gray-300">
                <h1 className="text-2xl font-bold">Rekap Nilai Keseluruhan</h1>
                <h2 className="text-lg text-gray-700">
                  Event: {activeEvent.event_name}
                </h2>
              </div>
              <h1 className="text-2xl font-semibold mb-4 print:hidden">
                Rekapitulasi Peringkat: {activeEvent.event_name}
              </h1>
              <div className="rounded-lg border print:border-none print:shadow-none">
                <Table className="print:border-collapse print:w-full print:border print:border-gray-300 print:text-[10px]">
                  <TableHeader className="print:bg-gray-100">
                    <TableRow>
                      <TableHead className="text-center w-24 print:border print:border-gray-300 print:text-black font-bold print:p-1 print:h-auto">
                        No. Tampil
                      </TableHead>
                      <TableHead className="print:border print:border-gray-300 print:text-black font-bold print:p-1 print:h-auto">
                        Nama Tim
                      </TableHead>
                      {rekapData.aspeks?.map((k) => (
                        <TableHead
                          key={k}
                          className="text-center print:border print:border-gray-300 print:text-black font-bold print:p-1 print:h-auto"
                        >
                          {k}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingRekap ? (
                      <TableRow>
                        <TableCell
                          colSpan={(rekapData.aspeks?.length || 0) + 2}
                          className="h-24 text-center"
                        >
                          Memuat data rekapitulasi...
                        </TableCell>
                      </TableRow>
                    ) : rekapData.rekap?.length > 0 ? (
                      rekapData.rekap.map((s, index) => (
                        <TableRow
                          key={s.team_id}
                          onClick={() => handleViewTeamDetails(s)}
                          className="cursor-pointer hover:bg-muted/50 print:break-inside-avoid"
                        >
                          <TableCell className="text-center font-bold text-lg print:border print:border-gray-300 print:text-black print:text-[10px] print:p-1">
                            {s.nomor_tampil
                              ? String(s.nomor_tampil).padStart(2, "0")
                              : index + 1}
                          </TableCell>
                          <TableCell className="font-medium print:border print:border-gray-300 print:text-black print:p-1">
                            <p className="print:text-[10px]">{s.team_name}</p>
                            <p className="text-sm text-muted-foreground font-normal print:text-gray-600 print:text-[9px] mt-0.5">
                              {s.team_sekolah_instansi}
                            </p>
                          </TableCell>
                          {rekapData.aspeks.map((k) => (
                            <TableCell
                              key={k}
                              className="text-center print:border print:border-gray-300 print:text-black print:p-1 print:text-[10px]"
                            >
                              {s.scores[k] || "0"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={(rekapData.aspeks?.length || 0) + 2}
                          className="h-24 text-center"
                        >
                          Belum ada penilaian yang masuk.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
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
                    </div>
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
                        onClick={() => handleSetActiveEvent(event)}
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
