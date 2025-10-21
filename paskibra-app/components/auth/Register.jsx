"use client";
import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
import { Loader2, UserCircle2, ArrowRightCircle } from "lucide-react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";

const Register = () => {
  // Asumsi hook useAuth memiliki fungsi `register`
  const { register, isProcessingAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi kolom wajib (foto tidak wajib)
    if (!name || !email || !password || !role) {
      toast.error("Mohon isi semua kolom");
      return;
    }

    // Menggunakan FormData untuk mengirim file
    const formData = new FormData();
    formData.append("user_name", name);
    formData.append("user_email", email);
    formData.append("user_password", password);
    formData.append("user_role", role);
    if (photo) {
      formData.append("user_photo", photo);
    }

    await register(formData);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Buat Akun Baru</CardTitle>
        <CardDescription>
          Isi formulir di bawah ini untuk mendaftar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 flex flex-col items-center">
            <Label htmlFor="photo-register" className="cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle2 className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </Label>
            <Input
              id="photo-register"
              type="file"
              className="hidden"
              onChange={handlePhotoChange}
              accept="image/*"
            />
            <span className="text-xs text-muted-foreground">
              Unggah Foto (Opsional)
            </span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name-register">Nama</Label>
            <Input
              id="name-register"
              name="name"
              type="text"
              placeholder="Nama Lengkap Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isProcessingAuth}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-register">Email</Label>
            <Input
              id="email-register"
              name="email"
              type="email"
              placeholder="email@anda.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessingAuth}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-register">Password</Label>
            <Input
              id="password-register"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isProcessingAuth}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-register">Daftar Sebagai</Label>
            <Select
              onValueChange={setRole}
              disabled={isProcessingAuth}
              required
            >
              <SelectTrigger id="role-register">
                <SelectValue placeholder="Pilih peran Anda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="juri">Juri</SelectItem>
                <SelectItem value="koordinator_team">
                  Koordinator Tim
                </SelectItem>
                <SelectItem value="koordinator_event">
                  Koordinator Event
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isProcessingAuth}>
            {isProcessingAuth ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Daftar"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
      <div className="mt-4 text-sm text-muted-foreground flex items-center gap-1 group hover:text-primary transition-colors cursor-pointer">
        <Link href="/">kembali ke landing page</Link>
        <ArrowRightCircle className="h-4 w-4 group-hover:text-primary transition-colors" />
      </div>
      </CardFooter>
    </Card>
  );
};

export default Register;
