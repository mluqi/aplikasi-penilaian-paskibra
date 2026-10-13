"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  DialogClose,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Check,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
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
import { cn } from "@/lib/utils";

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
  const [fotoAllTeam, setFotoAllTeam] = useState(null);
  const [fotoAllTeamPreview, setFotoAllTeamPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logoInputRef = useRef(null);
  const fotoAllTeamInputRef = useRef(null);

  const [openKoordinator, setOpenKoordinator] = useState(false);
  const [searchKoordinator, setSearchKoordinator] = useState("");
  const filteredCoordinators = coordinators.filter((c) =>
    c.user_name.toLowerCase().includes(searchKoordinator.toLowerCase()),
  );

  useEffect(() => {
    if (team?.team_logo) {
      setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL}${team.team_logo}`);
    } else {
      // Jangan tampilkan pratinjau jika tidak ada logo
      setLogoPreview(null);
    }
    if (team?.foto_all_team) {
      setFotoAllTeamPreview(
        `${process.env.NEXT_PUBLIC_API_URL}${team.foto_all_team}`,
      );
    } else {
      setFotoAllTeamPreview(null);
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

    const MAX_SIZE = 1 * 1024 * 1024; // 1MB
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

  const handleFotoAllTeamChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 1 * 1024 * 1024; // 1MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        "Tipe file tidak valid. Harap unggah file gambar (JPG, PNG, WEBP).",
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

    setFotoAllTeam(file);
    setFotoAllTeamPreview(URL.createObjectURL(file));
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

  const handleRemoveFotoAllTeam = () => {
    setFotoAllTeam(null);
    if (team?.foto_all_team) {
      setFotoAllTeamPreview(
        `${process.env.NEXT_PUBLIC_API_URL}${team.foto_all_team}`,
      );
    } else {
      setFotoAllTeamPreview(null);
    }
    if (fotoAllTeamInputRef.current) fotoAllTeamInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData, logo, fotoAllTeam);
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
              <Popover open={openKoordinator} onOpenChange={setOpenKoordinator}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openKoordinator}
                    className={cn(
                      "w-full justify-between font-normal",
                      !formData.koordinator_id && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">
                      {formData.koordinator_id
                        ? coordinators.find(
                            (c) => c.user_id === formData.koordinator_id,
                          )?.user_name
                        : "Pilih Koordinator"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <div className="flex flex-col">
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Cari koordinator..."
                        value={searchKoordinator}
                        onChange={(e) => setSearchKoordinator(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                      {filteredCoordinators.length > 0 ? (
                        filteredCoordinators.map((c) => (
                          <Button
                            key={c.user_id}
                            variant="ghost"
                            className="w-full justify-start font-normal"
                            onClick={() => {
                              handleCoordinatorChange(c.user_id);
                              setOpenKoordinator(false);
                              setSearchKoordinator("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                formData.koordinator_id === c.user_id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {c.user_name}
                          </Button>
                        ))
                      ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          Tidak ditemukan.
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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

      {/* ── SEKSI 3: FOTO TIM ── */}
      <div className="space-y-5 bg-muted/20 p-5 md:p-6 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2 border-b pb-3">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg text-foreground">
            Foto Seluruh Tim
          </h3>
        </div>
        <div className="flex items-start gap-5">
          {fotoAllTeamPreview ? (
            <div className="relative w-32 h-20 rounded-2xl overflow-hidden border shadow-sm bg-white shrink-0">
              <Image
                src={fotoAllTeamPreview}
                alt="Pratinjau Foto Tim"
                fill
                className="object-cover p-1"
                onError={() => setFotoAllTeamPreview(null)}
              />
            </div>
          ) : (
            <div className="w-32 h-20 rounded-2xl border border-dashed flex items-center justify-center bg-muted/50 text-muted-foreground shrink-0">
              <Users className="w-8 h-8 opacity-40" />
            </div>
          )}
          <div className="flex-1 space-y-2 pt-1">
            <Label htmlFor="foto_all_team" className="text-sm">
              Unggah Foto Tim (Opsional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="foto_all_team"
                name="foto_all_team"
                type="file"
                onChange={handleFotoAllTeamChange}
                accept="image/*"
                ref={fotoAllTeamInputRef}
                className="flex-1"
              />
              {fotoAllTeam && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFotoAllTeam}
                  title="Batal pilih foto"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Maksimal ukuran file: 5MB.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4 border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
            Batal
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
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

  const [allEvents, setAllEvents] = useState([]);
  const [filterEvent, setFilterEvent] = useState("all");
  const [filterInstansi, setFilterInstansi] = useState("all");

  const [openEventDropdown, setOpenEventDropdown] = useState(false);
  const [searchEvent, setSearchEvent] = useState("");
  const filteredAllEvents = allEvents.filter((ev) =>
    ev.event_name.toLowerCase().includes(searchEvent.toLowerCase()),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage, setTeamsPerPage] = useState(10);
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: teamsPerPage,
      });
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterEvent !== "all") params.append("event_id", filterEvent);
      if (filterInstansi !== "all") params.append("instansi", filterInstansi);

      const teamsRes = await api.get(`/teams?${params.toString()}`);

      setTeams(teamsRes.data.teams);
      setTotalTeams(teamsRes.data.totalItems || 0);
      setTotalPages(teamsRes.data.totalPages || 0);

      // Hanya ambil data semua user jika yang login adalah admin/superadmin
      if (user?.role === "admin" || user?.role === "superadmin") {
        const usersRes = await api.get("/users");
        setCoordinators(
          usersRes.data.filter((u) => u.user_role === "koordinator_team"),
        );
      }

      const eventsRes = await api.get("/events?limit=100");
      setAllEvents(eventsRes.data.events || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [
    user?.role,
    currentPage,
    teamsPerPage,
    debouncedSearch,
    filterEvent,
    filterInstansi,
  ]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleSaveTeam = async (teamData, logo, fotoAllTeam) => {
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
    if (fotoAllTeam) {
      formData.append("foto_all_team", fotoAllTeam);
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
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight">Daftar Tim</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola tim peserta dari berbagai sekolah atau instansi.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto flex-wrap">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-center gap-2.5 w-full sm:w-auto">
              <Popover
                open={openEventDropdown}
                onOpenChange={setOpenEventDropdown}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openEventDropdown}
                    className="w-full sm:w-[200px] justify-between font-normal shrink-0"
                  >
                    <span className="truncate text-left">
                      {filterEvent === "all"
                        ? "Semua Event"
                        : allEvents.find((ev) => ev.event_id === filterEvent)
                            ?.event_name || "Filter Event"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] min-w-[220px] p-0"
                  align="start"
                >
                  <div className="flex flex-col">
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Cari event..."
                        value={searchEvent}
                        onChange={(e) => setSearchEvent(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start font-normal text-xs"
                        onClick={() => {
                          setFilterEvent("all");
                          setCurrentPage(1);
                          setOpenEventDropdown(false);
                          setSearchEvent("");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            filterEvent === "all" ? "opacity-100" : "opacity-0",
                          )}
                        />
                        Semua Event
                      </Button>
                      {filteredAllEvents.length > 0 ? (
                        filteredAllEvents.map((ev) => (
                          <Button
                            key={ev.event_id}
                            variant="ghost"
                            className="w-full justify-start font-normal text-xs h-auto py-2"
                            onClick={() => {
                              setFilterEvent(ev.event_id);
                              setCurrentPage(1);
                              setOpenEventDropdown(false);
                              setSearchEvent("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0 mt-0.5",
                                filterEvent === ev.event_id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <span className="truncate whitespace-normal text-left">
                              {ev.event_name}
                            </span>
                          </Button>
                        ))
                      ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          Event tidak ditemukan.
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Select
                value={filterInstansi}
                onValueChange={(val) => {
                  setFilterInstansi(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px] shrink-0">
                  <SelectValue placeholder="Tingkat Instansi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tingkat</SelectItem>
                  <SelectItem value="SD">SD/Sederajat</SelectItem>
                  <SelectItem value="SMP">SMP/Sederajat</SelectItem>
                  <SelectItem value="SMA">SMA/Sederajat</SelectItem>
                  <SelectItem value="Umum">Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama atau instansi..."
                className="w-full bg-background pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              className="w-full sm:w-auto shrink-0 whitespace-nowrap justify-center"
              onClick={() => openDialog()}
            >
              <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
              Tambah Tim
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[280px] text-xs font-semibold">Detail Tim</TableHead>
                <TableHead className="hidden md:table-cell text-xs font-semibold">Asal Instansi</TableHead>
                <TableHead className="text-xs font-semibold">Kepesertaan</TableHead>
                <TableHead className="text-xs font-semibold">Koordinator</TableHead>
                <TableHead className="text-right text-xs font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <TableRow
                    key={team.team_id}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full overflow-hidden border shadow-sm bg-white flex items-center justify-center p-1">
                          <Image
                            src={
                              team.team_logo
                                ? `${process.env.NEXT_PUBLIC_API_URL}${team.team_logo}`
                                : "/default-logo.png"
                            }
                            alt={`Logo ${team.team_name}`}
                            width={36}
                            height={36}
                            className="object-contain"
                            onError={(e) =>
                              (e.currentTarget.src = "/default-logo.png")
                            }
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/admin/teams/${team.team_id}`}
                            className="font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors line-clamp-2 md:line-clamp-1 leading-snug whitespace-normal md:whitespace-nowrap md:truncate break-words"
                            title={team.team_name}
                          >
                            {team.team_name}
                          </Link>
                          {/* Asal Instansi di bawah nama tim saat tampilan mobile */}
                          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground font-normal md:hidden">
                            <Building2 className="h-3 w-3 shrink-0 opacity-70" />
                            <span
                              className="truncate max-w-[160px]"
                              title={team.team_sekolah_instansi}
                            >
                              {team.team_sekolah_instansi}
                            </span>
                          </div>
                          <div className="flex items-center mt-0.5">
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1 py-0 font-mono tracking-wider text-muted-foreground bg-muted/50 border-border/50"
                            >
                              {team.team_id}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2.5">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span
                          className="truncate max-w-[180px] sm:max-w-[220px]"
                          title={team.team_sekolah_instansi}
                        >
                          {team.team_sekolah_instansi}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-md w-fit border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm whitespace-nowrap">
                        <Users className="h-3 w-3 shrink-0" />
                        {team.current_member_count || 0} /{" "}
                        {team.team_jumlah_anggota}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                          {team.User?.user_name?.charAt(0).toUpperCase() || "-"}
                        </div>
                        <span
                          className="text-xs sm:text-sm font-medium truncate max-w-[110px]"
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

        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tampilkan</span>
              <Select
                value={teamsPerPage.toString()}
                onValueChange={(val) => {
                  setTeamsPerPage(Number(val));
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
                dari {totalTeams} tim
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
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
