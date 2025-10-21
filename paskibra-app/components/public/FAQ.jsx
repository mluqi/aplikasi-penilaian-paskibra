import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";

const faqList = [
  {
    question: "Apakah data kami aman di platform ini?",
    answer:
      "Tentu. Kami menggunakan enkripsi standar industri dan praktik keamanan terbaik untuk memastikan semua data event, peserta, dan juri Anda aman dan terlindungi.",
  },
  {
    question: "Bisakah kriteria penilaian disesuaikan untuk setiap lomba?",
    answer:
      "Ya, platform kami sangat fleksibel. Anda dapat membuat, mengubah, dan menyesuaikan kriteria penilaian, bobot nilai, dan aspek lainnya untuk setiap kategori lomba sesuai kebutuhan.",
  },
  {
    question: "Bagaimana jika koneksi internet terputus saat penjurian?",
    answer:
      "Aplikasi kami dirancang dengan mode offline-first. Juri tetap dapat memasukkan nilai meskipun koneksi terputus. Data akan otomatis tersinkronisasi ke server saat koneksi kembali stabil.",
  },
  {
    question: "Apakah ada versi demo yang bisa kami coba?",
    answer:
      "Tentu! Silakan hubungi tim kami melalui halaman kontak untuk menjadwalkan sesi demo. Kami akan dengan senang hati menunjukkan cara kerja platform secara langsung dan menjawab semua pertanyaan Anda.",
  },
  {
    question: "Format hasil akhir apa saja yang bisa diekspor?",
    answer:
      "Anda dapat mengekspor hasil akhir dan rekapitulasi nilai dalam berbagai format populer, termasuk PDF untuk laporan resmi dan Excel (CSV) untuk analisis data lebih lanjut.",
  },
];

const FAQ = () => {
  return (
    <section
      id="faq"
      className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-7xl mx-auto">
          {/* Left Side - Header Section */}
          <div className="flex flex-col justify-center">
            <div className="lg:sticky lg:top-8">
              <span className="text-sm font-medium text-red-600 dark:text-red-400 mb-4 block">
                FAQ
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                Pertanyaan yang{" "}
                <span className="text-red-600 dark:text-red-400">
                  Sering Diajukan
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                Temukan jawaban untuk pertanyaan umum tentang platform kami.
                Jika Anda tidak menemukan jawaban di sini, jangan ragu untuk
                menghubungi kami.
              </p>

              {/* Additional Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Responsif dan mudah digunakan
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Dukungan teknis 24/7
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Update fitur berkala
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="mt-8 group inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md">
                Butuh Bantuan Lain?
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

          {/* Right Side - Accordion */}
          <div className="flex flex-col">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqList.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 px-6 transition-all duration-300 hover:border-red-200 dark:hover:border-red-800 hover:shadow-sm"
                >
                  <AccordionTrigger className="py-6 text-left hover:no-underline group">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300 pr-4 text-base">
                        {faq.question}
                      </span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-all duration-300 transform group-data-[state=open]:rotate-180" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Additional Note */}
            <div className="mt-8 p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Tidak menemukan jawaban yang Anda cari?{" "}
                <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors duration-300">
                  Hubungi tim support kami
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
