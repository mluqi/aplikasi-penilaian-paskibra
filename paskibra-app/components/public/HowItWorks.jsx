import { FilePlus2, UserPlus, Gavel, Trophy } from "lucide-react";

const stepsList = [
  {
    icon: <FilePlus2 className="h-8 w-8" />,
    title: "1. Buat Event",
    description:
      "Panitia mendaftarkan event, mengatur kategori lomba, dan menetapkan kriteria penilaian dengan mudah.",
  },
  {
    icon: <UserPlus className="h-8 w-8" />,
    title: "2. Undang & Daftar",
    description:
      "Undang juri untuk bergabung dan buka pendaftaran online untuk tim peserta dari berbagai sekolah.",
  },
  {
    icon: <Gavel className="h-8 w-8" />,
    title: "3. Lakukan Penilaian",
    description:
      "Juri memberikan nilai secara real-time melalui perangkat mereka saat lomba berlangsung.",
  },
  {
    icon: <Trophy className="h-8 w-8" />,
    title: "4. Lihat Hasilnya",
    description:
      "Sistem merekapitulasi nilai secara otomatis dan peringkat juara langsung tersedia setelah verifikasi.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Side - Header Section (Reordered for mobile first) */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            <div className="lg:sticky lg:top-24">
              <span className="text-sm font-medium text-red-600 dark:text-red-400 mb-4 block">
                Cara Kerja
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                Mulai dalam{" "}
                <span className="text-red-600 dark:text-red-400">
                  4 Langkah Mudah
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                Kami menyederhanakan proses manajemen lomba menjadi alur yang
                intuitif dan efisien untuk semua pihak yang terlibat.
              </p>
              <div className="space-y-4 mb-8 hidden lg:block">
                <div className="flex items-center gap-3 ">
                  <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Proses yang terstruktur dan terorganisir
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Menghemat waktu dan mengurangi kesalahan
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Transparan untuk semua pihak
                  </span>
                </div>
              </div>

              <div className="flex justify-center lg:justify-start">
                <button className="group inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md">
                  Mulai Sekarang
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Steps */}
          <div className="space-y-8">
            {stepsList.map((step) => (
              <div
                key={step.title}
                className="group flex items-start gap-6 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-red-600 text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-red-600 dark:group-hover:text-red-400 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
