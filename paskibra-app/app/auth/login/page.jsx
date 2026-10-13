"use client";

import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Auth from "@/components/auth/Auth";
import { ShieldCheck, Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const { user, loading, isProcessingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/admin/dashboard");
    }
  }, [user, loading, router]);

  if (isProcessingAuth || (!loading && user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium animate-pulse">Memuat aplikasi...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl bg-card rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-border/50 min-h-[750px] md:h-[750px] z-20 mx-auto my-4 md:my-8">
      {/* Left Panel - Branding (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-600 to-red-900 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-black blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/30">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">KomandoApp</span>
        </div>

        <Image
          src="/icon.png"
          alt="KomandoApp Logo"
          width={120}
          height={120}
          className="w-120 h-120 rounded-full object-cover absolute -bottom-16 -right-25 opacity-20"
        />

        <div className="relative z-10 mt-12">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Platform Penjurian
            <br />
            Modern & Transparan
          </h1>
          <p className="text-red-100 text-lg leading-relaxed max-w-md">
            Kelola event, daftarkan tim, dan lakukan penilaian secara real-time
            dengan akurasi tinggi.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full md:w-1/2 p-6 sm:p-10 lg:p-12 bg-background dark:bg-gray-800 flex flex-col relative">
        <div className="my-auto w-full">
          <Auth />
        </div>
      </div>
    </div>
  );
}
