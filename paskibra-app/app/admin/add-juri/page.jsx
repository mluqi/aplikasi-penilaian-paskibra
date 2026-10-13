"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/service/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, User } from "lucide-react";

const AddJuriPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    user_password: "",
    confirm_password: "",
  });
  const [userPhoto, setUserPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserPhoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.user_password !== formData.confirm_password) {
      toast.error("Password dan konfirmasi password tidak cocok");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("user_name", formData.user_name);
      submitData.append("user_email", formData.user_email);
      submitData.append("user_password", formData.user_password);
      if (userPhoto) {
        submitData.append("user_photo", userPhoto);
      }

      const response = await api.post("/juri", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Juri berhasil ditambahkan");
      router.push("/admin/events"); // atau halaman lain
    } catch (error) {
      console.error("Error adding juri:", error);
      toast.error(error.response?.data?.message || "Gagal menambahkan juri");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tambah Juri Baru</h1>
          <p className="text-muted-foreground">
            Daftarkan juri baru untuk sistem penilaian
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Juri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="user_name">Nama Lengkap *</Label>
              <Input
                id="user_name"
                name="user_name"
                type="text"
                value={formData.user_name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap juri"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_email">Email *</Label>
              <Input
                id="user_email"
                name="user_email"
                type="email"
                value={formData.user_email}
                onChange={handleInputChange}
                placeholder="Masukkan alamat email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_password">Password *</Label>
              <Input
                id="user_password"
                name="user_password"
                type="password"
                value={formData.user_password}
                onChange={handleInputChange}
                placeholder="Masukkan password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Konfirmasi Password *</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                placeholder="Konfirmasi password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_photo">Foto Profil (Opsional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="user_photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label
                  htmlFor="user_photo"
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  {userPhoto ? userPhoto.name : "Pilih file gambar"}
                </Label>
              </div>
              {userPhoto && (
                <p className="text-sm text-muted-foreground">
                  File dipilih: {userPhoto.name}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Menyimpan..." : "Tambah Juri"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddJuriPage;
