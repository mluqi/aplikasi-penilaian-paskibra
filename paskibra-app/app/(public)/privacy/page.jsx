import PageHeader from "@/components/shared/PageHeader";

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-grow">
      <PageHeader
        breadcrumb="Legal"
        title="Kebijakan Privasi"
        subtitle="Privasi Anda penting bagi kami. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda."
      />

      <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
            <p>
              Kebijakan Privasi ini menjelaskan bagaimana PaskibraApp ("kami",
              "kita", atau "milik kami") mengumpulkan, menggunakan, dan
              mengungkapkan informasi Anda saat Anda menggunakan layanan kami.
            </p>

            <h2>1. Informasi yang Kami Kumpulkan</h2>
            <p>
              Kami dapat mengumpulkan informasi pribadi yang dapat
              mengidentifikasi Anda, seperti nama, alamat email, dan informasi
              kontak lainnya saat Anda mendaftar atau menggunakan layanan kami.
              Kami juga mengumpulkan data penggunaan non-pribadi secara
              otomatis.
            </p>

            <h2>2. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <p>Kami menggunakan informasi yang kami kumpulkan untuk:</p>
            <ul>
              <li>Menyediakan, mengoperasikan, dan memelihara Layanan kami</li>
              <li>
                Meningkatkan, mempersonalisasi, dan memperluas Layanan kami
              </li>
              <li>
                Berkomunikasi dengan Anda, baik secara langsung atau melalui
                salah satu mitra kami, termasuk untuk layanan pelanggan
              </li>
              <li>Mengirimkan email kepada Anda</li>
              <li>Menemukan dan mencegah penipuan</li>
            </ul>

            <h2>3. Berbagi Informasi Anda</h2>
            <p>
              Kami tidak menjual, memperdagangkan, atau menyewakan informasi
              identifikasi pribadi pengguna kepada orang lain. Kami dapat
              berbagi informasi demografis agregat generik yang tidak terkait
              dengan informasi identifikasi pribadi apa pun mengenai pengunjung
              dan pengguna dengan mitra bisnis kami.
            </p>

            <h2>4. Keamanan Data</h2>
            <p>
              Keamanan data Anda penting bagi kami. Kami menggunakan
              langkah-langkah keamanan yang wajar secara komersial untuk
              melindungi informasi pribadi Anda, tetapi kami tidak dapat
              menjamin keamanan mutlaknya.
            </p>

            <h2>5. Perubahan pada Kebijakan Privasi Ini</h2>
            <p>
              Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu.
              Kami akan memberi tahu Anda tentang perubahan apa pun dengan
              memposting Kebijakan Privasi baru di halaman ini. Anda disarankan
              untuk meninjau Kebijakan Privasi ini secara berkala untuk setiap
              perubahan.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
