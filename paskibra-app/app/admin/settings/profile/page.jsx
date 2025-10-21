"use client";

import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import api from "@/service/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        "Tipe file tidak valid. Harap unggah file JPG, PNG, atau WEBP."
      );
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(
        `Ukuran file terlalu besar. Maksimal ${MAX_SIZE / 1024 / 1024}MB.`
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
          file.name.lastIndexOf(".")
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

      <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Perbarui informasi profil Anda. Email tidak dapat diubah.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileSubmit}>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Image
                  src={preview || "/default-avatar.png"}
                  alt="Foto Profil"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="user_photo">Ubah Foto Profil</Label>
                  <Input
                    id="user_photo"
                    type="file"
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="cursor-pointer "
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} disabled />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isProfileSubmitting}>
                {isProfileSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ubah Password</CardTitle>
            <CardDescription>
              Masukkan password Anda saat ini untuk mengubahnya.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Password Saat Ini</Label>
                <Input
                  id="current_password"
                  name="current_password"
                  type="password"
                  value={passwords.current_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">Password Baru</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={passwords.new_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="confirm_password">
                  Konfirmasi Password Baru
                </Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={passwords.confirm_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? "Menyimpan..." : "Ubah Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </>
  );
}
