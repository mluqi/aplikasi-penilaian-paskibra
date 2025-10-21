import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";

/**
 * Halaman 404 kustom yang ditampilkan ketika sebuah rute tidak ditemukan.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <Frown className="h-24 w-24 text-primary/70" strokeWidth={1.5} />
      <h1 className="mt-8 text-8xl font-extrabold tracking-tight text-primary lg:text-9xl">
        404
      </h1>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Halaman Tidak Ditemukan
      </h2>
      <p className="mt-4 max-w-md text-muted-foreground">
        Maaf, kami tidak dapat menemukan halaman yang Anda cari. Mungkin URL-nya
        salah ketik atau halamannya telah dipindahkan.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
