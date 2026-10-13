"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  BookOpen,
  Users,
  Gavel,
  Calendar,
  Smartphone,
  PlayCircle,
  ChevronRight,
  HelpCircle,
  Upload,
} from "lucide-react";

const tabs = [
  {
    id: "koordinator-event",
    label: "Koordinator Event",
    icon: Calendar,
    title: "Panduan Koordinator Event",
    desc: "Langkah-langkah membuat event, mengelola pendaftaran, hingga mempublikasikan hasil lomba.",
    steps: [
      {
        title: "Buat Event Baru",
        desc: "Dari dashboard, masuk ke menu 'Manajemen Event' dan klik 'Tambah Event'. Isi semua detail event seperti nama, tanggal, lokasi, biaya, poster, file juknis, hingga kontak panitia. Setelah selesai, klik 'Simpan'.",
        imageDesktop: "/panduan/koordinator-event-1-desktop.png",
        imageMobile: "/panduan/koordinator-event-1-mobile.png",
      },
      {
        title: "Kelola Aspek & Sub-Aspek Penilaian",
        desc: "Masuk ke detail event yang baru dibuat. Di bagian 'Aspek Penilaian', tambahkan aspek utama (misal: PBB Murni). Kemudian, kelola sub-aspek di dalamnya (misal: Sikap Sempurna, Hormat) dan tentukan poin mutlak untuk setiap parameter (Kurang, Cukup, Baik, Sangat Baik).",
        imageDesktop: "/panduan/koordinator-event-2-desktop.png",
        imageMobile: "/panduan/koordinator-event-2-mobile.png",
      },
      {
        title: "Tambahkan Tim Peserta & Dewan Juri",
        desc: "Di bagian 'Tim Peserta', klik 'Tambah Tim' untuk mendaftarkan tim yang sudah divalidasi. Lakukan hal yang sama di bagian 'Dewan Juri', dan jangan lupa untuk menugaskan setiap juri ke aspek penilaian yang menjadi tanggung jawabnya.",
        imageDesktop: "/panduan/koordinator-event-3-desktop.png",
        imageMobile: "/panduan/koordinator-event-3-mobile.png",
      },
      {
        title: "Atur Nomor Tampil & Aktifkan E-Voting",
        desc: "Setelah semua tim terdaftar, atur nomor urut tampil mereka pada tabel 'Tim Peserta'. Jika event Anda memiliki fitur E-Voting, klik tombol 'Aktifkan E-Voting' untuk membuat akun pembayaran dan memungkinkan donasi publik.",
        imageDesktop: "/panduan/koordinator-event-4-desktop.png",
        imageMobile: "/panduan/koordinator-event-4-mobile.png",
      },
      {
        title: "Publikasikan Hasil Lomba",
        desc: "Setelah semua juri selesai menilai, Anda dapat melihat hasil sementara melalui tombol 'Preview Klasemen'. Jika sudah final, klik tombol 'Tampilkan Klasemen Publik' agar halaman hasil akhir dapat diakses oleh semua orang.",
        imageDesktop: "/panduan/koordinator-event-5-desktop.png",
        imageMobile: "/panduan/koordinator-event-5-mobile.png",
      },
    ],
  },
  {
    id: "juri",
    label: "Dewan Juri",
    icon: Gavel,
    title: "Panduan Dewan Juri",
    desc: "Cara masuk ke panel juri, memberikan penilaian real-time, dan mengunci hasil akhir.",
    steps: [
      {
        title: "Login ke Akun Juri",
        desc: "Buka halaman login dan masuk menggunakan email serta password yang telah diberikan oleh Koordinator Event atau Admin. Setelah berhasil login, Anda akan diarahkan ke Dashboard utama.",
        imageDesktop: "/panduan/juri-1-desktop.png",
        imageMobile: "/panduan/juri-1-mobile.png",
      },
      {
        title: "Pilih Event Lomba",
        desc: "Pada halaman dashboard, Anda akan melihat daftar event lomba di mana Anda ditugaskan. Klik event yang sedang berlangsung untuk masuk ke panel penilaian.",
        imageDesktop: "/panduan/juri-2-desktop.png",
        imageMobile: "/panduan/juri-2-mobile.png",
      },
      {
        title: "Pilih Tim yang Tampil",
        desc: "Di dalam panel event, terdapat daftar tim peserta beserta nomor urut tampilnya. Klik nama tim yang sedang tampil di lapangan untuk membuka form penilaian tim tersebut.",
        imageDesktop: "/panduan/juri-3-desktop.png",
        imageMobile: "/panduan/juri-3-mobile.png",
      },
      {
        title: "Berikan Nilai per Sub-Aspek",
        desc: "Form akan menampilkan aspek dan sub-aspek penilaian khusus yang menjadi tanggung jawab Anda. Masukkan poin angka secara teliti sesuai rentang parameter yang ditentukan panitia (misal: Kurang, Cukup, Baik, Sangat Baik).",
        imageDesktop: "/panduan/juri-4-desktop.png",
        imageMobile: "/panduan/juri-4-mobile.png",
      },
      {
        title: "Simpan dan Kunci Penilaian (Lock)",
        desc: "Tambahkan catatan juri jika ada, lalu klik 'Simpan'. Jika penilaian untuk tim tersebut sudah benar-benar final, klik 'Kunci Nilai' (Lock). Harap berhati-hati, nilai yang sudah dikunci akan langsung terintegrasi ke rekapitulasi utama dan tidak dapat diubah kembali tanpa persetujuan Admin.",
        imageDesktop: "/panduan/juri-5-desktop.png",
        imageMobile: "/panduan/juri-5-mobile.png",
      },
    ],
  },
  {
    id: "koordinator-team",
    label: "Koordinator Tim",
    icon: Users,
    title: "Panduan Koordinator Tim",
    desc: "Cara mendaftarkan tim, melengkapi profil peserta, dan memonitor status pendaftaran.",
    steps: [
      {
        title: "Registrasi Akun & Persetujuan Admin",
        desc: "Mulai dengan mendaftarkan akun melalui menu 'Register'. Akun baru akan berstatus 'Pending' dan memerlukan persetujuan Admin demi keamanan. Setelah disetujui, login dan lengkapi profil tim Anda, termasuk logo dan foto keseluruhan tim.",
        imageDesktop: "/panduan/tim-1-desktop.png",
        imageMobile: "/panduan/tim-1-mobile.png",
      },
      {
        title: "Cari Event Lomba",
        desc: "Buka halaman utama atau menu 'Jelajahi Event'. Anda dapat memfilter event berdasarkan kategori (SD/SMP/SMA), tingkat, atau provinsi untuk menemukan kompetisi yang tepat bagi tim Anda.",
        imageDesktop: "/panduan/tim-2-desktop.png",
        imageMobile: "/panduan/tim-2-mobile.png",
      },
      {
        title: "Daftarkan Tim Anda",
        desc: "Klik event yang dituju untuk membaca detail, mengunduh Petunjuk Teknis (Juknis), dan melihat biaya. Klik tombol 'Daftar Sekarang', lalu pilih nama tim Anda pada jendela pendaftaran yang muncul.",
        imageDesktop: "/panduan/tim-3-desktop.png",
        imageMobile: "/panduan/tim-3-mobile.png",
      },
      {
        title: "Konfirmasi Pendaftaran (WhatsApp)",
        desc: "Setelah mengklik 'Konfirmasi', sistem akan otomatis mengarahkan Anda ke aplikasi WhatsApp. Kirim pesan template yang sudah terbuat kepada panitia untuk proses validasi dan instruksi pembayaran selanjutnya.",
        imageDesktop: "/panduan/tim-4-desktop.png",
        imageMobile: "/panduan/tim-4-mobile.png",
      },
      {
        title: "Pantau E-Voting & Hasil Klasemen",
        desc: "Setelah sah menjadi peserta, sebarkan halaman event agar pendukung bisa memberikan poin via E-Voting (QRIS). Setelah lomba selesai, klik tombol 'Lihat Hasil Klasemen' untuk mengecek rincian nilai tim Anda dari para juri.",
        imageDesktop: "/panduan/tim-5-desktop.png",
        imageMobile: "/panduan/tim-5-mobile.png",
      },
    ],
  },
  {
    id: "upload-surat",
    label: "Upload Surat",
    icon: Upload,
    title: "Panduan Upload Surat Rekomendasi",
    desc: "Langkah-langkah untuk mengunggah surat rekomendasi sebagai syarat keikutsertaan event.",
    steps: [
      {
        title: "Masuk Detail Tim",
        desc: "Masuk ke aplikasi menggunakan akun Anda, lalu navigasikan ke halaman detail tim Anda.",
        imageDesktop: "/panduan/upload-1-desktop.png",
        imageMobile: "/panduan/upload-1-desktop.png",
      },
      {
        title: "Klik Upload Surat Rekomendasi",
        desc: "Pada halaman detail tim, gulir ke bagian 'Event yang Diikuti & E-Voting'. Klik tombol 'Upload Surat' pada event yang bersangkutan.",
        imageDesktop: "/panduan/upload-2-desktop.png",
        imageMobile: "/panduan/upload-2-desktop.png",
      },
      {
        title: "Pilih File Surat Rekomendasi",
        desc: "Akan muncul modal (jendela pop-up) untuk upload surat. Pilih file dokumen surat rekomendasi Anda, kemudian klik tombol 'Upload'.",
        imageDesktop: "/panduan/upload-3-desktop.png",
        imageMobile: "/panduan/upload-3-desktop.png",
      },
      {
        title: "Selesai (Surat Berhasil Terunggah)",
        desc: "Jika proses berhasil, akan muncul ikon/badge 'Terunggah' di bagian kolom surat rekomendasi pada tabel event yang diikuti.",
        imageDesktop: "/panduan/upload-4-desktop.png",
        imageMobile: "/panduan/upload-4-desktop.png",
      },
    ],
  },
  {
    id: "e-voting",
    label: "Donasi & E-Voting",
    icon: Smartphone,
    title: "Panduan E-Voting Publik",
    desc: "Tutorial bagi masyarakat umum untuk melakukan voting menggunakan QRIS.",
    steps: [
      {
        title: "Buka Detail Event",
        desc: "Buka halaman utama web, klik salah satu event yang sedang berlangsung. Anda akan diarahkan ke halaman detail event.",
        imageDesktop: "/panduan/evoting-1-desktop.png",
        imageMobile: "/panduan/evoting-1-mobile.png",
      },
      {
        title: "Cari Tim Favorit Anda",
        desc: "Gulir (scroll) layar ke bagian bawah hingga menemukan tabel 'Peserta & Dukungan'. Di sana Anda akan melihat daftar tim beserta jumlah poin saat ini.",
        imageDesktop: "/panduan/evoting-2-desktop.png",
        imageMobile: "/panduan/evoting-2-mobile.png",
      },
      {
        title: "Klik Tombol E-Voting",
        desc: "Pilih tim yang ingin didukung lalu klik tombol E-Voting yang ada di baris kanan tim tersebut. Sebuah jendela (pop-up) akan muncul.",
        imageDesktop: "/panduan/evoting-3-desktop.png",
        imageMobile: "/panduan/evoting-3-mobile.png",
      },
      {
        title: "Masukkan Nominal & Bayar (QRIS)",
        desc: "Ketik nominal dukungan yang Anda inginkan (misal: 10000). Sistem akan membuatkan kode QRIS. Silakan scan kode tersebut menggunakan aplikasi M-Banking atau e-Wallet (GoPay, OVO, Dana). Setelah sukses, poin tim akan otomatis bertambah!",
        imageDesktop: "/panduan/evoting-4-desktop.png",
        imageMobile: "/panduan/evoting-4-mobile.png",
      },
    ],
  },
];

// Komponen Fallback untuk menangani gambar yang error/belum ada
const ImageWithFallback = ({ src, alt, width, height, className }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-500 text-sm italic w-full ${className}`}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        [ Gambar belum tersedia ]
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      unoptimized={true} // Mencegah crash optimization di server Next.js jika file tidak ada
    />
  );
};

function PanduanContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const activeContent = tabs.find((tab) => tab.id === activeTab);

  // Efek untuk menyinkronkan state dengan URL
  useEffect(() => {
    const tabId = searchParams.get("tab");
    if (tabId && tabs.some((t) => t.id === tabId)) {
      setActiveTab(tabId);
    } else {
      // Jika tidak ada tab di URL atau tidak valid, set ke tab pertama
      setActiveTab(tabs[0].id);
    }
  }, [searchParams]);

  const handleTabClick = useCallback(
    (tabId) => {
      const newUrl = `${pathname}?tab=${tabId}`;
      router.push(newUrl, { scroll: false });
    },
    [pathname, router],
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pt-12">
      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Pusat{" "}
            <span className="text-red-600 dark:text-red-400">Panduan</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl leading-relaxed">
            Temukan tutorial lengkap dan panduan langkah demi langkah untuk
            memaksimalkan penggunaan aplikasi penilaian sesuai dengan
            peran Anda.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Sidebar Navigation (Tabs) */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="sticky top-24 space-y-2 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-4">
                  Pilih Peran Anda
                </h3>
                <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-left whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink ${
                          isActive
                            ? "bg-red-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-red-500"}`}
                        />
                        <span className="font-semibold text-sm md:text-base">
                          {tab.label}
                        </span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-auto hidden lg:block" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-10 transition-all duration-500">
                {/* Header Konten Aktif */}
                <div className="mb-10 border-b border-gray-100 dark:border-gray-700 pb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                      {activeContent && (
                        <activeContent.icon className="w-6 h-6" />
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {activeContent?.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {activeContent?.desc}
                  </p>
                </div>

                {/* 
                  =======================================================
                  PLACEHOLDER ISI PANDUAN (Bisa diganti komponen dinamis) 
                  =======================================================
                */}
                <div className="space-y-12">
                  {/* Bagian 1: Video Tutorial (Opsional) */}
                  <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-video relative border border-gray-200 dark:border-gray-700 flex items-center justify-center group cursor-pointer">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="flex flex-col items-center gap-4 text-gray-500 hover:text-red-600 transition-colors z-10">
                      <PlayCircle className="w-16 h-16 opacity-80 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-semibold text-lg drop-shadow-sm">
                        [ Tempat Video Tutorial ]
                      </span>
                    </div>
                  </div>

                  {/* Bagian 2: Langkah-langkah */}
                  {activeContent?.steps && activeContent.steps.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Langkah - Langkah
                      </h3>
                      <div className="space-y-6">
                        {activeContent.steps.map((step, index) => (
                          <div key={index} className="flex gap-4 md:gap-6">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-lg border border-red-200 dark:border-red-800">
                              {index + 1}
                            </div>
                            <div className="pt-1.5 w-full">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {step.title}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 max-w-3xl">
                                {step.desc}
                              </p>

                              {/* Render Screenshot Desktop & Mobile */}
                              <div className="w-full mt-4 flex flex-col gap-4">
                                {step.imageDesktop && (
                                  <div
                                    className={`relative w-full max-w-3xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-800 ${
                                      step.imageMobile ? "hidden md:block" : ""
                                    }`}
                                  >
                                    <ImageWithFallback
                                      src={step.imageDesktop}
                                      alt={`Desktop View: ${step.title}`}
                                      width={1200}
                                      height={675}
                                      className="w-full h-auto object-contain"
                                    />
                                  </div>
                                )}

                                {step.imageMobile && (
                                  <div
                                    className={`relative w-full max-w-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-800 ${
                                      step.imageDesktop ? "block md:hidden" : ""
                                    }`}
                                  >
                                    <ImageWithFallback
                                      src={step.imageMobile}
                                      alt={`Mobile View: ${step.title}`}
                                      width={600}
                                      height={1200}
                                      className="w-full h-auto object-contain"
                                    />
                                  </div>
                                )}

                                {/* Fallback jika gambar belum disediakan di folder */}
                                {!step.imageDesktop && !step.imageMobile && (
                                  <div className="w-full max-w-xl h-48 bg-gray-100 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 text-sm italic">
                                    [ Siapkan gambar di public/panduan/... ]
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* END OF PLACEHOLDER */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Support Section */}
      <section className="pb-16 pt-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden">
            <HelpCircle className="w-48 h-48 absolute -right-10 -top-10 text-red-500/30 rotate-12" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">
              Masih Mengalami Kesulitan?
            </h2>
            <p className="text-red-100 mb-8 text-lg relative z-10 max-w-2xl mx-auto">
              Tim support kami siap membantu menjawab pertanyaan atau kendala
              teknis yang Anda alami saat menggunakan platform kami.
            </p>
            <button
              onClick={() =>
                window.open("https://wa.me/6287717555589", "_blank")
              }
              className="relative z-10 bg-white text-red-600 hover:bg-gray-50 px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
            >
              Hubungi Tim Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PanduanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 text-center text-gray-500">
          Memuat panduan...
        </div>
      }
    >
      <PanduanContent />
    </Suspense>
  );
}
