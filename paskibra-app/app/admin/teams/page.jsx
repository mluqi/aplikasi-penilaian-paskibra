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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Trash2, Edit, Users } from "lucide-react";
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
import Image from "next/image";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Komponen Form untuk Create/Update Team
const TeamForm = ({ user, team, coordinators, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    team_name: team?.team_name || "",
    team_sekolah_instansi: team?.team_sekolah_instansi || "",
    team_jumlah_anggota: team?.team_jumlah_anggota || 16,
    koordinator_id: team?.koordinator_id || "",
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (team?.team_logo) {
      setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL}${team.team_logo}`);
    } else {
      // Jangan tampilkan pratinjau jika tidak ada logo
      setLogoPreview(null);
    }
  }, [team]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoordinatorChange = (value) => {
    setFormData((prev) => ({ ...prev, koordinator_id: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        "Tipe file tidak valid. Harap unggah file gambar (JPG, PNG, WEBP, SVG)."
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

    setLogo(file);
    // Buat URL objek untuk pratinjau
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData, logo);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-6 items-center gap-4">
        <Label htmlFor="team_name" className="text-right col-span-2">
          Nama Team
        </Label>
        <Input
          id="team_name"
          name="team_name"
          value={formData.team_name}
          onChange={handleChange}
          className="col-span-4"
          required
        />
      </div>
      <div className="grid grid-cols-6 items-center gap-4">
        <Label
          htmlFor="team_sekolah_instansi"
          className="text-right col-span-2"
        >
          Instansi
        </Label>
        <Input
          id="team_sekolah_instansi"
          name="team_sekolah_instansi"
          value={formData.team_sekolah_instansi}
          onChange={handleChange}
          className="col-span-4"
          required
        />
      </div>
      <div className="grid grid-cols-6 items-center gap-4">
        <Label htmlFor="team_jumlah_anggota" className="text-right col-span-2">
          Jumlah Anggota
        </Label>
        <Input
          id="team_jumlah_anggota"
          name="team_jumlah_anggota"
          type="number"
          value={formData.team_jumlah_anggota}
          onChange={handleChange}
          className="col-span-4"
          required
          min="1"
        />
      </div>
      {logoPreview && (
        <div className="grid grid-cols-6 items-center gap-4">
          <Label className="text-right col-span-2"></Label>
          <div className="col-span-3">
            <Image
              src={logoPreview}
              alt="Pratinjau Logo Team"
              width={80}
              height={80}
              className="rounded-md border object-contain p-1"
              onError={() => setLogoPreview(null)} // Sembunyikan jika URL rusak
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-6 items-center gap-4">
        <Label htmlFor="team_logo" className="text-right col-span-2">
          Logo Team
        </Label>
        <Input
          id="team_logo"
          name="team_logo"
          type="file"
          onChange={handleLogoChange}
          className="col-span-4"
          accept="image/*"
        />
      </div>
      {user?.role === "admin" && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="koordinator_id" className="text-right">
            Koordinator
          </Label>
          <Select
            value={formData.koordinator_id}
            onValueChange={handleCoordinatorChange}
            name="koordinator_id"
            required
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Pilih Koordinator" />
            </SelectTrigger>
            <SelectContent>
              {coordinators.map((c) => (
                <SelectItem key={c.user_id} value={c.user_id}>
                  {c.user_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
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

export default function TeamManagementPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Selalu ambil data Team
      const teamsRes = await api.get("/teams");
      setTeams(teamsRes.data.teams);

      // Hanya ambil data semua user jika yang login adalah admin
      if (user?.role === "admin") {
        const usersRes = await api.get("/users");
        setCoordinators(
          usersRes.data.filter((u) => u.user_role === "koordinator_team")
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTeam = async (teamData, logo) => {
    const formData = new FormData();

    Object.keys(teamData).forEach((key) => {
      formData.append(key, teamData[key]);
    });

    // Jika user adalah koordinator dan sedang membuat Team baru,
    // otomatis set ID koordinatornya.
    if (user?.role === "koordinator_team" && !selectedTeam) {
      formData.set("koordinator_id", user.id);
    }

    if (logo) {
      formData.append("team_logo", logo);
    }

    try {
      if (selectedTeam) {
        const response = await api.put(
          `/teams/${selectedTeam.team_id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success(response.data.message || "Team berhasil diperbarui.");
      } else {
        const response = await api.post("/teams", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(response.data.message || "Team berhasil dibuat.");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan.");
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    try {
      const response = await api.delete(`/teams/${selectedTeam.team_id}`);
      toast.success(response.data.message || "Team berhasil dihapus.");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus Team.");
    } finally {
      setIsAlertOpen(false);
    }
  };

  const openDialog = (team = null) => {
    setSelectedTeam(team);
    setIsDialogOpen(true);
  };

  const openAlert = (team) => {
    setSelectedTeam(team);
    setIsAlertOpen(true);
  };

  return (
    <ProtectedRoute requiredAccess="manage_teams">
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
                <BreadcrumbPage>Manajemen Team</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Daftar Team</h1>
          <Button onClick={() => openDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Team
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Logo</TableHead>
                <TableHead>ID Team</TableHead>
                <TableHead>Nama Team</TableHead>
                <TableHead>Sekolah/Instansi</TableHead>
                <TableHead>Koordinator</TableHead>
                <TableHead className="text-center">Anggota</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="7" className="h-24 text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <TableRow key={team.team_id} className="hover:bg-muted/50">
                    <TableCell>
                      <Image
                        src={
                          team.team_logo
                            ? `${process.env.NEXT_PUBLIC_API_URL}${team.team_logo}`
                            : "/default-logo.png"
                        }
                        alt={`Logo ${team.team_name}`}
                        width={40}
                        height={40}
                        className="rounded-md border object-contain p-0.5"
                        onError={(e) =>
                          (e.currentTarget.src = "/default-logo.png")
                        }
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {team.team_id}
                    </TableCell>
                    <TableCell className="font-medium hover:underline">
                      <Link href={`/admin/teams/${team.team_id}`}>
                        {team.team_name}
                      </Link>
                    </TableCell>
                    <TableCell>{team.team_sekolah_instansi}</TableCell>
                    <TableCell>{team.User?.user_name || "-"}</TableCell>
                    <TableCell className="text-center tabular-nums">
                      {team.current_member_count || 0} /
                      {team.team_jumlah_anggota}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/teams/${team.team_id}`}>
                              <Users className="mr-2 h-4 w-4" />
                              <span>Kelola Anggota</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog(team)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => openAlert(team)}
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
                  <TableCell colSpan="7" className="h-24 text-center">
                    Tidak ada data Team.
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
          if (!open) setSelectedTeam(null);
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTeam ? "Edit Team" : "Tambah Team Baru"}
            </DialogTitle>
          </DialogHeader>
          <TeamForm
            user={user}
            team={selectedTeam}
            coordinators={coordinators}
            onSave={handleSaveTeam}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isAlertOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedTeam(null);
          setIsAlertOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus Team{" "}
              <strong>{selectedTeam?.team_name}</strong> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteTeam}
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
