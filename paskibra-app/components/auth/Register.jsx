"use client";
import { useState } from "react";
import Image from "next/image";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  User,
  Mail,
  Lock,
  Camera,
  ShieldCheck,
  ArrowLeft,
  Info,
  Users,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";

const Register = () => {
  // Asumsi hook useAuth memiliki fungsi `register`
  const { register, isProcessingAuth } = useAuth();
  const [selection, setSelection] = useState(null); // 'team', 'event', or null
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 1 * 1024 * 1024; // 1MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Tipe file tidak valid. Harap unggah gambar (JPG, PNG, WEBP).");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(`Ukuran file terlalu besar. Maksimal 1MB.`);
      e.target.value = "";
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi kolom wajib (foto tidak wajib, role sudah ditetapkan)
    if (!name || !email || !password) {
      toast.error("Mohon isi semua kolom");
      return;
    }

    // Menggunakan FormData untuk mengirim file
    const formData = new FormData();
    formData.append("user_name", name);
    formData.append("user_email", email);
    formData.append("user_password", password);
    formData.append("user_role", "koordinator_team"); // Hardcode role
    if (photo) {
      formData.append("user_photo", photo);
    }

    await register(formData);
  };

  if (selection === "team") {
    return (
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo Upload */}
          <div className="flex flex-col items-center justify-center mb-2">
            <Label
              htmlFor="photo-register"
              className="cursor-pointer group relative"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted border-2 border-dashed border-border/60 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:bg-muted/80">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground/50 group-hover:text-primary/70 transition-colors" />
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </Label>
            <Input
              id="photo-register"
              type="file"
              className="hidden"
              onChange={handlePhotoChange}
              accept="image/*"
            />
            <span className="text-xs font-medium text-muted-foreground mt-2">
              Foto Profil (Opsional)
            </span>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="name-register"
              className="font-semibold text-gray-700 dark:text-gray-300"
            >
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
              <Input
                id="name-register"
                name="name"
                type="text"
                placeholder="Nama Lengkap Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isProcessingAuth}
                className="pl-11 h-12 bg-muted/30 focus-visible:bg-background rounded-xl border-border/50 text-base"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email-register"
              className="font-semibold text-gray-700 dark:text-gray-300"
            >
              Alamat Email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
              <Input
                id="email-register"
                name="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isProcessingAuth}
                className="pl-11 h-12 bg-muted/30 focus-visible:bg-background rounded-xl border-border/50 text-base"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password-register"
              className="font-semibold text-gray-700 dark:text-gray-300"
            >
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
              <Input
                id="password-register"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isProcessingAuth}
                className="pl-11 h-12 bg-muted/30 focus-visible:bg-background rounded-xl border-border/50 text-base"
                required
              />
            </div>
          </div>

          <div className="flex flex-row sm:flex-row gap-3">
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 order-1 sm:order-2 cursor-pointer"
              disabled={isProcessingAuth}
            >
              {isProcessingAuth ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Buat Akun Tim"
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            className="text-muted-foreground cursor-pointer"
            onClick={() => setSelection(null)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Pilihan
          </Button>
        </form>
      </div>
    );
  }

  if (selection === "event") {
    return (
      <div className="w-full max-w-md mx-auto text-center flex flex-col items-center">
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-6 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <CalendarDays className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-amber-900 dark:text-amber-200">
              Pendaftaran Koordinator Event
            </h3>
            <p className="text-sm text-amber-700/90 dark:text-amber-200/80 leading-relaxed">
              Untuk menyelenggarakan event, Anda perlu menghubungi tim marketing
              kami untuk proses aktivasi dan pembayaran.
            </p>
          </div>
          <Button
            asChild
            className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-lg mt-2"
          >
            <a
              href="https://wa.me/6287717555589"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hubungi Marketing via WhatsApp
            </a>
          </Button>
        </div>
        <Button
          variant="ghost"
          className="mt-6 text-muted-foreground"
          onClick={() => setSelection(null)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Pilihan
        </Button>
      </div>
    );
  }

  // Default view: Role Selection
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="font-bold text-xl">Daftar Sebagai Apa?</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Pilih peran yang sesuai dengan kebutuhan Anda.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Card Koordinator Tim */}
        <div
          onClick={() => setSelection("team")}
          className="p-6 rounded-2xl border-2 border-border/50 bg-background hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h4 className="font-semibold text-lg text-foreground mb-2">
            Koordinator Tim
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Daftar mandiri untuk mengelola anggota tim dan mendaftarkan tim Anda
            ke berbagai event.
          </p>
        </div>

        {/* Card Koordinator Event */}
        <div
          onClick={() => setSelection("event")}
          className="p-6 rounded-2xl border-2 border-border/50 bg-background hover:border-amber-500 hover:bg-amber-500/5 cursor-pointer transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <CalendarDays className="w-8 h-8 text-amber-500" />
          </div>
          <h4 className="font-semibold text-lg text-foreground mb-2">
            Penyelenggara Event
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hubungi kami untuk membuat event, mengelola peserta, dan mengatur
            penjurian secara profesional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
