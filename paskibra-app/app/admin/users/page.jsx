"use client";

import { useState, useEffect } from "react";
import api from "@/service/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { MoreHorizontal, PlusCircle, Trash2, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Komponen Form untuk Create/Update User
const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    user_name: user?.user_name || "",
    user_email: user?.user_email || "",
    user_password: "",
    user_role: user?.user_role || "juri",
  });
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        "Tipe file tidak valid. Harap unggah file JPG, PNG, atau WEBP."
      );
      e.target.value = ""; // Reset input file
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(
        `Ukuran file terlalu besar. Maksimal ${MAX_SIZE / 1024 / 1024}MB.`
      );
      e.target.value = ""; // Reset input file
      return;
    }

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: "image/jpeg", // Paksa output ke format JPEG
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
      toast.success("Foto profil siap diunggah (JPG).");
    } catch (error) {
      toast.error("Gagal mengompres gambar.");
      console.error(error);
      e.target.value = ""; // Reset input file
    }
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, user_role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData, photo);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="user_name" className="text-right">
          Nama
        </Label>
        <Input
          id="user_name"
          name="user_name"
          value={formData.user_name}
          onChange={handleChange}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="user_email" className="text-right">
          Email
        </Label>
        <Input
          id="user_email"
          name="user_email"
          type="email"
          value={formData.user_email}
          onChange={handleChange}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="user_password" className="text-right">
          Password
        </Label>
        <Input
          id="user_password"
          name="user_password"
          type="password"
          placeholder={user ? "Kosongkan jika tidak ganti" : ""}
          value={formData.user_password}
          onChange={handleChange}
          className="col-span-3"
          required={!user}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="user_role" className="text-right">
          Role
        </Label>
        <Select
          value={formData.user_role}
          onValueChange={handleRoleChange}
          name="user_role"
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Pilih role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="juri">Juri</SelectItem>
            <SelectItem value="koordinator_team">Koordinator Tim</SelectItem>
            <SelectItem value="koordinator_event">Koordinator Event</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="user_photo" className="text-right">
          Foto Profil
        </Label>
        <Input
          id="user_photo"
          name="user_photo"
          type="file"
          onChange={handlePhotoChange}
          className="col-span-3"
          accept="image/*"
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      toast.error("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (userData, photo) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (key === "user_password" && selectedUser && !userData[key]) {
          return;
        }
        formData.append(key, userData[key]);
      });

      if (photo) {
        formData.append("user_photo", photo);
      }

      if (selectedUser) {
        const response = await api.put(
          `/users/${selectedUser.user_id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success(response.data.message || "Pengguna berhasil diperbarui.");
      } else {
        const response = await api.post("/users", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(response.data.message || "Pengguna berhasil dibuat.");
      }
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan.");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const response = await api.delete(`/users/${selectedUser.user_id}`);
      toast.success(response.data.message || "Pengguna berhasil dihapus.");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus pengguna.");
    } finally {
      setIsAlertOpen(false);
    }
  };

  const openDialog = (user = null) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const openAlert = (user) => {
    setSelectedUser(user);
    setIsAlertOpen(true);
  };

  return (
    <ProtectedRoute requiredAccess="manage_users">
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
                <BreadcrumbPage>Manajemen Pengguna</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Daftar Pengguna</h1>
          <Button onClick={() => openDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Pengguna
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            user.user_photo
                              ? `${process.env.NEXT_PUBLIC_API_URL}${user.user_photo}`
                              : ""
                          }
                          alt={user.user_name}
                        />
                        <AvatarFallback>
                          {user.user_name
                            ? user.user_name.charAt(0).toUpperCase()
                            : "PU"}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{user.user_id}</TableCell>
                    <TableCell className="font-medium">
                      {user.user_name}
                    </TableCell>
                    <TableCell>{user.user_email}</TableCell>
                    <TableCell>{user.user_role}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => openAlert(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Tidak ada data pengguna.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSave={handleSaveUser}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isAlertOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
          setIsAlertOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pengguna
              secara permanen dari server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
