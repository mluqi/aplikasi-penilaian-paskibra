import { notFound } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Heart, Award, Medal, Crown } from "lucide-react";
import Image from "next/image";
import DonationModal from "../DonationModal";

async function getRekapData(eventId) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await fetch(`${apiUrl}/api/rekap/public/${eventId}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching rekap data:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const data = await getRekapData(params.id);

  if (!data?.event) {
    return {
      title: "Hasil Event Tidak Ditemukan",
    };
  }

  return {
    title: `Hasil Akhir ${data.event.event_name} | PaskibraApp`,
    description: `Lihat peringkat akhir dan rekapitulasi nilai untuk event ${data.event.event_name}.`,
  };
}

export default async function EventResultsPage({ params }) {
  const { id: eventId } = params;
  const data = await getRekapData(eventId);

  if (!data) {
    notFound();
  }

  const { event, rekap, aspeks, donasi } = data;

  // Cek apakah ada minimal 1 tim yang akun XenPlatform-nya sudah aktif
  const hasActiveDonation =
    donasi && donasi.some((item) => item.xenplatform_id);

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 1:
        return <Medal className="h-6 w-6 text-slate-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (index) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg shadow-yellow-400/30";
      case 1:
        return "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 shadow-lg shadow-slate-400/30";
      case 2:
        return "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30";
      default:
        return "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 lg:pt-28 lg:pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-950/20 pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium mb-6">
              <Trophy className="h-4 w-4" />
              Hasil Akhir
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
              {event.event_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Klasemen final dan rekapitulasi penilaian
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div
            className={`grid grid-cols-1 ${
              hasActiveDonation ? "lg:grid-cols-3" : ""
            } gap-6 items-start`}
          >
            {/* KLASEMEN PENILAIAN */}
            <div className={hasActiveDonation ? "lg:col-span-2" : ""}>
              <Card className="overflow-hidden border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800/50 backdrop-blur">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-700 pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                      <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    Klasemen Akhir
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                          <TableHead className="w-20 text-center font-semibold">
                            Rank
                          </TableHead>
                          <TableHead className="font-semibold">Tim</TableHead>
                          {aspeks?.map((aspekName) => (
                            <TableHead
                              key={aspekName}
                              className="text-center font-semibold"
                            >
                              {aspekName}
                            </TableHead>
                          ))}
                          <TableHead className="w-32 text-right font-semibold">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rekap.length > 0 ? (
                          rekap.map((item, index) => (
                            <TableRow
                              key={item.team_id}
                              className={`
                                transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50
                                ${
                                  index < 3
                                    ? "bg-gradient-to-r from-yellow-50/50 via-transparent to-transparent dark:from-yellow-900/10"
                                    : ""
                                }
                              `}
                            >
                              <TableCell className="text-center py-6">
                                <div className="flex items-center justify-center gap-2">
                                  <div
                                    className={`
                                    flex items-center justify-center w-10 h-10 rounded-full font-bold text-base
                                    ${getRankBadgeColor(index)}
                                  `}
                                  >
                                    {item.rank}
                                  </div>
                                  {getRankIcon(index)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-4 py-2">
                                  {item.Team.team_logo && (
                                    <div className="relative">
                                      <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${item.Team.team_logo}`}
                                        alt={`${item.Team.team_name} Logo`}
                                        width={48}
                                        height={48}
                                        className="rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                                      />
                                      {index < 3 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                          {getRankIcon(index)}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex flex-col">
                                    <p className="font-semibold text-gray-900 dark:text-white text-base">
                                      {item.Team.team_name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {item.Team.team_sekolah_instansi}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              {aspeks?.map((aspekName) => (
                                <TableCell
                                  key={aspekName}
                                  className="text-center"
                                >
                                  <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono text-sm font-medium">
                                    {(item.scores?.[aspekName] || 0).toFixed(2)}
                                  </span>
                                </TableCell>
                              ))}
                              <TableCell className="text-right">
                                <div className="inline-flex px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg shadow-md">
                                  {parseFloat(item.nilai_akhir).toFixed(2)}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={aspeks.length + 3}
                              className="h-32 text-center text-gray-500 dark:text-gray-400"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <Trophy className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                                <p>Hasil rekapitulasi belum tersedia</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Accordion View */}
                  <div className="block lg:hidden">
                    {rekap.length > 0 ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {rekap.map((item, index) => (
                          <div
                            key={item.team_id}
                            className={`
                              p-4 transition-all
                              ${
                                index < 3
                                  ? "bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10"
                                  : ""
                              }
                            `}
                          >
                            <Accordion type="single" collapsible>
                              <AccordionItem
                                value={`item-${index}`}
                                className="border-0"
                              >
                                <AccordionTrigger className="hover:no-underline py-0">
                                  <div className="flex items-center gap-4 w-full">
                                    {/* Rank Badge */}
                                    <div className="flex-shrink-0">
                                      <div
                                        className={`
                                        flex items-center justify-center w-12 h-12 rounded-full font-bold
                                        ${getRankBadgeColor(index)}
                                      `}
                                      >
                                        {item.rank}
                                      </div>
                                    </div>

                                    {/* Team Info */}
                                    <div className="flex-1 text-left min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        {item.Team.team_logo && (
                                          <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}${item.Team.team_logo}`}
                                            alt={`${item.Team.team_name} Logo`}
                                            width={32}
                                            height={32}
                                            className="rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                                          />
                                        )}
                                        {index < 3 && getRankIcon(index)}
                                      </div>
                                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                        {item.Team.team_name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {item.Team.team_sekolah_instansi}
                                      </p>
                                    </div>

                                    {/* Score */}
                                    <div className="flex-shrink-0">
                                      <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-base shadow-sm">
                                        {parseFloat(item.nilai_akhir).toFixed(
                                          2
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </AccordionTrigger>

                                <AccordionContent className="pt-4 pb-2">
                                  <div className="grid grid-cols-2 gap-3">
                                    {aspeks?.map((aspekName) => (
                                      <div
                                        key={aspekName}
                                        className="flex flex-col gap-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                                      >
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                          {aspekName}
                                        </span>
                                        <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                                          {(
                                            item.scores?.[aspekName] || 0
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-32 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 gap-2">
                        <Trophy className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <p>Hasil rekapitulasi belum tersedia</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KLASEMEN DONASI */}
            {hasActiveDonation && (
              <div className="lg:col-span-1">
                <Card className="overflow-hidden border-0 shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800/50 backdrop-blur sticky top-6">
                  <CardHeader className="bg-gradient-to-r from-pink-50 to-white dark:from-pink-900/20 dark:to-gray-800/50 border-b border-pink-200 dark:border-pink-800 pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold">
                      <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                        <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <div className="text-gray-900 dark:text-white">
                          Beri Dukungan
                        </div>
                        <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          Dukung tim favorit Anda
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4">
                    {donasi && donasi.length > 0 ? (
                      <div className="space-y-3">
                        {donasi.map((item, index) => (
                          <div
                            key={item.team_id}
                            className={`
                              group p-4 rounded-xl border transition-all hover:shadow-md
                              ${
                                index < 3
                                  ? "bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/10 dark:to-transparent border-pink-200 dark:border-pink-800"
                                  : "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                              }
                            `}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-sm text-gray-700 dark:text-gray-300">
                                {index + 1}
                              </div>
                              {item.Team.team_logo && (
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_API_URL}${item.Team.team_logo}`}
                                  alt={`${item.Team.team_name} Logo`}
                                  width={40}
                                  height={40}
                                  className="rounded-full ring-2 ring-pink-200 dark:ring-pink-800"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                  {item.Team.team_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {item.Team.team_sekolah_instansi}
                                </p>
                              </div>
                            </div>
                            {item.xenplatform_id && (
                              <DonationModal
                                eventId={event.event_id}
                                teamId={item.team_id}
                                teamName={item.Team.team_name}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 gap-2">
                        <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm text-center">
                          Belum ada data dukungan
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}