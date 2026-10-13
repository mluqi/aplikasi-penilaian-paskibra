"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Edit,
  Camera,
  Mail,
  Lock,
  UserIcon,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

// Komponen Form untuk Create/Update User
const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    user_name: user?.user_name || "",
    user_email: user?.user_email || "",
    user_password: "",
    user_role: user?.user_role || "juri",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(
    user?.user_photo
      ? `${process.env.NEXT_PUBLIC_API_URL}${user.user_photo}`
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 1 * 1024 * 1024; // 1MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        "Tipe file tidak valid. Harap unggah file JPG, PNG, atau WEBP.",
      );
      e.target.value = ""; // Reset input file
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(
        `Ukuran file terlalu besar. Maksimal ${MAX_SIZE / 1024 / 1024}MB.`,
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
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="flex flex-col items-center gap-4 mb-6">
        <Avatar className="h-24 w-24 border-4 border-muted shadow-sm">
          <AvatarImage
            src={preview || ""}
            alt="Pratinjau"
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {formData.user_name
              ? formData.user_name.charAt(0).toUpperCase()
              : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="relative">
          <Input
            id="user_photo"
            name="user_photo"
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
            className="w-full shadow-sm"
          >
            <Camera className="w-4 h-4 mr-2" /> Unggah Foto
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 bg-muted/20 p-4 rounded-xl border border-border/50">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="user_name">
            Nama Lengkap <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="user_name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              className="pl-9"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user_email">
            Alamat Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="user_email"
              name="user_email"
              type="email"
              value={formData.user_email}
              onChange={handleChange}
              className="pl-9"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user_role">
            Role Pengguna <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.user_role}
            onValueChange={handleRoleChange}
            name="user_role"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="juri">Juri</SelectItem>
              <SelectItem value="asisten_juri">Asisten Juri</SelectItem>
              <SelectItem value="koordinator_team">Koordinator Tim</SelectItem>
              <SelectItem value="koordinator_event">
                Koordinator Event
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="user_password">
            Password{" "}
            {user ? "(Opsional)" : <span className="text-red-500">*</span>}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="user_password"
              name="user_password"
              type={showPassword ? "text" : "password"}
              placeholder={
                user
                  ? "Kosongkan jika tidak ingin mengubah password"
                  : "Masukkan password baru"
              }
              value={formData.user_password}
              onChange={handleChange}
              className="pl-9"
              required={!user}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4 border-t">
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

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Kembali ke halaman 1 ketika melakukan pencarian baru
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/users?page=${currentPage}&limit=${usersPerPage}&search=${debouncedSearch}`,
      );
      if (response.data.users) {
        setUsers(response.data.users);
        setTotalUsers(response.data.totalItems || 0);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setUsers(response.data);
        setTotalUsers(response.data.length);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, usersPerPage, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
          { headers: { "Content-Type": "multipart/form-data" } },
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

  const handleToggleStatus = async (userId, currentStatus) => {
    // The backend now handles the toggle, no need to send the new status
    try {
      const response = await api.patch(`/users/${userId}/toggle-status`);
      toast.success(
        response.data.message || "Status pengguna berhasil diperbarui.",
      );
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui status pengguna.",
      );
    }
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsImporting(true);
        const base64Data = event.target.result.split(",")[1];

        const response = await api.post("/users/import", {
          excel_data: base64Data,
        });
        toast.success(
          response.data.message || "Data pengguna berhasil diimpor.",
        );
        setIsImportModalOpen(false);
        fetchUsers();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Gagal mengimpor data pengguna.",
        );
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx");
      const wsData = [
        {
          user_name: "Nama Koordinator 1",
          user_email: "koordinator1@example.com",
          user_password: "password123",
        },
        {
          user_name: "Nama Koordinator 2",
          user_email: "koordinator2@example.com",
          user_password: "password123",
        },
      ];
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "template_import_users.xlsx");
    } catch (error) {
      toast.error(
        "Gagal membuat template Excel. Pastikan library xlsx telah terinstall.",
      );
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

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
      case "superadmin":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200/50 shadow-none"
          >
            <ShieldAlert className="w-3 h-3 mr-1" /> Admin
          </Badge>
        );
      case "juri":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/50 shadow-none"
          >
            <ShieldCheck className="w-3 h-3 mr-1" /> Juri
          </Badge>
        );
      case "koordinator_team":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50 shadow-none"
          >
            Koor. Tim
          </Badge>
        );
      case "koordinator_event":
        return (
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200/50 shadow-none"
          >
            Koor. Event
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="capitalize">
            {role.replace("_", " ")}
          </Badge>
        );
    }
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Daftar Pengguna
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola hak akses, role, dan data pengguna sistem.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama atau email..."
                className="w-full bg-background pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImportExcel}
            />
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </Button>

            <Button className="w-full sm:w-auto" onClick={() => openDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pengguna
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Profil Pengguna</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow
                    key={user.user_id}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border shadow-sm">
                          <AvatarImage
                            src={
                              user.user_photo
                                ? `${process.env.NEXT_PUBLIC_API_URL}${user.user_photo}`
                                : ""
                            }
                            alt={user.user_name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.user_name
                              ? user.user_name.charAt(0).toUpperCase()
                              : "PU"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">
                            {user.user_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.user_email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-mono text-[10px] tracking-wider text-muted-foreground bg-muted/50 border-border/50"
                      >
                        {user.user_id}
                      </Badge>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.user_role)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active" ? "default" : "secondary"
                        }
                        className={cn(
                          "shadow-none",
                          user.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200/50",
                        )}
                      >
                        {user.status === "active" ? "Aktif" : "Non-aktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleStatus(user.user_id, user.status)
                            }
                          >
                            {user.status === "active" ? (
                              <>
                                <UserX className="mr-2 h-4 w-4 text-amber-600" />
                                <span className="text-amber-600">
                                  Nonaktifkan
                                </span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4 text-emerald-600" />
                                <span className="text-emerald-600">
                                  Aktifkan
                                </span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
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
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Tidak ada data pengguna.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tampilkan</span>
              <Select
                value={usersPerPage.toString()}
                onValueChange={(val) => {
                  setUsersPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                dari {totalUsers} pengguna
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="text-sm font-medium mx-2">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-xl">
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

      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Data Pengguna</DialogTitle>
            <DialogDescription>
              Tambahkan pengguna (Koordinator Tim) secara massal menggunakan
              file Excel (.xlsx).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2 border border-border/50">
              <p className="font-semibold text-foreground">Petunjuk Format:</p>
              <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1 leading-relaxed">
                <li>
                  Baris pertama (header) harus berisi nama kolom persis berikut:{" "}
                  <code className="bg-background border px-1.5 py-0.5 rounded text-xs text-foreground font-mono">
                    user_name
                  </code>
                  ,{" "}
                  <code className="bg-background border px-1.5 py-0.5 rounded text-xs text-foreground font-mono">
                    user_email
                  </code>
                  , dan{" "}
                  <code className="bg-background border px-1.5 py-0.5 rounded text-xs text-foreground font-mono">
                    user_password
                  </code>
                  .
                </li>
                <li>
                  Role akan otomatis diatur sebagai{" "}
                  <strong>Koordinator Tim</strong> dan langsung aktif.
                </li>
                <li>
                  Sistem akan membatalkan seluruh proses import jika terdapat
                  email yang sudah terdaftar atau duplikat dalam file.
                </li>
              </ul>
            </div>
            <Button
              variant="secondary"
              className="w-full shadow-sm"
              onClick={handleDownloadTemplate}
            >
              Unduh Contoh Template (Excel)
            </Button>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Batal
              </Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              disabled={isImporting}
              className="w-full sm:w-auto"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? "Mengimpor..." : "Pilih File & Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
