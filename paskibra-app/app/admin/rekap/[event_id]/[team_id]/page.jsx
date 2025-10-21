"use client";

import React, { useState, useEffect } from "react";
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
import { Trophy, Users } from "lucide-react";
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

const JuriScoreCard = ({ penilaian }) => {
  return (
    <Card>
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
          <CardTitle>{penilaian.User.user_name}</CardTitle>
          <CardDescription>ID Juri: {penilaian.juri_id}</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Nilai</p>
          <p className="text-2xl font-bold">
            {parseFloat(penilaian.total_nilai).toFixed(2)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {penilaian.catatan && (
          <div className="mb-4 border-l-4 border-primary pl-4 italic text-muted-foreground">
            <p>"{penilaian.catatan}"</p>
          </div>
        )}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="detail-skor">
            <AccordionTrigger>Lihat Rincian Skor</AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aspek</TableHead>
                    <TableHead>Sub-Aspek</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
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
                              className="font-semibold align-top"
                            >
                              <p>{aspekNilai.Aspek.nama_aspek}</p>
                              <p className="text-xs font-normal text-muted-foreground">
                                Nilai Aspek:{" "}
                                <span className="font-bold">
                                  {parseFloat(aspekNilai.nilai_aspek).toFixed(
                                    2
                                  )}
                                </span>
                              </p>
                            </TableCell>
                          )}
                          <TableCell>
                            {subNilai.SubAspek.nama_subaspek}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {parseFloat(subNilai.nilai).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

const RekapSummaryCard = ({ summary, aspectSummary }) => {
  if (!summary) {
    return (
      <Card className="bg-muted/50 border-dashed">
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
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle>Ringkasan Nilai Akhir</CardTitle>
        <CardDescription>
          Nilai akhir yang dihitung dari rata-rata semua juri.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Score */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-center p-4 bg-background rounded-lg">
            <Trophy className="h-10 w-10 text-primary mb-2" />
            <p className="text-4xl font-bold">
              {parseFloat(summary.nilai_akhir).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Nilai Akhir</p>
            <p className="text-xs text-muted-foreground mt-2">
              ({summary.jumlah_juri} Juri)
            </p>
          </div>
          {/* Aspect Scores */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {aspectSummary?.map((aspek, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center text-center p-2 bg-background/50 rounded-lg"
              >
                <p className="text-xl font-semibold">
                  {parseFloat(aspek.avg_score).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
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

  useEffect(() => {
    if (!event_id || !team_id) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/penilaian/detail/${event_id}/${team_id}`
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
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold" title={team_id}>
            Detail Penilaian untuk Tim {teamName}
          </h1>
          <p className="text-muted-foreground">Event: {eventName}</p>
        </div>

        {/* Kartu Ringkasan Nilai Akhir */}
        <RekapSummaryCard
          summary={rekapSummary}
          aspectSummary={aspectSummary}
        />

        {loading ? (
          <p>Memuat data...</p>
        ) : penilaianDetails.length > 0 ? (
          <div className="grid gap-6">
            {penilaianDetails.map((penilaian) => (
              <JuriScoreCard
                key={penilaian.penilaian_id}
                penilaian={penilaian}
              />
            ))}
          </div>
        ) : (
          <p>Belum ada juri yang memberikan penilaian untuk tim ini.</p>
        )}
      </main>
    </ProtectedRoute>
  );
}
