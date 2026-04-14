"use client";

import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import api from "@/service/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  User,
  Lock,
  Mail,
  Camera,
  ShieldCheck,
  Check,
  Info,
} from "lucide-react";

export default function ProfileSettingsPage() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  useEffect(() => {
    if (user?.photo) {
      setPreview(`${process.env.NEXT_PUBLIC_API_URL}${user.photo}`);
    } else {
      setPreview("/default-avatar.png");
    }
  }, [user?.photo]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        "Tipe file tidak valid. Harap unggah file JPG, PNG, atau WEBP.",
      );
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(
        `Ukuran file terlalu besar. Maksimal ${MAX_SIZE / 1024 / 1024}MB.`,
      );
      e.target.value = "";
      return;
    }

    const handleCompression = async () => {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const compressedBlob = await imageCompression(file, options);

        // Buat nama file baru dengan ekstensi .jpg
        const originalFilename = file.name.substring(
          0,
          file.name.lastIndexOf("."),
        );
        const newFilename = `${originalFilename}.jpg`;

        // Buat File object baru dari blob yang sudah dikompres
        const jpgFile = new File([compressedBlob], newFilename, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        setPhoto(jpgFile);
        setPreview(URL.createObjectURL(jpgFile));
        toast.success("Foto profil baru siap diunggah (JPG).");
      } catch (error) {
        toast.error("Gagal mengompres gambar.");
        console.error(error);
      }
    };
    handleCompression();
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if ((!name || name === user.name) && !photo) {
      toast.info("Tidak ada perubahan pada profil.");
      return;
    }
    setIsProfileSubmitting(true);
    try {
      const formData = new FormData();
      if (name !== user.name) formData.append("user_name", name);
      if (photo) formData.append("user_photo", photo);

      const response = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUserProfile(response.data.user);
      toast.success(response.data.message || "Profil berhasil diperbarui.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui profil.");
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { current_password, new_password, confirm_password } = passwords;
    if (!current_password || !new_password) {
      toast.error("Mohon isi password saat ini dan password baru.");
      return;
    }
    if (new_password !== confirm_password) {
      toast.error("Password baru dan konfirmasi password tidak cocok.");
      return;
    }
    setIsPasswordSubmitting(true);
    try {
      const response = await api.put("/users/profile", {
        current_password,
        new_password,
      });
      toast.success(response.data.message || "Password berhasil diubah.");
      setPasswords({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengubah password.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Pengaturan Profil</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-4xl mx-auto w-full">
        <div className="mb-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Pengaturan Profil
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola informasi data diri dan keamanan akun Anda.
          </p>
        </div>

        <div className="space-y-6">
          {/* Form Profil */}
          <form
            onSubmit={handleProfileSubmit}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-border/50 p-5 md:p-6 transition-all"
          >
            <div className="flex items-center gap-3 border-b pb-4 mb-6">
              <div className="p-2 bg-primary/10 rounded-xl">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Informasi Dasar
                </h3>
                <p className="text-xs text-muted-foreground">
                  Perbarui foto profil dan nama lengkap Anda.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-3 mx-auto md:mx-0 shrink-0">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-muted shadow-sm bg-muted/50">
                  <Image
                    src={preview || "/default-avatar.png"}
                    alt="Foto Profil"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative w-full">
                  <Input
                    id="user_photo"
                    type="file"
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    title="Ubah Foto"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" /> Ubah Foto
                  </Button>
                </div>
              </div>

              <div className="flex-1 w-full space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <div className="relative max-w-md">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="pl-9 bg-muted/50 text-muted-foreground font-medium"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" /> Email
                    digunakan untuk identitas login dan tidak dapat diubah.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t mt-8">
              <Button type="submit" disabled={isProfileSubmitting}>
                {isProfileSubmitting ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Form Password */}
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-border/50 p-5 md:p-6 transition-all"
          >
            <div className="flex items-center gap-3 border-b pb-4 mb-6">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Keamanan Akun
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ubah password Anda secara berkala untuk menjaga keamanan.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="current_password">
                  Password Saat Ini <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="current_password"
                  name="current_password"
                  type="password"
                  value={passwords.current_password}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Masukkan password saat ini"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">
                  Password Baru <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={passwords.new_password}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">
                  Konfirmasi Password Baru{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={passwords.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Ketik ulang password baru"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t mt-8">
              <Button
                type="submit"
                variant="secondary"
                disabled={isPasswordSubmitting}
              >
                {isPasswordSubmitting ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" /> Perbarui Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
