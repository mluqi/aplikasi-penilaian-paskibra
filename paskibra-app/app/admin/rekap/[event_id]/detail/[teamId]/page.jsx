"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/service/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowLeft, Printer, Lock, Unlock } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
import useAuth from "@/hooks/useAuth";

const JuriScoreCard = ({ penilaian, onUnlockSuccess }) => (
  <Card className="mb-4 print:shadow-none print:border-gray-300 print:break-inside-avoid print:mb-6">
    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={
            penilaian.User.user_photo
              ? `${process.env.NEXT_PUBLIC_API_URL}${penilaian.User.user_photo}`
              : ""
          }
        />
        <AvatarFallback>{penilaian.User.user_name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold print:text-black">
          {penilaian.User.user_name}
        </p>
        {penilaian.Asisten && (
          <p className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold uppercase tracking-wider mb-1 mt-0.5">
            Diinput oleh Asisten: {penilaian.Asisten.user_name}
          </p>
        )}
        <p className="text-xs text-muted-foreground print:text-gray-600">
          Total Nilai:{" "}
          <span className="font-bold text-foreground print:text-black">
            {parseInt(penilaian.total_nilai, 10)}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2 print:hidden">
        {penilaian.is_lock ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Terkunci
          </Badge>
        ) : (
          <Badge variant="secondary">Sudah Dinilai</Badge>
        )}
        {penilaian.is_lock && onUnlockSuccess && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUnlockSuccess(penilaian.penilaian_id)}
            className="h-7"
          >
            <Unlock className="h-3 w-3 mr-1" />
            Buka
          </Button>
        )}
      </div>
    </CardHeader>
    <CardContent>
      {penilaian.catatan && (
        <blockquote className="mt-2 border-l-2 pl-4 italic text-sm print:text-gray-800 print:border-gray-400">
          "{penilaian.catatan}"
        </blockquote>
      )}
      <Table className="mt-4 print:border print:border-gray-300">
        <TableHeader className="print:bg-gray-100">
          <TableRow>
            <TableHead className="print:text-black font-bold">Aspek</TableHead>
            <TableHead className="print:text-black font-bold">
              Sub-Aspek
            </TableHead>
            <TableHead className="text-right print:text-black font-bold">
              Nilai
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {penilaian.AspekNilais.map((aspekNilai) =>
            aspekNilai.SubAspekNilais.map((subNilai, subIndex) => (
              <TableRow key={subNilai.id}>
                {subIndex === 0 && (
                  <TableCell
                    rowSpan={aspekNilai.SubAspekNilais.length}
                    className="font-semibold align-top print:border-r print:border-gray-300 print:bg-gray-50/50"
                  >
                    <p className="print:text-black">
                      {aspekNilai.Aspek.nama_aspek}
                    </p>
                    <p className="text-xs font-normal text-muted-foreground print:text-gray-600">
                      Nilai Aspek:{" "}
                      <span className="font-bold print:text-black">
                        {parseInt(aspekNilai.nilai_aspek, 10)}
                      </span>
                    </p>
                  </TableCell>
                )}
                <TableCell className="print:text-black print:border-b print:border-gray-200">
                  {subNilai.SubAspek.nama_subaspek}
                </TableCell>
                <TableCell className="text-right font-mono print:text-black print:border-b print:border-gray-200">
                  {parseInt(subNilai.nilai, 10)}
                </TableCell>
              </TableRow>
            )),
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function DetailPenilaianPage() {
  const params = useParams();
  const eventId = params.eventId || params.event_id;
  const teamId = params.teamId || params.team_id;
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [viewingTeamDetails, setViewingTeamDetails] = useState([]);

  const printDetailRef = useRef();
  const handlePrintDetail = useReactToPrint({
    contentRef: printDetailRef,
    documentTitle: `Detail_Penilaian_${teamInfo?.team_name?.replace(/\s+/g, "_") || "Tim"}_${event?.event_name?.replace(/\s+/g, "_") || "Event"}`,
    pageStyle:
      "@page { size: A4 portrait; margin: 10mm; } @media print { body { -webkit-print-color-adjust: exact; } }",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, detailRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/penilaian/detail/${eventId}/${teamId}`),
        ]);

        const eventData = eventRes.data.event;
        setEvent(eventData);

        const teamData = eventData.Event_teams?.find(
          (et) => et.team_id === teamId || et.Team?.team_id === teamId,
        );
        setTeamInfo(teamData?.Team || teamData || { team_name: "Tim" });

        setViewingTeamDetails(detailRes.data.details || []);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat detail penilaian tim.");
      } finally {
        setLoading(false);
      }
    };

    if (eventId && teamId) fetchData();
  }, [eventId, teamId]);

  const handleUnlock = async (penilaianId) => {
    try {
      const response = await api.patch(`/penilaian/unlock/${penilaianId}`);
      toast.success(response.data.message);
      setViewingTeamDetails((prev) =>
        prev.map((p) =>
          p.penilaian_id === penilaianId ? { ...p, is_lock: false } : p,
        ),
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal membuka kunci.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat detail penilaian...</span>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredAccess="view_recap">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 print:hidden">
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
                <BreadcrumbLink href="/admin/rekap">Rekap Nilai</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detail Penilaian Tim</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-2 print:hidden">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Detail Penilaian: {teamInfo?.team_name || "Tim"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rincian skor yang diberikan oleh setiap juri untuk tim ini.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="shadow-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
            <Button
              onClick={() =>
                router.push(`/admin/rekap/${eventId}/team/${teamId}`)
              }
              variant="default"
              className="shadow-sm"
            >
              Halaman Cetak Khusus
            </Button>
            <Button
              onClick={handlePrintDetail}
              variant="outline"
              className="shadow-sm border-primary text-primary hover:bg-primary/5"
            >
              <Printer className="mr-2 h-4 w-4" /> Cetak Cepat
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-border/50 p-4 md:p-6 flex-1 overflow-y-auto">
          <div
            ref={printDetailRef}
            className="print:p-2 print:bg-white print:text-black print:w-full space-y-4"
          >
            <div className="hidden print:block mb-8 border-b pb-4 border-gray-300">
              <h1 className="text-2xl font-bold text-center text-black">
                Detail Penilaian Tim
              </h1>
              <div className="flex justify-between mt-6 text-black">
                <p>
                  <strong>Tim:</strong> {teamInfo?.team_name || "Tim"}
                </p>
                <p>
                  <strong>Event:</strong> {event?.event_name || "Event"}
                </p>
              </div>
            </div>

            {viewingTeamDetails?.length > 0 ? (
              viewingTeamDetails.map((penilaian) => (
                <JuriScoreCard
                  key={penilaian.penilaian_id}
                  penilaian={penilaian}
                  onUnlockSuccess={
                    [
                      "admin",
                      "superadmin",
                      "koordinator_event",
                      "asisten_juri",
                    ].includes(user?.role)
                      ? handleUnlock
                      : undefined
                  }
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Belum ada penilaian untuk tim ini.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
