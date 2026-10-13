"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import api from "@/service/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Users, Printer, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Badge } from "@/components/ui/badge";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";

const JuriScoreCard = ({ penilaian }) => {
  const ScoreTable = () => (
    <Table className="print:border print:border-gray-300">
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
        {penilaian.AspekNilais.map((aspekNilai, index) => (
          <React.Fragment key={aspekNilai.aspek_id}>
            {aspekNilai.SubAspekNilais.map((subNilai, subIndex) => (
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
            ))}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card className="print:shadow-none print:border-gray-300 print:break-inside-avoid print:mb-6">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
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
          <CardTitle className="print:text-black">
            {penilaian.User.user_name}
          </CardTitle>
          {penilaian.Asisten && (
            <p className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold uppercase tracking-wider mb-1 mt-1">
              Diinput oleh Asisten: {penilaian.Asisten.user_name}
            </p>
          )}
          <CardDescription className="print:text-gray-600">
            ID Juri: {penilaian.juri_id}
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground print:text-gray-600">
            Total Nilai
          </p>
          <p className="text-2xl font-bold print:text-black">
            {parseInt(penilaian.total_nilai, 10)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {penilaian.catatan && (
          <div className="mb-4 border-l-4 border-primary pl-4 italic text-muted-foreground print:text-gray-800 print:border-gray-400">
            <p className="print:text-gray-800">"{penilaian.catatan}"</p>
          </div>
        )}
        <div className="print:hidden">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="detail-skor">
              <AccordionTrigger>Lihat Rincian Skor</AccordionTrigger>
              <AccordionContent>
                <ScoreTable />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="hidden print:block mt-4">
          <p className="font-semibold mb-2 text-black">Rincian Skor:</p>
          <ScoreTable />
        </div>
      </CardContent>
    </Card>
  );
};

const RekapSummaryCard = ({ summary, aspectSummary }) => {
  if (!summary) {
    return (
      <Card className="bg-muted/50 border-dashed print:shadow-none print:border-gray-300">
        <CardHeader>
          <CardTitle>Ringkasan Nilai Akhir</CardTitle>
          <CardDescription>
            Ringkasan nilai akhir akan tersedia setelah ada penilaian yang
            masuk.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary/50 print:bg-gray-50 print:border-gray-300 print:shadow-none print:break-inside-avoid">
      <CardHeader>
        <CardTitle className="print:text-black">
          Ringkasan Nilai Akhir
        </CardTitle>
        <CardDescription className="print:text-gray-600">
          Nilai akhir yang dihitung dari rata-rata semua juri.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Score */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-center p-4 bg-background rounded-lg print:bg-white print:border print:border-gray-200">
            <Trophy className="h-10 w-10 text-primary mb-2" />
            <p className="text-4xl font-bold print:text-black">
              {parseInt(summary.nilai_akhir)}
            </p>
            <p className="text-sm text-muted-foreground print:text-gray-600">
              Nilai Akhir
            </p>
            <p className="text-xs text-muted-foreground mt-2 print:text-gray-500">
              ({summary.jumlah_juri} Juri)
            </p>
          </div>
          {/* Aspect Scores */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {aspectSummary?.map((aspek, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center text-center p-2 bg-background/50 rounded-lg print:bg-white print:border print:border-gray-200"
              >
                <p className="text-xl font-semibold print:text-black">
                  {parseInt(aspek.total_score)}
                </p>
                <p className="text-xs text-muted-foreground print:text-gray-600">
                  {aspek["Aspek.nama_aspek"]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function RekapDetailPage() {
  const params = useParams();
  const { event_id, team_id } = params;
  const [penilaianDetails, setPenilaianDetails] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);
  const [rekapSummary, setRekapSummary] = useState(null);
  const [aspectSummary, setAspectSummary] = useState([]);

  const printRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Detail_Penilaian_${teamName?.replace(/\s+/g, "_") || "Tim"}_${eventName?.replace(/\s+/g, "_") || "Event"}`,
  });

  useEffect(() => {
    if (!event_id || !team_id) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/penilaian/detail/${event_id}/${team_id}`,
        );
        const { details, summary, aspectSummary } = response.data;
        setPenilaianDetails(details);
        setRekapSummary(summary);
        setAspectSummary(aspectSummary);
        if (details.length > 0) {
          setTeamName(details[0].Team.team_name);
          setEventName(details[0].Event.event_name);
        } else {
          // Jika tidak ada data, coba ambil nama dari event/team
          const [eventRes, teamRes] = await Promise.all([
            api.get(`/events/${event_id}`),
            api.get(`/teams/${team_id}`),
          ]);
          setEventName(eventRes.data.event.event_name);
          setTeamName(teamRes.data.team.team_name);
        }
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat detail penilaian.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [event_id, team_id]);

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
                <BreadcrumbLink href="/admin/rekap">Rekap Nilai</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detail Penilaian</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold" title={team_id}>
              Detail Penilaian untuk Tim {teamName}
            </h1>
            <p className="text-muted-foreground">Event: {eventName}</p>
          </div>
          <Button
            onClick={handlePrint}
            className="w-fit shadow-sm"
            variant="outline"
          >
            <Printer className="mr-2 h-4 w-4" /> Cetak Detail (PDF)
          </Button>
        </div>

        <div
          ref={printRef}
          className="print:p-8 print:bg-white print:text-black"
        >
          <div className="hidden print:block mb-8 border-b pb-4">
            <h1 className="text-2xl font-bold text-center text-black">
              Detail Penilaian Tim
            </h1>
            <div className="flex justify-between mt-6 text-black">
              <p>
                <strong>Tim:</strong> {teamName}
              </p>
              <p>
                <strong>Event:</strong> {eventName}
              </p>
            </div>
          </div>

          {/* Kartu Ringkasan Nilai Akhir */}
          <RekapSummaryCard
            summary={rekapSummary}
            aspectSummary={aspectSummary}
          />

          {loading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent print:hidden">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground font-medium animate-pulse">
                Memuat data...
              </p>
            </div>
          ) : penilaianDetails.length > 0 ? (
            <div className="grid gap-6 mt-6">
              {penilaianDetails.map((penilaian) => (
                <JuriScoreCard
                  key={penilaian.penilaian_id}
                  penilaian={penilaian}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4">
              Belum ada juri yang memberikan penilaian untuk tim ini.
            </p>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
