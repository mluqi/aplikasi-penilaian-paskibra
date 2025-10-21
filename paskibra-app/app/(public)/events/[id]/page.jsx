import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShareButtons from "@/components/shared/ShareButtons";

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
};

const kategoriOptions = [
  { value: "smp", label: "SMP/Sederajat" },
  { value: "sma_smk", label: "SMA/Sederajat" },
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "umum", label: "Umum" },
];

const getKategoriLabel = (value) => {
  const option = kategoriOptions.find((opt) => opt.value === value);
  return option ? option.label : value; // fallback ke value jika tidak ditemukan
};

// Fungsi untuk mengambil data event berdasarkan ID
async function getEventById(id) {
  const apiUrl =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
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
    title: `${event.event_name} | PaskibraApp`,
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

  // Jika event tidak ditemukan (baik karena ID salah atau status bukan 'published'), tampilkan 404
  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <main className="flex-grow">
        {/* Banner Gambar */}
        <section className="relative h-64 md:h-96 w-full">
          <Image
            src={
              event.event_poster
                ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                : "/default-poster.png"
            }
            alt={`Poster ${event.event_name}`}
            layout="fill"
            objectFit="cover"
            className="opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent dark:from-gray-900 to-transparent"></div>
        </section>

        {/* Konten Detail */}
        <section className="container mx-auto px-4 -mt-24 md:-mt-32 pb-24">
          <div className="relative max-w-4xl mx-auto bg-card p-6 sm:p-8 rounded-2xl shadow-lg border border-border/50">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Poster Kecil */}
              <div className="w-full md:w-1/3 flex-shrink-0">
                <Image
                  src={
                    event.event_poster
                      ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                      : "/default-poster.png"
                  }
                  alt={`Poster ${event.event_name}`}
                  width={400}
                  height={600}
                  className="rounded-lg shadow-md w-full"
                />
              </div>

              {/* Informasi Event */}
              <div className="w-full md:w-2/3">
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.event_kategori && (
                    <Badge variant="destructive">
                      {getKategoriLabel(event.event_kategori)}
                    </Badge>
                  )}
                  {event.event_tingkat && (
                    <Badge variant="secondary">
                      {capitalize(event.event_tingkat)}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {event.event_name}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {event.event_kota}, {event.event_provinsi}
                </p>
                <div className="space-y-3 text-muted-foreground mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>
                      {new Date(event.event_tanggal).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Pukul {event.event_waktu} WIB - Selesai</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{event.event_tempat}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span>
                      Biaya Pendaftaran:{" "}
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(event.event_biaya_pendaftaran)}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Deskripsi Event
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {event.event_deskripsi}
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center justify-between gap-2 flex-grow sm:flex-row">
                    <Link
                      href="/auth/login"
                      className={buttonVariants({
                        size: "lg",
                        className: "w-full sm:w-auto",
                      })}
                    >
                      Daftar Sekarang
                    </Link>
                  </div>
                  <div className="flex flex-row gap-2 items-center justify-between sm:flex-row">
                    <Link
                      href="/events"
                      className={buttonVariants({
                        size: "lg",
                        variant: "outline",
                        className: "w-full sm:w-auto",
                      })}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali ke Daftar Event
                    </Link>
                    <Link
                      href={`/events/${event.event_id}/results`}
                      className={buttonVariants({
                        size: "lg",
                        variant: "outline",
                        className: "w-full sm:w-auto",
                      })}
                    >
                      Lihat Hasil Akhir
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <p className="text-sm font-semibold text-muted-foreground">
                      Bagikan Event:
                    </p>
                    <ShareButtons title={event.event_name} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
