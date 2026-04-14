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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Edit,
  CalendarIcon,
  Check,
  X,
  Trophy,
  Users,
  Building2,
  UserCircle,
  MapPin,
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
import { cn } from "@/lib/utils";

// Komponen Form untuk Anggota
const AnggotaForm = ({ anggota, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    anggota_nama: anggota?.anggota_nama || "",
    anggota_tempat_lahir: anggota?.anggota_tempat_lahir || "",
    anggota_tanggal_lahir: anggota?.anggota_tanggal_lahir
      ? new Date(anggota.anggota_tanggal_lahir)
      : null,
    anggota_is_danton: anggota?.anggota_is_danton || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "col-span-3 justify-start text-left font-normal",
                !formData.anggota_tanggal_lahir && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.anggota_tanggal_lahir ? (
                format(formData.anggota_tanggal_lahir, "PPP", { locale: id })
              ) : (
                <span>Pilih tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.anggota_tanggal_lahir}
              onSelect={(date) =>
                setFormData((prev) => ({
                  ...prev,
                  anggota_tanggal_lahir: date,
                }))
              }
              initialFocus
              captionLayout="dropdown-buttons"
              fromYear={1990}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="anggota_is_danton" className="text-right">
          Danton
        </Label>
        <Checkbox
          id="anggota_is_danton"
          checked={formData.anggota_is_danton}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, anggota_is_danton: checked }))
          }
        />
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
  const params = useParams();
  const teamId = params.id;
  const [team, setTeam] = useState(null);
  const [anggota, setAnggota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnggota, setSelectedAnggota] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

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

  const handleSaveAnggota = async (anggotaData) => {
    try {
      if (selectedAnggota) {
        const response = await api.put(
          `/anggota/${selectedAnggota.anggota_id}`,
          anggotaData,
        );
        toast.success(response.data.message || "Anggota berhasil diperbarui.");
      } else {
        const response = await api.post(`/anggota/team/${teamId}`, anggotaData);
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

  if (loading) {
    return <div>Memuat data...</div>;
  }

  if (!team) {
    return <div>Tim tidak ditemukan.</div>;
  }

  const isTeamFull = anggota.length >= team.team_jumlah_anggota;

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

        <Card className="shadow-sm border-border/50 overflow-hidden mb-6">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b pb-4 pt-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Daftar Anggota
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px]">ID Anggota</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Tempat, Tanggal Lahir</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anggota.length > 0 ? (
                  anggota.map((item) => (
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
                      <TableCell className="font-bold text-foreground">
                        {item.anggota_nama}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
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
                        {item.anggota_is_danton ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200/50 shadow-none">
                            <Check className="h-3 w-3 mr-1" /> Danton
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm flex items-center gap-1">
                            Anggota
                          </span>
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
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
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

        <Card className="shadow-sm border-border/50 overflow-hidden mb-8">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b pb-4 pt-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              Event yang Diikuti & Donasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Detail Event</TableHead>
                  <TableHead className="text-right">
                    Total Donasi Terkumpul
                  </TableHead>
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
                        <div className="flex flex-col gap-1.5">
                          <Link
                            href={`/admin/teams/${team.team_id}/events/${et.event_id}`}
                            className="font-bold text-foreground hover:text-primary transition-colors text-base"
                          >
                            {et.Event?.event_name}
                          </Link>
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
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-end font-bold text-base text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-200/50 shadow-sm">
                          Rp {(Number(et.balance) || 0).toLocaleString("id-ID")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedAnggota ? "Edit Anggota" : "Tambah Anggota Baru"}
            </DialogTitle>
          </DialogHeader>
          <AnggotaForm
            anggota={selectedAnggota}
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
    </>
  );
}
