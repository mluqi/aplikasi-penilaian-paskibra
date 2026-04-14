"use client";

import { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Edit,
  Users,
  Building2,
  X,
  ImageIcon,
  Info,
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

  const logoInputRef = useRef(null);

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
        "Tipe file tidak valid. Harap unggah file gambar (JPG, PNG, WEBP, SVG).",
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

    setLogo(file);
    // Buat URL objek untuk pratinjau
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    if (team?.team_logo) {
      setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL}${team.team_logo}`);
    } else {
      setLogoPreview(null);
    }
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData, logo);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2 px-1">
      {/* ── SEKSI 1: INFORMASI TIM ── */}
      <div className="space-y-5 bg-muted/20 p-5 md:p-6 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2 border-b pb-3">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg text-foreground">
            Informasi Tim
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="team_name">
              Nama Tim <span className="text-red-500">*</span>
            </Label>
            <Input
              id="team_name"
              name="team_name"
              value={formData.team_name}
              onChange={handleChange}
              placeholder="Contoh: Pasukan Inti Garuda"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="team_sekolah_instansi">
              Asal Sekolah/Instansi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="team_sekolah_instansi"
              name="team_sekolah_instansi"
              value={formData.team_sekolah_instansi}
              onChange={handleChange}
              placeholder="Contoh: SMA Negeri 1 Bandung"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team_jumlah_anggota">
              Jumlah Anggota <span className="text-red-500">*</span>
            </Label>
            <Input
              id="team_jumlah_anggota"
              name="team_jumlah_anggota"
              type="number"
              value={formData.team_jumlah_anggota}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          {(user?.role === "admin" || user?.role === "superadmin") && (
            <div className="space-y-2">
              <Label htmlFor="koordinator_id">
                Koordinator <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.koordinator_id}
                onValueChange={handleCoordinatorChange}
                name="koordinator_id"
                required
              >
                <SelectTrigger>
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
        </div>
      </div>

      {/* ── SEKSI 2: LOGO TIM ── */}
      <div className="space-y-5 bg-muted/20 p-5 md:p-6 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2 border-b pb-3">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg text-foreground">Logo Tim</h3>
        </div>
        <div className="flex items-start gap-5">
          {logoPreview ? (
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border shadow-sm bg-white shrink-0">
              <Image
                src={logoPreview}
                alt="Pratinjau Logo Team"
                fill
                className="object-contain p-2"
                onError={() => setLogoPreview(null)}
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl border border-dashed flex items-center justify-center bg-muted/50 text-muted-foreground shrink-0">
              <ImageIcon className="w-8 h-8 opacity-40" />
            </div>
          )}
          <div className="flex-1 space-y-2 pt-1">
            <Label htmlFor="team_logo" className="text-sm">
              Unggah Logo (Opsional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="team_logo"
                name="team_logo"
                type="file"
                onChange={handleLogoChange}
                accept="image/*"
                ref={logoInputRef}
                className="flex-1"
              />
              {logo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveLogo}
                  title="Batal pilih logo"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Format yang didukung: JPG, PNG, WEBP, SVG. Maksimal ukuran file:
              2MB.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4 border-t">
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

      // Hanya ambil data semua user jika yang login adalah admin/superadmin
      if (user?.role === "admin" || user?.role === "superadmin") {
        const usersRes = await api.get("/users");
        setCoordinators(
          usersRes.data.filter((u) => u.user_role === "koordinator_team"),
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
          { headers: { "Content-Type": "multipart/form-data" } },
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

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Detail Tim</TableHead>
                <TableHead>Asal Instansi</TableHead>
                <TableHead>Kepesertaan</TableHead>
                <TableHead>Koordinator</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <TableRow
                    key={team.team_id}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border shadow-sm bg-white flex items-center justify-center p-1">
                          <Image
                            src={
                              team.team_logo
                                ? `${process.env.NEXT_PUBLIC_API_URL}${team.team_logo}`
                                : "/default-logo.png"
                            }
                            alt={`Logo ${team.team_name}`}
                            width={40}
                            height={40}
                            className="object-contain"
                            onError={(e) =>
                              (e.currentTarget.src = "/default-logo.png")
                            }
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/admin/teams/${team.team_id}`}
                            className="font-bold text-sm md:text-base text-foreground hover:text-primary transition-colors truncate"
                            title={team.team_name}
                          >
                            {team.team_name}
                          </Link>
                          <div className="flex items-center mt-1">
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 font-mono tracking-wider text-muted-foreground bg-muted/50 border-border/50"
                            >
                              {team.team_id}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4 shrink-0 opacity-70" />
                        <span
                          className="truncate max-w-[200px] sm:max-w-[250px]"
                          title={team.team_sekolah_instansi}
                        >
                          {team.team_sekolah_instansi}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-md w-fit border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
                        <Users className="h-3.5 w-3.5" />
                        {team.current_member_count || 0} /{" "}
                        {team.team_jumlah_anggota} Anggota
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {team.User?.user_name?.charAt(0).toUpperCase() || "-"}
                        </div>
                        <span
                          className="text-sm font-medium truncate max-w-[120px]"
                          title={team.User?.user_name || "-"}
                        >
                          {team.User?.user_name || "-"}
                        </span>
                      </div>
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
                  <TableCell colSpan={5} className="h-24 text-center">
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedTeam ? "Edit Team" : "Tambah Team Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-2">
            <TeamForm
              user={user}
              team={selectedTeam}
              coordinators={coordinators}
              onSave={handleSaveTeam}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
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
