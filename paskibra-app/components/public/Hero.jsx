import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlayCircle, ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-red-50/30 to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-gradient-to-br from-red-400/30 to-pink-400/30 dark:from-red-600/20 dark:to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 dark:from-blue-600/20 dark:to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"></div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="relative z-10 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg border border-red-100 dark:border-red-900/30">
              <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-semibold bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent">
                Revolusi Penjurian Digital
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1]">
              <span className="block text-gray-900 dark:text-white">
                Platform Penjurian
              </span>
              <span className="block bg-gradient-to-r from-red-600 via-pink-600 to-red-600 dark:from-red-400 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">
                Paskibra Modern
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
              Manajemen event, pendaftaran tim, hingga rekapitulasi nilai
              real-time. Semua dalam satu aplikasi yang{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                efisien & transparan
              </span>
              .
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-xl shadow-red-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/40 hover:scale-105"
              >
                <Link href="/auth/login?tab=register" className="relative z-10">
                  Daftarkan Event Anda
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105"
              >
                <Link href="#how-it-works" className="flex items-center">
                  <PlayCircle className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  Lihat Cara Kerja
                </Link>
              </Button>
            </div>

            {/* Stats or Trust Indicators */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  500+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Event Terlaksana
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  10K+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tim Terdaftar
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  99.9%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Uptime
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image/Mockup */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Floating Card Effect */}
            <div className="relative w-full max-w-xl">
              {/* Main Image Container */}
              <div className="relative group">
                <Image
                  src="https://gdb.voanews.com/01000000-0aff-0242-fabd-08db9ec4c17e_w1023_r1_s.jpg"
                  alt="PaskibraApp Mockup"
                  width={1200}
                  height={800}
                  className="rounded-2xl shadow-2xl transform transition-all duration-700 group-hover:scale-[1.02] group-hover:rotate-1"
                  priority
                />

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-red-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10"></div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl opacity-20 blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl opacity-20 blur-2xl animate-pulse delay-1000"></div>

              {/* Border Accent */}
              <div className="absolute -inset-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl -z-20 opacity-30"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-950 to-transparent"></div>
    </section>
  );
};

export default Hero;
