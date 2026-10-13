"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Target,
  Zap,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from "lucide-react";
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
      "Terus mengembangkan teknologi untuk menjawab tantangan dan meningkatkan kualitas penyelenggaraan lomba.",
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

// Animasi Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function AboutPage() {
  return (
    <main className="flex-grow bg-white dark:bg-gray-950">
      {/* Section 1: Hero */}
      <PageHeader
        breadcrumb="Tentang Kami"
        title="Meningkatkan Standar Lomba"
        subtitle="Kami percaya bahwa semangat, disiplin, dan sportivitas dalam lomba layak didukung oleh teknologi yang modern, adil, dan transparan."
      />

      {/* Section 2: Our Story */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        {/* Ornamen Latar */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-red-100 dark:bg-red-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4" />
                Kisah Kami
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                Dari Kertas ke Cloud: Kisah Kami
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                KomandoApp lahir dari pengamatan langsung di lapangan. Kami
                melihat panitia yang kewalahan dengan tumpukan kertas, juri yang
                kesulitan merekap nilai, dan peserta yang cemas menunggu hasil
                yang tak kunjung tiba.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Kami memutuskan untuk menciptakan solusi: sebuah platform
                digital yang mengotomatiskan tugas-tugas administratif yang
                melelahkan, sehingga semua orang dapat fokus pada esensi
                lomba—penampilan terbaik dan penilaian yang adil.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 bg-white p-2 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop"
                  alt="Tim Paskibra sedang berdiskusi"
                  width={600}
                  height={400}
                  className="rounded-xl w-full h-auto object-cover aspect-video lg:aspect-[4/3]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: Our Values */}
      <section className="py-20 sm:py-32 bg-gray-50/50 dark:bg-gray-900/20 border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Nilai-Nilai yang Kami Pegang
            </h2>
            <p className="text-lg text-muted-foreground">
              Fondasi utama dalam setiap baris kode yang kami tulis dan layanan
              yang kami berikan kepada ekosistem lomba.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  variants={fadeInUp}
                  className="group relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Hover gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Section 4: CTA */}
      <section className="py-20 sm:py-32 relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-red-600 to-red-800 rounded-[2.5rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden"
          >
            {/* Dekorasi CTA */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl"></div>

            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 drop-shadow-md">
              Mari Bergabung dengan Revolusi Digital Lomba
            </h2>
            <p className="text-lg md:text-xl text-red-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Siap untuk menyelenggarakan event yang lebih profesional,
              transparan, dan efisien?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-50 h-14 px-8 rounded-full text-base font-bold shadow-lg transition-transform hover:-translate-y-1"
              >
                <Link href="/auth/register">
                  Daftarkan Event Anda <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white bg-red-700 hover:bg-white/10 hover:text-white h-14 px-8 rounded-full text-base font-bold backdrop-blur-md transition-transform hover:-translate-y-1"
              >
                <Link href="/contact">Hubungi Kami</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
