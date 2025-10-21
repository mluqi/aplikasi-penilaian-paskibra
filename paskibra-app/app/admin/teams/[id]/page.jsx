"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/service/api";
import { toast } from "sonner";
import Image from "next/image";
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
                !formData.anggota_tanggal_lahir && "text-muted-foreground"
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
          anggotaData
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
        `/anggota/${selectedAnggota.anggota_id}`
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
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/teams">Manajemen Tim</BreadcrumbLink>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={
                team.team_logo
                  ? `${process.env.NEXT_PUBLIC_API_URL}${team.team_logo}`
                  : "/default-logo.png"
              }
              alt={`Logo ${team.team_name}`}
              width={64}
              height={64}
              className="rounded-lg border object-contain p-1"
            />
            <div>
              <h1 className="text-2xl font-semibold">{team.team_name}</h1>
              <p className="text-muted-foreground">
                {team.team_sekolah_instansi}
              </p>
            </div>
          </div>
          <Button onClick={() => openDialog()} disabled={isTeamFull}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Anggota
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Anggota</TableHead>
                <TableHead>Nama Anggota</TableHead>
                <TableHead>Tempat, Tanggal Lahir</TableHead>
                <TableHead className="text-center">Danton</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anggota.length > 0 ? (
                anggota.map((item) => (
                  <TableRow key={item.anggota_id}>
                    <TableCell className="font-mono text-xs">
                      {item.anggota_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.anggota_nama}
                    </TableCell>
                    <TableCell>
                      {item.anggota_tempat_lahir},{" "}
                      {format(
                        new Date(item.anggota_tanggal_lahir),
                        "d MMMM yyyy",
                        { locale: id }
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.anggota_is_danton ? (
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
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
                  <TableCell colSpan="5" className="h-24 text-center">
                    Belum ada anggota di tim ini.
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
