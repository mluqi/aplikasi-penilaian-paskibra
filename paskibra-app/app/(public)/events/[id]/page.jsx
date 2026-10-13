import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Building2,
  Hourglass,
  Phone,
  Info,
  Users,
  Gavel,
  ListChecks,
  FileText,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShareButtons from "@/components/shared/ShareButtons";
import TeamList from "./TeamList";
import EventResultsSection from "@/components/public/EventResultsSection";

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
};

const kategoriOptions = [
  { value: "sd", label: "SD/Sederajat" },
  { value: "smp", label: "SMP/Sederajat" },
  { value: "sma_smk", label: "SMA/Sederajat" },
  { value: "umum", label: "Umum/Purna" },
];

const getKategoriLabel = (value) => {
  const option = kategoriOptions.find((opt) => opt.value === value);
  return option ? option.label : value; // fallback ke value jika tidak ditemukan
};

const getCountdownText = (targetDateStr) => {
  if (!targetDateStr) return null;
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays} hari lagi`;
  if (diffDays === 0) return "Hari ini";
  return "Selesai";
};

// Fungsi untuk mengambil data event berdasarkan ID
async function getEventById(id) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await fetch(`${apiUrl}/api/events/public/${id}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return null; // Akan ditangani sebagai notFound di komponen
    }
    const data = await response.json();
    return data.event;
  } catch (error) {
    console.error("Error fetching event detail:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: "Event Tidak Ditemukan",
      description:
        "Event yang Anda cari tidak ditemukan atau belum dipublikasikan.",
    };
  }

  return {
    title: `${event.event_name} | KomandoApp`,
    description: event.event_deskripsi.substring(0, 160), // Potong untuk meta description
    openGraph: {
      title: event.event_name,
      description: event.event_deskripsi.substring(0, 160),
      images: [
        {
          url: event.event_poster
            ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
            : "/default-poster.png",
          width: 1200,
          height: 630,
          alt: `Poster ${event.event_name}`,
        },
      ],
      locale: "id_ID",
      type: "website",
    },
  };
}

export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  const posterUrl = event.event_poster
    ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
    : "/default-poster.png";

  // Validasi apakah waktu saat ini sudah melewati batas pendaftaran
  const isRegistrationClosed = event.event_batas_pendaftaran
    ? new Date() > new Date(event.event_batas_pendaftaran)
    : false;

  // Validasi apakah kuota penuh
  const isQuotaFull = event.event_kuota
    ? event.Event_teams?.length >= event.event_kuota
    : false;

  const now = new Date();
  const donasiMulai = event.donasi_mulai ? new Date(event.donasi_mulai) : null;
  const donasiSelesai = event.donasi_selesai
    ? new Date(event.donasi_selesai)
    : null;

  const isDonationPeriodActive =
    donasiMulai && donasiSelesai
      ? now >= donasiMulai && now <= donasiSelesai
      : true;

  const hasActiveDonation = Boolean(event.xenplatform_id);

  const sortedTeams = [...(event.Event_teams || [])].sort((a, b) => {
    if (hasActiveDonation) {
      const balanceDiff = (Number(b.balance) || 0) - (Number(a.balance) || 0);
      if (balanceDiff !== 0) return balanceDiff;
    }
    return a.Team.team_name.localeCompare(b.Team.team_name);
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-gray-950 selection:bg-red-500/30">
      <main className="flex-grow">
        {/* Banner */}
        <section className="relative w-full h-[55vh] md:h-[65vh] lg:h-[75vh] overflow-hidden bg-gray-900 flex items-end">
          <Image
            src={posterUrl}
            alt={`Poster ${event.event_name}`}
            fill
            className="object-cover opacity-30 blur-xl scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] dark:from-gray-950 via-[#F8FAFC]/40 dark:via-gray-950/40 to-transparent" />

          <div className="container relative z-10 mx-auto px-4 pb-10 md:pb-16 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
            {/* Poster Thumbnail for Desktop */}
            <div className="hidden md:block relative w-64 h-[22rem] lg:w-80 lg:h-[28rem] rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border-[6px] border-white/10 dark:border-white/5 flex-shrink-0 bg-gray-100 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src={posterUrl}
                fill
                className="object-cover bg-white"
                alt="Poster Thumbnail"
              />
            </div>

            {/* Title & Badges Overlay */}
            <div className="text-white pb-2 lg:pb-6 text-center md:text-left w-full">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-5">
                {event.event_kategori && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium rounded-full shadow-sm">
                    {getKategoriLabel(event.event_kategori)}
                  </Badge>
                )}
                {event.event_tingkat && (
                  <Badge
                    variant="outline"
                    className="text-white border-white/30 bg-black/20 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium rounded-full"
                  >
                    {capitalize(event.event_tingkat)}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 drop-shadow-xl leading-tight tracking-tight text-gray-50">
                {event.event_name}
              </h1>
              <p className="text-gray-200 text-base md:text-xl flex items-center justify-center md:justify-start gap-2.5 drop-shadow-md font-medium">
                <MapPin className="h-5 w-5 text-red-400" /> {event.event_kota},{" "}
                <span className="opacity-80">{event.event_provinsi}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
            {/* LEFT COLUMN: Deskripsi & Tabel Peserta */}
            <div className="lg:col-span-2 space-y-8 xl:space-y-10">
              {/* Deskripsi Event */}
              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/60 dark:border-gray-800/60 p-6 md:p-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <Info className="text-red-600 dark:text-red-400 h-6 w-6" />
                  </div>
                  Deskripsi Event
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed text-[15px] md:text-base">
                  {event.event_deskripsi.split("\n").map((paragraph, index) =>
                    paragraph.trim() ? (
                      <p key={index} className="mb-5 text-justify">
                        {paragraph}
                      </p>
                    ) : (
                      <br key={index} />
                    ),
                  )}
                </div>
              </div>

              {/* Kriteria Penilaian */}
              {event.Aspeks && event.Aspeks.length > 0 && (
                <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/60 dark:border-gray-800/60 p-6 md:p-10">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                    <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                      <ListChecks className="text-orange-600 dark:text-orange-400 h-6 w-6" />
                    </div>
                    Kriteria Penilaian
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {event.Aspeks.map((aspek, idx) => (
                      <div
                        key={idx}
                        className="group flex justify-between items-center p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors"
                      >
                        <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {aspek.nama_aspek}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dewan Juri */}
              {event.Event_juris && event.Event_juris.length > 0 && (
                <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/60 dark:border-gray-800/60 p-6 md:p-10">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                      <Gavel className="text-blue-600 dark:text-blue-400 h-6 w-6" />
                    </div>
                    Dewan Juri
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                    {event.Event_juris.map((juri, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-300"
                      >
                        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold overflow-hidden shrink-0 shadow-inner">
                          {juri.User?.user_photo ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}${juri.User.user_photo}`}
                              alt={juri.User?.user_name}
                              width={56}
                              height={56}
                              className="object-cover w-full h-full bg-white"
                            />
                          ) : (
                            juri.User?.user_name?.charAt(0).toUpperCase() || "J"
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white line-clamp-1">
                            {juri.User?.user_name}
                          </p>
                          <p className="text-sm font-medium text-blue-600/80 dark:text-blue-400/80 mt-0.5">
                            {juri.Aspeks && juri.Aspeks.length > 0
                              ? juri.Aspeks.map((a) => a.nama_aspek).join(", ")
                              : "Juri Penilai"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Juknis Section */}
              {event.event_juknis && (
                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30 p-6 md:p-10 relative overflow-hidden">
                  {/* Decoration */}
                  <div className="absolute -right-6 -top-6 text-red-500/5 dark:text-red-500/10">
                    <FileText className="w-48 h-48" />
                  </div>

                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-red-900 dark:text-red-100">
                      <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-md">
                        <FileText className="h-6 w-6" />
                      </div>
                      Petunjuk Teknis (Juknis)
                    </h2>
                    <p className="text-red-800/80 dark:text-red-200/80 mb-6 leading-relaxed max-w-2xl">
                      Unduh file petunjuk teknis pelaksanaan kompetisi ini untuk
                      mengetahui detail persyaratan, aturan perlombaan, dan tata
                      tertib acara secara lengkap.
                    </p>
                    <Button
                      asChild
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 h-12 text-base font-semibold shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5"
                    >
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}${event.event_juknis}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download File Juknis
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Daftar Tim Peserta */}
              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/60 dark:border-gray-800/60 p-6 md:p-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                    <Users className="text-emerald-600 dark:text-emerald-400 h-6 w-6" />
                  </div>
                  {hasActiveDonation
                    ? "Peserta & Dukungan"
                    : "Daftar Tim Peserta"}
                </h2>
                <TeamList
                  sortedTeams={sortedTeams}
                  hasActiveDonation={hasActiveDonation}
                  event={event}
                  isDonationPeriodActive={isDonationPeriodActive}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Sidebar Info & Actions */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
              {/* Mobile Poster (Hanya tampil di HP karena di desktop sudah ada thumbnail di banner) */}
              <div className="md:hidden relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border-4 border-white dark:border-gray-800 mb-8 mx-auto max-w-sm">
                <Image
                  src={posterUrl}
                  fill
                  className="object-cover"
                  alt="Poster"
                />
              </div>

              {/* Main Action Card */}
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <div className="mb-8 text-center">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">
                    Biaya Pendaftaran
                  </p>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-orange-500 dark:from-red-400 dark:to-orange-400 drop-shadow-sm">
                    {event.event_biaya_pendaftaran === 0
                      ? "Gratis"
                      : new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(event.event_biaya_pendaftaran)}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {isRegistrationClosed ? (
                    <Button
                      size="lg"
                      disabled
                      className="w-full h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 shadow-none cursor-not-allowed font-bold"
                    >
                      Pendaftaran Ditutup
                    </Button>
                  ) : isQuotaFull ? (
                    <Button
                      size="lg"
                      disabled
                      className="w-full h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 shadow-none cursor-not-allowed font-bold"
                    >
                      Kuota Penuh
                    </Button>
                  ) : (
                    <Link
                      href="/auth/login"
                      className={buttonVariants({
                        size: "lg",
                        className:
                          "w-full h-14 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-base shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/30 transition-all hover:-translate-y-0.5",
                      })}
                    >
                      Daftar Sekarang
                    </Link>
                  )}

                  {event.is_result_show ? (
                    <Link
                      href={`/events/${event.event_id}/results`}
                      className={buttonVariants({
                        size: "lg",
                        variant: "outline",
                        className:
                          "w-full h-14 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 font-bold transition-all",
                      })}
                    >
                      Lihat Hasil Klasemen
                    </Link>
                  ) : (
                    <Button
                      size="lg"
                      variant="outline"
                      disabled
                      className="w-full h-14 rounded-2xl border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-500 cursor-not-allowed shadow-none font-bold"
                    >
                      Hasil Klasemen Belum Tersedia
                    </Button>
                  )}
                </div>

                {/* Info List */}
                <div className="space-y-5 text-[15px]">
                  {/* Pelaksanaan */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0 border border-gray-100 dark:border-gray-700">
                      <Calendar className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-gray-900 dark:text-white mb-0.5 leading-none">
                        Pelaksanaan
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {new Date(event.event_tanggal).toLocaleDateString(
                          "id-ID",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                        <span className="ml-2 font-bold text-red-500 dark:text-red-400">
                          ({getCountdownText(event.event_tanggal)})
                        </span>
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 opacity-70" /> Pukul{" "}
                        {event.event_waktu} WIB
                      </p>
                    </div>
                  </div>

                  {/* Tempat */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0 border border-gray-100 dark:border-gray-700">
                      <MapPin className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-gray-900 dark:text-white mb-0.5 leading-none">
                        Lokasi
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {event.event_tempat}
                      </p>
                    </div>
                  </div>

                  {/* Penyelenggara */}
                  {event.event_penyelenggara && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0 border border-gray-100 dark:border-gray-700">
                        <Building2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="pt-1">
                        <p className="font-bold text-gray-900 dark:text-white mb-0.5 leading-none">
                          Penyelenggara
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          {event.event_penyelenggara}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Batas Pendaftaran */}
                  {event.event_batas_pendaftaran && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0 border border-gray-100 dark:border-gray-700">
                        <Hourglass className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="pt-1">
                        <p className="font-bold text-gray-900 dark:text-white mb-0.5 leading-none">
                          Batas Pendaftaran
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          {new Date(
                            event.event_batas_pendaftaran,
                          ).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          <span className="ml-2 font-bold text-purple-500 dark:text-purple-400">
                            ({getCountdownText(event.event_batas_pendaftaran)})
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Kontak */}
                  {(event.event_contact_person_name ||
                    event.event_contact_person_number) && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0 border border-gray-100 dark:border-gray-700">
                        <Phone className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="pt-1">
                        <p className="font-bold text-gray-900 dark:text-white mb-0.5 leading-none">
                          Contact Person
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          {event.event_contact_person_name || "Panitia"}
                        </p>
                        {event.event_contact_person_number && (
                          <a
                            href={`https://wa.me/${event.event_contact_person_number.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline font-semibold inline-flex mt-0.5 text-sm"
                          >
                            {event.event_contact_person_number}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Kepesertaan / Kuota */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0 border border-gray-100 dark:border-gray-700">
                      <Users className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="pt-1 w-full">
                      <p className="font-bold text-gray-900 dark:text-white mb-0.5 leading-none flex items-center justify-between">
                        Kepesertaan
                        <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-gray-500">
                          {event.event_kuota
                            ? `${event.event_kuota} Max`
                            : "Tanpa Batas"}
                        </span>
                      </p>

                      <div className="mt-2.5">
                        <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                          <span>
                            {event.Event_teams?.length || 0} Terdaftar
                          </span>
                          {event.event_kuota && (
                            <span>
                              Sisa{" "}
                              {Math.max(
                                0,
                                event.event_kuota -
                                  (event.Event_teams?.length || 0),
                              )}
                            </span>
                          )}
                        </div>
                        {event.event_kuota && (
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(100, ((event.Event_teams?.length || 0) / event.event_kuota) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-7 border-gray-100 dark:border-gray-800" />

                {/* Share Section */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                    Bagikan Event:
                  </span>
                  <ShareButtons title={event.event_name} />
                </div>
              </div>

              {/* Back Button Desktop */}
              <Link
                href="/events"
                className={buttonVariants({
                  variant: "ghost",
                  className:
                    "w-full h-12 rounded-xl font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
                })}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Event
              </Link>
            </div>
          </div>
          {/* Section Hasil Klasemen */}
          <div id="hasil-klasemen" className="mt-16">
            {event.is_result_show && (
              <EventResultsSection eventId={id} event={event} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
