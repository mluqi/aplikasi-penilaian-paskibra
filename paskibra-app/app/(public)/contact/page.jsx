import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/shared/PageHeader";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <main className="flex-grow">
        {/* Hero Section */}
        <PageHeader
          breadcrumb="Kontak"
          title="Hubungi Kami"
          subtitle="Punya pertanyaan, masukan, atau butuh bantuan? Tim kami siap membantu Anda."
        />

        {/* Contact Form and Info Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-1 space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Informasi Kontak
                </h2>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Email
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Kirimkan pertanyaan Anda kapan saja.
                    </p>
                    <a
                      href="mailto:support@paskibra.app"
                      className="text-red-600 dark:text-red-400 font-medium hover:underline"
                    >
                      support@paskibra.app
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Telepon
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Hubungi kami di jam kerja.
                    </p>
                    <a
                      href="tel:+6281234567890"
                      className="text-red-600 dark:text-red-400 font-medium hover:underline"
                    >
                      +62 812-3456-7890
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Lokasi
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Jl. Merah Putih No. 17, Jakarta, Indonesia
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="p-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Nama Anda"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@anda.com"
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subjek</Label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="Subjek pesan Anda"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Pesan</Label>
                      <Textarea
                        id="message"
                        placeholder="Tuliskan pesan Anda di sini..."
                        rows={5}
                        className="mt-2"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      Kirim Pesan
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
