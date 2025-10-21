import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Target, Zap, Lightbulb, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";

const values = [
  {
    icon: ShieldCheck,
    title: "Integritas & Akurasi",
    description:
      "Menjunjung tinggi kejujuran dan ketepatan data dalam setiap penilaian untuk hasil yang dapat dipercaya.",
  },
  {
    icon: Zap,
    title: "Efisiensi & Kecepatan",
    description:
      "Menyederhanakan proses yang rumit, dari pendaftaran hingga rekapitulasi, untuk menghemat waktu dan tenaga.",
  },
  {
    icon: Target,
    title: "Transparansi",
    description:
      "Memberikan akses informasi yang jelas dan terbuka bagi semua pihak yang terlibat untuk membangun kepercayaan.",
  },
  {
    icon: Lightbulb,
    title: "Inovasi Berkelanjutan",
    description:
      "Terus mengembangkan teknologi untuk menjawab tantangan dan meningkatkan kualitas penyelenggaraan lomba Paskibra.",
  },
];

const teamMembers = [
  {
    name: "Luqi",
    role: "Founder & Lead Developer",
    avatar: "/images/avatars/avatar-1.png", // Ganti dengan path gambar yang sesuai
  },
  {
    name: "Tim Palindo",
    role: "Design & Product",
    avatar: "/images/avatars/avatar-2.png", // Ganti dengan path gambar yang sesuai
  },
];

export default function AboutPage() {
  return (
    <main className="flex-grow">
      {/* Section 1: Hero */}
      <PageHeader
        breadcrumb="Tentang Kami"
        title="Meningkatkan Standar Lomba Paskibra"
        subtitle="Kami percaya bahwa semangat, disiplin, dan sportivitas dalam Paskibra layak didukung oleh teknologi yang modern, adil, dan transparan."
      />

      {/* Section 2: Our Story */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Dari Kertas ke Cloud: Kisah Kami
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                PaskibraApp lahir dari pengamatan langsung di lapangan. Kami
                melihat panitia yang kewalahan dengan tumpukan kertas, juri yang
                kesulitan merekap nilai, dan peserta yang cemas menunggu hasil
                yang tak kunjung tiba.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Kami memutuskan untuk menciptakan solusi: sebuah platform
                digital yang mengotomatiskan tugas-tugas administratif yang
                melelahkan, sehingga semua orang dapat fokus pada esensi
                lomba—penampilan terbaik dan penilaian yang adil.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <Image
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop" // Ganti dengan gambar yang relevan
                alt="Tim Paskibra sedang berdiskusi"
                width={600}
                height={400}
                className="rounded-lg shadow-xl w-full h-auto object-cover aspect-video lg:aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Our Values */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Nilai-Nilai yang Kami Pegang
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center p-4">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <Icon className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4: CTA */}
      <section className="py-20 sm:py-32 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Mari Bergabung dengan Revolusi Digital Paskibra
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Siap untuk menyelenggarakan event yang lebih profesional dan
            efisien?
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/register">Daftarkan Event Anda</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Hubungi Kami</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
