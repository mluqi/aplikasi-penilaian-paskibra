"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/service/api";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Edit,
  Check,
  X,
  Loader2,
  Trophy,
  Users,
  Building2,
  UserCircle,
  Camera,
  MapPin,
  CalendarIcon,
  FileText,
  Upload,
  FileCheck,
} from "lucide-react";
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
import useAuth from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const getEventStatusBadge = (eventTanggal) => {
  if (!eventTanggal) return null;
  const target = new Date(eventTanggal);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-200 shadow-none text-[10px] px-1.5 py-0 h-5"
      >
        Belum Mulai
      </Badge>
    );
  } else if (diffDays === 0) {
    return (
      <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-none text-[10px] px-1.5 py-0 h-5">
        Sedang Berlangsung
      </Badge>
    );
  } else {
    return (
      <Badge
        variant="secondary"
        className="shadow-none text-[10px] px-1.5 py-0 h-5"
      >
        Selesai
      </Badge>
    );
  }
};

// Komponen Form untuk Anggota
const AnggotaForm = ({ anggota, allAnggota = [], onSave, onCancel }) => {
  // Hitung jumlah anggota berdasarkan tipe, kecualikan anggota yang sedang diedit
  const currentDantonCount = allAnggota.filter(
    (a) => a.anggota_tipe === "danton" && a.anggota_id !== anggota?.anggota_id,
  ).length;
  const currentPasukanCount = allAnggota.filter(
    (a) =>
      a.anggota_tipe === "anggota pasukan" &&
      a.anggota_id !== anggota?.anggota_id,
  ).length;
  const currentCadanganCount = allAnggota.filter(
    (a) =>
      a.anggota_tipe === "anggota cadangan" &&
      a.anggota_id !== anggota?.anggota_id,
  ).length;

  // Tentukan apakah dropdown disable (melebihi batas)
  const isDantonDisabled = currentDantonCount >= 1;
  const isPasukanDisabled = currentPasukanCount >= 15;
  const isCadanganDisabled = currentCadanganCount >= 4;

  // Atur pilihan default (utamakan peran yang belum penuh)
  const defaultTipe =
    anggota?.anggota_tipe ||
    (!isPasukanDisabled
      ? "anggota pasukan"
      : !isCadanganDisabled
        ? "anggota cadangan"
        : !isDantonDisabled
          ? "danton"
          : "pelatih");

  const [formData, setFormData] = useState({
    anggota_nama: anggota?.anggota_nama || "",
    anggota_tempat_lahir: anggota?.anggota_tempat_lahir || "",
    anggota_tanggal_lahir: anggota?.anggota_tanggal_lahir
      ? new Date(anggota.anggota_tanggal_lahir)
      : new Date(2000, 0, 1),
    anggota_tipe: defaultTipe,
  });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(
    anggota?.anggota_foto
      ? `${process.env.NEXT_PUBLIC_API_URL}${anggota.anggota_foto}`
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 1 * 1024 * 1024; // Maksimal 1MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        "Tipe file tidak valid. Harap unggah gambar (JPG, PNG, WEBP).",
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

    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData, foto);
    setIsSubmitting(false);
  };

  const handleDatePartChange = (part, value) => {
    const newDate = formData.anggota_tanggal_lahir
      ? new Date(formData.anggota_tanggal_lahir)
      : new Date();
    if (part === "year") newDate.setFullYear(parseInt(value));
    if (part === "month") newDate.setMonth(parseInt(value)); // JS months are 0-indexed
    if (part === "day") newDate.setDate(parseInt(value));

    setFormData((prev) => ({ ...prev, anggota_tanggal_lahir: newDate }));
  };

  const years = Array.from(
    { length: 50 },
    (_, i) => new Date().getFullYear() - i,
  );
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(0, i), "MMMM", { locale: id }),
  }));
  const daysInMonth = formData.anggota_tanggal_lahir
    ? new Date(
        formData.anggota_tanggal_lahir.getFullYear(),
        formData.anggota_tanggal_lahir.getMonth() + 1,
        0,
      ).getDate()
    : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24 border-4 border-muted shadow-sm">
          <AvatarImage
            src={fotoPreview || ""}
            alt="Pratinjau"
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {formData.anggota_nama
              ? formData.anggota_nama.charAt(0).toUpperCase()
              : "A"}
          </AvatarFallback>
        </Avatar>
        <div className="relative">
          <Input
            id="anggota_foto"
            name="anggota_foto"
            type="file"
            onChange={handleFotoChange}
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

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="anggota_nama" className="text-right">
          Nama Lengkap
        </Label>
        <Input
          id="anggota_nama"
          name="anggota_nama"
          value={formData.anggota_nama}
          onChange={handleChange}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="anggota_tempat_lahir" className="text-right">
          Tempat Lahir
        </Label>
        <Input
          id="anggota_tempat_lahir"
          name="anggota_tempat_lahir"
          value={formData.anggota_tempat_lahir}
          onChange={handleChange}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="anggota_tanggal_lahir" className="text-right">
          Tanggal Lahir
        </Label>
        <div className="col-span-3 grid grid-cols-3 gap-2">
          {/* Day Select */}
          <Select
            value={formData.anggota_tanggal_lahir?.getDate().toString()}
            onValueChange={(v) => handleDatePartChange("day", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Hari" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Month Select */}
          <Select
            value={formData.anggota_tanggal_lahir?.getMonth().toString()}
            onValueChange={(v) => handleDatePartChange("month", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Year Select */}
          <Select
            value={formData.anggota_tanggal_lahir?.getFullYear().toString()}
            onValueChange={(v) => handleDatePartChange("year", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="anggota_tipe" className="text-right">
          Tipe Anggota
        </Label>
        <Select
          value={formData.anggota_tipe}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, anggota_tipe: value }))
          }
          name="anggota_tipe"
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Pilih tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pelatih">Pelatih</SelectItem>
            <SelectItem value="danton" disabled={isDantonDisabled}>
              Danton {isDantonDisabled && "(Maks 1)"}
            </SelectItem>
            <SelectItem value="anggota pasukan" disabled={isPasukanDisabled}>
              Anggota Pasukan {isPasukanDisabled && "(Maks 15)"}
            </SelectItem>
            <SelectItem value="anggota cadangan" disabled={isCadanganDisabled}>
              Anggota Cadangan {isCadanganDisabled && "(Maks 4)"}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default function TeamDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const teamId = params.id;
  const [team, setTeam] = useState(null);
  const [anggota, setAnggota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnggota, setSelectedAnggota] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isSuratDialogOpen, setIsSuratDialogOpen] = useState(false);
  const [selectedEventIdForSurat, setSelectedEventIdForSurat] = useState(null);
  const [suratFile, setSuratFile] = useState(null);
  const [isUploadingSurat, setIsUploadingSurat] = useState(false);

  const fetchData = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const [teamRes, anggotaRes] = await Promise.all([
        api.get(`/teams/${teamId}`),
        api.get(`/anggota/team/${teamId}`),
      ]);
      setTeam(teamRes.data.team);
      setAnggota(anggotaRes.data.anggota);
    } catch (error) {
      toast.error("Gagal memuat data tim atau anggota.");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveAnggota = async (anggotaData, foto) => {
    try {
      const formData = new FormData();
      Object.keys(anggotaData).forEach((key) => {
        // Handle date object
        if (anggotaData[key] instanceof Date) {
          formData.append(key, anggotaData[key].toISOString());
        } else {
          formData.append(key, anggotaData[key]);
        }
      });
      if (foto) {
        formData.append("anggota_foto", foto);
      }

      if (selectedAnggota) {
        const response = await api.put(
          `/anggota/${selectedAnggota.anggota_id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        toast.success(response.data.message || "Anggota berhasil diperbarui.");
      } else {
        const response = await api.post(`/anggota/team/${teamId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(response.data.message || "Anggota berhasil ditambahkan.");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan.");
    }
  };

  const handleDeleteAnggota = async () => {
    if (!selectedAnggota) return;
    try {
      const response = await api.delete(
        `/anggota/${selectedAnggota.anggota_id}`,
      );
      toast.success(response.data.message || "Anggota berhasil dihapus.");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus anggota.");
    } finally {
      setIsAlertOpen(false);
    }
  };

  const openDialog = (anggota = null) => {
    setSelectedAnggota(anggota);
    setIsDialogOpen(true);
  };

  const openAlert = (anggota) => {
    setSelectedAnggota(anggota);
    setIsAlertOpen(true);
  };

  const openSuratDialog = (eventId) => {
    setSelectedEventIdForSurat(eventId);
    setSuratFile(null);
    setIsSuratDialogOpen(true);
  };

  const handleUploadSurat = async () => {
    if (!suratFile) {
      toast.warning("Pilih file terlebih dahulu.");
      return;
    }
    setIsUploadingSurat(true);
    try {
      const formData = new FormData();
      formData.append("event_id", selectedEventIdForSurat);
      formData.append("team_id", teamId);
      formData.append("surat_rekomendasi", suratFile);

      await api.put("/events/team/surat-rekomendasi", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Surat rekomendasi berhasil diunggah.");
      setIsSuratDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengunggah surat.");
    } finally {
      setIsUploadingSurat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Memuat data teams...
        </p>
      </div>
    );
  }

  if (!team) {
    return <div>Tim tidak ditemukan.</div>;
  }

  const isTeamFull = anggota.length >= team.team_jumlah_anggota;

  // Pisahkan pelatih dari anggota tim lainnya
  const pelatih = anggota.filter((a) => a.anggota_tipe === "pelatih");
  const anggotaTim = anggota.filter((a) => a.anggota_tipe !== "pelatih");

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
                <BreadcrumbLink href="/admin/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/teams">
                  Manajemen Tim
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{team.team_name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Team Profile Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-6 mb-4">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 bg-white rounded-2xl border shadow-sm flex items-center justify-center p-2 overflow-hidden mx-auto md:mx-0">
              <Image
                src={
                  team.team_logo
                    ? `${process.env.NEXT_PUBLIC_API_URL}${team.team_logo}`
                    : "/default-logo.png"
                }
                alt={`Logo ${team.team_name}`}
                width={112}
                height={112}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex-1 w-full text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">
                {team.team_name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-4">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {team.team_sekolah_instansi}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50"
                >
                  <Users className="w-3.5 h-3.5 mr-1.5" /> {anggota.length} /{" "}
                  {team.team_jumlah_anggota} Anggota
                </Badge>
                <Badge variant="outline" className="shadow-sm">
                  <UserCircle className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  Koordinator: {team.User?.user_name || "-"}
                </Badge>
              </div>
            </div>
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <Button
                onClick={() => openDialog()}
                disabled={isTeamFull}
                className="w-full md:w-auto shadow-sm"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Anggota
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Kolom Pelatih */}
          <div className="xl:col-span-1">
            <Card className="shadow-sm border-border/50 overflow-hidden h-full">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b pb-4 pt-5">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Pelatih & Staf
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {pelatih.length > 0 ? (
                  <div className="space-y-3">
                    {pelatih.map((item) => (
                      <div
                        key={item.anggota_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage
                              src={
                                item.anggota_foto
                                  ? `${process.env.NEXT_PUBLIC_API_URL}${item.anggota_foto}`
                                  : ""
                              }
                              alt={item.anggota_nama}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {item.anggota_nama.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-foreground">
                              {item.anggota_nama}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {item.anggota_tipe}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDialog(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => openAlert(item)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Hapus</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Belum ada pelatih yang ditambahkan.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Kolom Anggota Tim */}
          <div className="xl:col-span-2">
            <Card className="shadow-sm border-border/50 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b pb-4 pt-5">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Anggota Pasukan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[120px]">ID Anggota</TableHead>
                      <TableHead className="w-[80px]">Foto</TableHead>
                      <TableHead>Nama Lengkap</TableHead>
                      <TableHead>Tempat, Tanggal Lahir</TableHead>
                      <TableHead>Posisi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anggotaTim.length > 0 ? (
                      anggotaTim.map((item) => (
                        <TableRow
                          key={item.anggota_id}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="font-mono text-[10px] tracking-wider text-muted-foreground"
                            >
                              {item.anggota_id}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Avatar className="h-10 w-10 border shadow-sm">
                              <AvatarImage
                                src={
                                  item.anggota_foto
                                    ? `${process.env.NEXT_PUBLIC_API_URL}${item.anggota_foto}`
                                    : ""
                                }
                                alt={item.anggota_nama}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {item.anggota_nama.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {item.anggota_nama}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                              {item.anggota_tempat_lahir},{" "}
                              {format(
                                new Date(item.anggota_tanggal_lahir),
                                "d MMM yyyy",
                                { locale: id },
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.anggota_tipe === "danton" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200/50 shadow-none capitalize">
                                <Check className="h-3 w-3 mr-1" /> Danton
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="capitalize shadow-none"
                              >
                                {item.anggota_tipe}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openDialog(item)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => openAlert(item)}
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
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Belum ada anggota di tim ini.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-sm border-border/50 overflow-hidden mb-8">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b pb-4 pt-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              Event yang Diikuti & E-Voting
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Detail Event</TableHead>
                  <TableHead className="text-center">Nomor Tampil</TableHead>
                  <TableHead>Surat Rekomendasi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.Event_teams && team.Event_teams.length > 0 ? (
                  team.Event_teams.map((et) => (
                    <TableRow
                      key={et.event_id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="font-bold text-foreground text-base">
                            {et.Event?.event_name}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CalendarIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                              {et.Event?.event_tanggal
                                ? format(
                                    new Date(et.Event.event_tanggal),
                                    "d MMM yyyy",
                                    { locale: id },
                                  )
                                : "-"}
                            </div>
                            {et.Event?.event_tanggal &&
                              getEventStatusBadge(et.Event.event_tanggal)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {et.nomor_tampil ? (
                          <span className="font-bold text-lg">
                            {et.nomor_tampil}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2 items-start">
                          {et.surat_rekomendasi ? (
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                <FileCheck className="w-3 h-3 mr-1" /> Terunggah
                              </Badge>
                              <a
                                href={`${process.env.NEXT_PUBLIC_API_URL}${et.surat_rekomendasi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3" /> Lihat Surat
                              </a>
                            </div>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-muted-foreground"
                            >
                              Belum ada surat
                            </Badge>
                          )}
                          {user?.role !== "juri" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs mt-1"
                              onClick={() => openSuratDialog(et.event_id)}
                            >
                              <Upload className="w-3 h-3 mr-1" />{" "}
                              {et.surat_rekomendasi
                                ? "Ganti Surat"
                                : "Upload Surat"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/admin/teams/${team.team_id}/events/${et.event_id}`}
                          >
                            Lihat Detail
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Tim ini belum mengikuti event apapun.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedAnggota(null);
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedAnggota ? "Edit Anggota" : "Tambah Anggota Baru"}
            </DialogTitle>
          </DialogHeader>
          <AnggotaForm
            anggota={selectedAnggota}
            allAnggota={anggota}
            onSave={handleSaveAnggota}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isAlertOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedAnggota(null);
          setIsAlertOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus anggota{" "}
              <strong>{selectedAnggota?.anggota_nama}</strong> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAnggota}
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isSuratDialogOpen} onOpenChange={setIsSuratDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Surat Rekomendasi</DialogTitle>
            <DialogDescription>
              Pilih file dokumen surat rekomendasi (PDF/Doc/Image) untuk event
              ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="surat_rekomendasi">File Surat Rekomendasi</Label>
              <Input
                id="surat_rekomendasi"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setSuratFile(e.target.files[0])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSuratDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleUploadSurat}
              disabled={isUploadingSurat || !suratFile}
            >
              {isUploadingSurat ? "Mengunggah..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
