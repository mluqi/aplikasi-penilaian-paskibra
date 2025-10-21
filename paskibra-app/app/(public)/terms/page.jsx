import PageHeader from "@/components/shared/PageHeader";

export default function TermsPage() {
  return (
    <main className="flex-grow">
      <PageHeader
        breadcrumb="Legal"
        title="Syarat dan Ketentuan"
        subtitle="Harap baca Syarat dan Ketentuan ini dengan saksama sebelum menggunakan layanan kami."
      />

      <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
            <p>
              Selamat datang di PaskibraApp. Syarat dan Ketentuan ("Ketentuan")
              ini mengatur akses Anda ke dan penggunaan situs web, layanan, dan
              aplikasi kami ("Layanan"). Dengan mengakses atau menggunakan
              Layanan, Anda setuju untuk terikat oleh Ketentuan ini.
            </p>

            <h2>1. Penerimaan Ketentuan</h2>
            <p>
              Dengan membuat akun atau menggunakan Layanan kami, Anda
              mengonfirmasi bahwa Anda telah membaca, memahami, dan menyetujui
              untuk terikat oleh Ketentuan ini. Jika Anda tidak setuju, Anda
              tidak boleh menggunakan Layanan kami.
            </p>

            <h2>2. Penggunaan Layanan</h2>
            <p>
              Anda setuju untuk menggunakan Layanan kami hanya untuk tujuan yang
              sah dan sesuai dengan Ketentuan ini. Anda bertanggung jawab atas
              semua aktivitas yang terjadi di bawah akun Anda.
            </p>

            <h2>3. Konten Pengguna</h2>
            <p>
              Anda bertanggung jawab penuh atas konten apa pun yang Anda unggah,
              posting, atau transmisikan melalui Layanan kami. Anda menjamin
              bahwa Anda memiliki semua hak yang diperlukan untuk konten
              tersebut dan bahwa konten tersebut tidak melanggar hak pihak
              ketiga mana pun.
            </p>

            <h2>4. Hak Kekayaan Intelektual</h2>
            <p>
              Layanan dan semua konten di dalamnya, termasuk teks, grafik, logo,
              dan perangkat lunak, adalah milik PaskibraApp atau pemberi
              lisensinya dan dilindungi oleh undang-undang hak cipta dan merek
              dagang.
            </p>

            <h2>5. Pembatasan Tanggung Jawab</h2>
            <p>
              Sejauh diizinkan oleh hukum yang berlaku, PaskibraApp tidak akan
              bertanggung jawab atas kerugian tidak langsung, insidental,
              khusus, konsekuensial, atau hukuman, atau kerugian apa pun atas
              keuntungan atau pendapatan.
            </p>

            <h2>6. Perubahan Ketentuan</h2>
            <p>
              Kami berhak untuk memodifikasi Ketentuan ini kapan saja. Kami akan
              memberi tahu Anda tentang perubahan apa pun dengan memposting
              Ketentuan baru di situs ini. Anda disarankan untuk meninjau
              Ketentuan ini secara berkala.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
