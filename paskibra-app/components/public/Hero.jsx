import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlayCircle, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-48 lg:pb-28 bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-100/50 dark:bg-red-900/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-full">
              Revolusi Penjurian Digital
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              Platform Penjurian Paskibra{" "}
              <span className="text-red-600 dark:text-red-400">
                Modern & Terpercaya
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 mb-10">
              Manajemen event, pendaftaran tim, hingga rekapitulasi nilai
              real-time. Semua dalam satu aplikasi yang efisien dan transparan.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="group">
                <Link href="/auth/login?tab=register">
                  Daftarkan Event Anda
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group">
                <Link href="#how-it-works">
                  <PlayCircle className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  Lihat Cara Kerja
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Side - Image/Mockup */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-lg">
              <Image
                src="https://gdb.voanews.com/01000000-0aff-0242-fabd-08db9ec4c17e_w1023_r1_s.jpg" // Ganti dengan path gambar mockup Anda
                alt="PaskibraApp Mockup"
                width={1200}
                height={800}
                className="rounded-lg shadow-2xl transform transition-transform duration-500 hover:scale-105"
                priority
              />
              <div className="absolute -bottom-4 -right-4 w-full h-full border-4 border-red-600/20 rounded-lg -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
