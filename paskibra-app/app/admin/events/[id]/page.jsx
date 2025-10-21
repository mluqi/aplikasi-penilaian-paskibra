"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusCircle,
  Trash2,
  Users,
  ShieldCheck,
  MoreHorizontal,
  Edit,
  ListTree,
  Settings,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// --- Komponen Manajemen Aspek (Dipindahkan dari aspek/page.jsx) ---

// Komponen Form untuk Create/Update Aspek & Sub-Aspek
const AspekForm = ({
  item,
  onSave,
  onCancel,
  itemType = "aspek",
  maxBobot,
}) => {
  const [formData, setFormData] = useState({
    nama: item?.nama_aspek || item?.nama_subaspek || "",
    bobot: item?.bobot || "",
    urutan: item?.urutan || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload =
      itemType === "aspek"
        ? {
            nama_aspek: formData.nama,
            bobot: formData.bobot,
            urutan: formData.urutan,
          }
        : {
            nama_subaspek: formData.nama,
            bobot: formData.bobot,
            urutan: formData.urutan,
          };
    await onSave(payload);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="nama" className="text-right">
          Nama {itemType === "aspek" ? "Aspek" : "Sub-Aspek"}
        </Label>
        <Input
          id="nama"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="bobot" className="text-right">
          Bobot (%)
        </Label>
        <Input
          id="bobot"
          name="bobot"
          type="number"
          step="0.01"
          max={maxBobot.toFixed(2)}
          min="0"
          value={formData.bobot}
          onChange={handleChange}
          className="col-span-3"
          required
        />
        <p className="col-start-2 col-span-3 text-xs text-muted-foreground mt-1">
          Maksimal bobot yang bisa diinput:{" "}
          <span className="font-bold">{maxBobot.toFixed(2)}%</span>
        </p>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="urutan" className="text-right">
          Urutan
        </Label>
        <Input
          id="urutan"
          name="urutan"
          type="number"
          value={formData.urutan}
          onChange={handleChange}
          className="col-span-3"
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

const SubAspekManager = ({ aspek, onBack }) => {
  const [subAspeks, setSubAspeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubAspek, setSelectedSubAspek] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [totalBobot, setTotalBobot] = useState(0);

  const fetchSubAspeks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/aspek/${aspek.aspek_id}/subaspek`);
      setSubAspeks(response.data);
      const total = response.data.reduce(
        (acc, sub) => acc + parseFloat(sub.bobot || 0),
        0
      );
      setTotalBobot(total);
    } catch (error) {
      toast.error("Gagal memuat data sub-aspek.");
    } finally {
      setLoading(false);
    }
  }, [aspek.aspek_id]);

  useEffect(() => {
    fetchSubAspeks();
  }, [fetchSubAspeks]);

  const handleSaveSubAspek = async (subAspekData) => {
    try {
      const payload = {
        ...subAspekData,
        aspek_id: aspek.aspek_id,
        event_id: aspek.event_id, // Menambahkan event_id ke payload
      };
      if (selectedSubAspek) {
        await api.put(
          `/aspek/subaspek/${selectedSubAspek.subaspek_id}`,
          payload
        );
        toast.success("Sub-aspek berhasil diperbarui.");
      } else {
        await api.post(`/aspek/${aspek.aspek_id}/subaspek`, payload);
        toast.success("Sub-aspek berhasil dibuat.");
      }
      setIsFormOpen(false);
      fetchSubAspeks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan.");
    }
  };

  const handleDeleteSubAspek = async () => {
    if (!selectedSubAspek) return;
    try {
      await api.delete(`/aspek/subaspek/${selectedSubAspek.subaspek_id}`);
      toast.success("Sub-aspek berhasil dihapus.");
      fetchSubAspeks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menghapus sub-aspek."
      );
    } finally {
      setIsAlertOpen(false);
    }
  };

  const openFormDialog = (subAspek = null) => {
    setSelectedSubAspek(subAspek);
    setIsFormOpen(true);
  };

  const openDeleteAlert = (subAspek) => {
    setSelectedSubAspek(subAspek);
    setIsAlertOpen(true);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Kelola Sub-Aspek</DialogTitle>
        <DialogDescription>
          Daftar sub-aspek untuk: <strong>{aspek.nama_aspek}</strong>
        </DialogDescription>
      </DialogHeader>
      <div className="my-4 flex justify-between items-center">
        <Button onClick={() => openFormDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Sub-Aspek
        </Button>
        <div className="text-sm font-medium text-muted-foreground">
          Total Bobot:{" "}
          <span
            className={`font-bold ${
              totalBobot > 100 ? "text-red-500" : "text-primary"
            }`}
          >
            {totalBobot.toFixed(2)} / 100
          </span>
        </div>
      </div>
      <div className="rounded-lg border max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Sub-Aspek</TableHead>
              <TableHead>Bobot</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : subAspeks.length > 0 ? (
              subAspeks.map((sub) => (
                <TableRow key={sub.subaspek_id}>
                  <TableCell>{sub.nama_subaspek}</TableCell>
                  <TableCell>{sub.bobot}%</TableCell>
                  <TableCell>{sub.urutan}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openFormDialog(sub)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => openDeleteAlert(sub)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Belum ada sub-aspek.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
      </DialogFooter>

      {/* Dialog Form Sub-Aspek (nested) */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubAspek ? "Edit" : "Tambah"} Sub-Aspek
            </DialogTitle>
          </DialogHeader>
          <AspekForm
            item={selectedSubAspek}
            onSave={handleSaveSubAspek}
            onCancel={() => setIsFormOpen(false)}
            itemType="sub-aspek"
            maxBobot={
              100 - totalBobot + parseFloat(selectedSubAspek?.bobot || 0)
            }
          />
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Delete Sub-Aspek (nested) */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus sub-aspek secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubAspek}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const AspekManagementCard = ({ eventId }) => {
  const [aspeks, setAspeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAspek, setSelectedAspek] = useState(null);
  const [isAspekDialogOpen, setIsAspekDialogOpen] = useState(false);
  const [isSubAspekManagerOpen, setIsSubAspekManagerOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [totalBobotAspek, setTotalBobotAspek] = useState(0);

  const fetchAspeks = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/aspek?event_id=${eventId}`);
      setAspeks(response.data);
      const total = response.data.reduce(
        (acc, a) => acc + parseFloat(a.bobot || 0),
        0
      );
      setTotalBobotAspek(total);
    } catch (error) {
      toast.error("Gagal memuat data aspek.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchAspeks();
  }, [eventId]);

  const handleSaveAspek = async (aspekData) => {
    try {
      const payload = { ...aspekData, event_id: eventId };
      if (selectedAspek) {
        await api.put(`/aspek/${selectedAspek.aspek_id}`, payload);
        toast.success("Aspek berhasil diperbarui.");
      } else {
        await api.post("/aspek", payload);
        toast.success("Aspek berhasil dibuat.");
      }
      setIsAspekDialogOpen(false);
      fetchAspeks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan.");
    }
  };

  const handleDeleteAspek = async () => {
    if (!selectedAspek) return;
    try {
      await api.delete(`/aspek/${selectedAspek.aspek_id}`);
      toast.success("Aspek berhasil dihapus.");
      fetchAspeks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus aspek.");
    } finally {
      setIsAlertOpen(false);
    }
  };

  const openAspekDialog = (aspek = null) => {
    setSelectedAspek(aspek);
    setIsAspekDialogOpen(true);
  };

  const openSubAspekManager = (aspek) => {
    setSelectedAspek(aspek);
    setIsSubAspekManagerOpen(true);
  };

  const openAlert = (aspek) => {
    setSelectedAspek(aspek);
    setIsAlertOpen(true);
  };

  return (
    <>
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Aspek Penilaian
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground">
              Total Bobot Aspek:{" "}
              <span
                className={`font-bold ${
                  totalBobotAspek > 100 ? "text-red-500" : "text-primary"
                }`}
              >
                {totalBobotAspek.toFixed(2)} / 100
              </span>
            </div>
          </div>
          <Button size="sm" onClick={() => openAspekDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Aspek
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Aspek</TableHead>
                <TableHead>Bobot</TableHead>
                <TableHead>Urutan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Memuat data aspek...
                  </TableCell>
                </TableRow>
              ) : aspeks.length > 0 ? (
                aspeks.map((aspek) => (
                  <TableRow key={aspek.aspek_id}>
                    <TableCell className="font-medium">
                      {aspek.nama_aspek}
                    </TableCell>
                    <TableCell>{aspek.bobot}%</TableCell>
                    <TableCell>{aspek.urutan}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openSubAspekManager(aspek)}
                          >
                            <ListTree className="mr-2 h-4 w-4" />
                            <span>Kelola Sub-Aspek</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openAspekDialog(aspek)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => openAlert(aspek)}
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
                  <TableCell colSpan={4} className="h-24 text-center">
                    Belum ada aspek penilaian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Form Aspek */}
      <Dialog open={isAspekDialogOpen} onOpenChange={setIsAspekDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedAspek ? "Edit Aspek" : "Tambah Aspek Baru"}
            </DialogTitle>
          </DialogHeader>
          <AspekForm
            item={selectedAspek}
            onSave={handleSaveAspek}
            onCancel={() => setIsAspekDialogOpen(false)}
            itemType="aspek"
            maxBobot={
              100 - totalBobotAspek + parseFloat(selectedAspek?.bobot || 0)
            }
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Manager Sub-Aspek */}
      <Dialog
        open={isSubAspekManagerOpen}
        onOpenChange={setIsSubAspekManagerOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          {selectedAspek && (
            <SubAspekManager
              aspek={selectedAspek}
              onBack={() => setIsSubAspekManagerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Delete Aspek */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus aspek beserta semua sub-aspek di
              dalamnya secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAspek}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// --- Komponen Utama Halaman ---

export default function EventDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const eventId = params.id;

  const [event, setEvent] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [allJuries, setAllJuries] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedJuri, setSelectedJuri] = useState("");
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!eventId) return;
    try {
      const eventRes = await api.get(`/events/${eventId}`);
      setEvent(eventRes.data.event);

      if (user?.role !== "juri") {
        const [teamsRes, usersRes] = await Promise.all([
          api.get("/teams"),
          api.get("/users"),
        ]);
        setAllTeams(teamsRes.data.teams);
        setAllJuries(usersRes.data.filter((u) => u.user_role === "juri"));
      }
    } catch (error) {
      toast.error("Gagal memuat data detail event.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.role]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleAdd = async (type) => {
    const id = type === "team" ? selectedTeam : selectedJuri;
    if (!id) {
      toast.warning(`Pilih ${type} terlebih dahulu.`);
      return;
    }

    try {
      const payload =
        type === "team"
          ? { event_id: eventId, team_id: id }
          : { event_id: eventId, juri_id: id };
      await api.post(`/events/${type}`, payload);
      toast.success(
        `${type === "team" ? "Tim" : "Juri"} berhasil ditambahkan.`
      );
      fetchData();
      if (type === "team") setSelectedTeam("");
      if (type === "juri") setSelectedJuri("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambahkan.");
    }
  };

  const handleRemove = async () => {
    if (!itemToRemove) return;
    const { type, id } = itemToRemove;

    try {
      const payload =
        type === "team"
          ? { event_id: eventId, team_id: id }
          : { event_id: eventId, juri_id: id };
      await api.delete(`/events/${type}`, { data: payload });
      toast.success(`${type === "team" ? "Tim" : "Juri"} berhasil dihapus.`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus.");
    } finally {
      setIsAlertOpen(false);
      setItemToRemove(null);
    }
  };

  const openAlert = (type, id, name) => {
    setItemToRemove({ type, id, name });
    setIsAlertOpen(true);
  };

  if (loading) return <div>Memuat data...</div>;
  if (!event) return <div>Event tidak ditemukan.</div>;

  const participatingTeamIds = new Set(event.Event_teams.map((t) => t.team_id));
  const availableTeams = allTeams.filter(
    (t) => !participatingTeamIds.has(t.team_id)
  );

  const participatingJuriIds = new Set(event.Event_juris.map((j) => j.juri_id));
  const availableJuries = allJuries.filter(
    (j) => !participatingJuriIds.has(j.user_id)
  );

  return (
    <ProtectedRoute requiredAccess="manage_events">
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
                <BreadcrumbLink href="/admin/events">
                  Manajemen Event
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{event.event_name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Event Header */}
        <div className="flex items-center gap-4">
          <Image
            src={
              event.event_poster
                ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                : "/default-poster.png"
            }
            alt={`Poster ${event.event_name}`}
            width={80}
            height={112}
            className="rounded-lg border object-cover p-1"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {event.event_name}
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(event.event_tanggal), "EEEE, d MMMM yyyy", {
                locale: id,
              })}{" "}
              di {event.event_tempat}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {/* Kolom Tim Peserta */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Tim Peserta
              </CardTitle>
              {user?.role !== "juri" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" /> Tambah Tim
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Tim ke Event</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Select
                        value={selectedTeam}
                        onValueChange={setSelectedTeam}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tim..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTeams.length > 0 ? (
                            availableTeams.map((team) => (
                              <SelectItem
                                key={team.team_id}
                                value={team.team_id}
                              >
                                {team.team_name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              Semua tim sudah terdaftar.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => handleAdd("team")}
                        disabled={!selectedTeam}
                      >
                        Simpan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Tim</TableHead>
                    <TableHead>Nama Tim</TableHead>
                    {user?.role !== "juri" && (
                      <TableHead className="text-right">Aksi</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.Event_teams.length > 0 ? (
                    event.Event_teams.map(({ Team }) => (
                      <TableRow key={Team.team_id}>
                        <TableCell className="font-mono text-xs">
                          {Team.team_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {Team.team_name}
                        </TableCell>
                        {user?.role !== "juri" && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive"
                              onClick={() =>
                                openAlert("team", Team.team_id, Team.team_name)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Belum ada tim peserta.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Kolom Dewan Juri */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Dewan Juri
              </CardTitle>
              {user?.role !== "juri" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" /> Tambah Juri
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Juri ke Event</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Select
                        value={selectedJuri}
                        onValueChange={setSelectedJuri}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih juri..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableJuries.length > 0 ? (
                            availableJuries.map((juri) => (
                              <SelectItem
                                key={juri.user_id}
                                value={juri.user_id}
                              >
                                {juri.user_name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              Semua juri sudah ditugaskan.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => handleAdd("juri")}
                        disabled={!selectedJuri}
                      >
                        Simpan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Juri</TableHead>
                    <TableHead>Nama Juri</TableHead>
                    {user?.role !== "juri" && (
                      <TableHead className="text-right">Aksi</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.Event_juris.length > 0 ? (
                    event.Event_juris.map(({ User }) => (
                      <TableRow key={User.user_id}>
                        <TableCell className="font-mono text-xs">
                          {User.user_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {User.user_name}
                        </TableCell>
                        {user?.role !== "juri" && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive"
                              onClick={() =>
                                openAlert("juri", User.user_id, User.user_name)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Belum ada juri yang ditugaskan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Kartu Manajemen Aspek */}
          {user?.role !== "juri" && <AspekManagementCard eventId={eventId} />}
        </div>
      </main>

      {/* Alert Dialog untuk Konfirmasi Hapus */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus <strong>{itemToRemove?.name}</strong>{" "}
              dari event ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToRemove(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRemove}
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
