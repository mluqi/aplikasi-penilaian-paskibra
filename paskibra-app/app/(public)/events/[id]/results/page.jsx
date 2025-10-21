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
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import Image from "next/image";

async function getRekapData(eventId) {
  const apiUrl =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
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

  const { event, rekap, aspeks } = data;

  return (
    <main className="flex-grow bg-white dark:bg-gray-900">
      <section className="relative pt-32 lg:pt-26 text-center">
        <div className="container mx-auto px-4 relative">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
            Hasil Akhir{" "}
            <span className="text-red-600 dark:text-red-400">
              {event.event_name}
            </span>
          </h1>
        </div>
      </section>
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-0">
              {/* Tampilan Tabel untuk Desktop */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24 text-center">
                        Peringkat
                      </TableHead>
                      <TableHead>Nama Tim</TableHead>
                      {aspeks?.map((aspekName) => (
                        <TableHead key={aspekName} className="text-center">
                          {aspekName}
                        </TableHead>
                      ))}
                      <TableHead className="w-48 text-right">
                        Nilai Akhir
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekap.length > 0 ? (
                      rekap.map((item, index) => (
                        <TableRow
                          key={item.team_id}
                          className={
                            index < 3
                              ? "bg-yellow-50/50 dark:bg-yellow-900/10"
                              : ""
                          }
                        >
                          <TableCell className="text-center font-bold text-lg">
                            <div className="flex items-center justify-center gap-2">
                              {index < 3 && (
                                <Trophy
                                  className={`h-5 w-5 ${
                                    index === 0
                                      ? "text-yellow-500"
                                      : index === 1
                                      ? "text-gray-400"
                                      : "text-yellow-700"
                                  }`}
                                />
                              )}
                              {item.rank}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium flex items-center gap-3">
                            {item.Team.team_logo && (
                              <Image
                                src={`${process.env.NEXT_PUBLIC_API_URL}${item.Team.team_logo}`}
                                alt={`${item.Team.team_name} Logo`}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            )}
                            <div className="flex flex-col">
                              <p>{item.Team.team_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.Team.team_sekolah_instansi}
                              </p>
                            </div>
                          </TableCell>
                          {aspeks?.map((aspekName) => (
                            <TableCell
                              key={aspekName}
                              className="text-center font-mono"
                            >
                              {(item.scores?.[aspekName] || 0).toFixed(2)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-semibold text-lg">
                            {parseFloat(item.nilai_akhir).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={aspeks.length + 3}
                          className="h-24 text-center"
                        >
                          Hasil rekapitulasi belum tersedia.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Tampilan Accordion untuk Mobile */}
              <div className="block lg:hidden">
                {rekap.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {rekap.map((item, index) => (
                      <AccordionItem
                        key={item.team_id}
                        value={`item-${index}`}
                        className={
                          index < 3
                            ? "bg-yellow-50/50 dark:bg-yellow-900/10"
                            : ""
                        }
                      >
                        <AccordionTrigger className="px-4 py-3 text-left">
                          <div className="flex items-center gap-4 w-full">
                            <div className="flex items-center justify-center gap-2 font-bold text-lg w-16">
                              {index < 3 && (
                                <Trophy
                                  className={`h-5 w-5 ${
                                    index === 0
                                      ? "text-yellow-500"
                                      : index === 1
                                      ? "text-gray-400"
                                      : "text-yellow-700"
                                  }`}
                                />
                              )}
                              {item.rank}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {item.Team.team_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.Team.team_sekolah_instansi}
                              </p>
                            </div>
                            <div className="text-right font-semibold text-lg pr-2">
                              {parseFloat(item.nilai_akhir).toFixed(2)}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 border-t pt-4">
                          <ul className="space-y-2">
                            {aspeks?.map((aspekName) => (
                              <li
                                key={aspekName}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="text-muted-foreground">
                                  {aspekName}
                                </span>
                                <span className="font-mono font-medium">
                                  {(item.scores?.[aspekName] || 0).toFixed(2)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="h-24 text-center flex items-center justify-center">
                    Hasil rekapitulasi belum tersedia.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
