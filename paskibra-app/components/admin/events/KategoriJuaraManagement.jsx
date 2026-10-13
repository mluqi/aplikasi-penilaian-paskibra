"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Trash2,
  Edit,
  Check,
  X,
  ChevronsUpDown,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function KategoriJuaraManagementCard({
  eventId,
  eventAspeks = [],
  eventTeams = [],
}) {
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formData, setFormData] = useState({
    nama_kategori: "",
    jenis_juara: "juara_kategori",
    tipe_penilaian: "aspek",
    aspek_id: [],
    lainnya_data: [],
    urutan: 0,
    kurangi_penalty: false,
    is_juara_umum: false,
    limit_juara: null,
  });
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [searchManualTeam, setSearchManualTeam] = useState("");

  const teamsList = useMemo(() => {
    if (!Array.isArray(eventTeams)) return [];
    return eventTeams.map((et) => {
      const teamObj = et.Team || et;
      return {
        team_id: teamObj.team_id || et.team_id,
        team_name: teamObj.team_name || et.team_name || "-",
        team_sekolah_instansi:
          teamObj.team_sekolah_instansi || et.team_sekolah_instansi || "",
        nomor_tampil:
          et.nomor_tampil !== undefined && et.nomor_tampil !== null
            ? et.nomor_tampil
            : teamObj.nomor_tampil,
      };
    });
  }, [eventTeams]);

  const fetchKategori = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/rekap/kategori/${eventId}`);
      setKategoriList(res.data.data || []);
    } catch (error) {
      toast.error("Gagal memuat daftar kategori juara.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) fetchKategori();
  }, [eventId, fetchKategori]);

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      const computedJenisJuara =
        item.jenis_juara ||
        (item.is_juara_umum
          ? "juara_umum"
          : item.tipe_penilaian === "global"
            ? "juara_peringkat"
            : "juara_kategori");

      setFormData({
        nama_kategori: item.nama_kategori,
        jenis_juara: computedJenisJuara,
        tipe_penilaian: item.tipe_penilaian,
        aspek_id: item.tipe_penilaian === "aspek" ? item.aspek_id || [] : [],
        lainnya_data:
          item.tipe_penilaian === "lainnya" ? item.aspek_id || [] : [],
        urutan: item.urutan || 0,
        kurangi_penalty: item.kurangi_penalty || false,
        is_juara_umum: computedJenisJuara === "juara_umum",
        limit_juara:
          item.limit_juara !== undefined && item.limit_juara !== null
            ? item.limit_juara
            : null,
      });
    } else {
      setEditingItem(null);
      setFormData({
        nama_kategori: "",
        jenis_juara: "juara_kategori",
        tipe_penilaian: "aspek",
        aspek_id: [],
        lainnya_data: [],
        urutan: 0,
        kurangi_penalty: false,
        is_juara_umum: false,
        limit_juara: null,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_kategori.trim()) {
      toast.error("Nama kategori wajib diisi.");
      return;
    }
    if (formData.tipe_penilaian === "aspek" && formData.aspek_id.length === 0) {
      toast.error("Silakan pilih aspek penilaian.");
      return;
    }
    if (formData.tipe_penilaian === "lainnya") {
      if (formData.lainnya_data.length === 0) {
        toast.error("Silakan tambahkan minimal 1 pemenang/peringkat.");
        return;
      }
      const selectedTeams = formData.lainnya_data
        .map((d) => d.team_id)
        .filter(Boolean);
      if (selectedTeams.length !== formData.lainnya_data.length) {
        toast.error("Silakan pilih tim untuk setiap baris pemenang.");
        return;
      }
      const uniqueTeams = new Set(selectedTeams);
      if (uniqueTeams.size !== selectedTeams.length) {
        toast.error("Tim yang sama tidak boleh diinput lebih dari satu kali.");
        return;
      }
    }

    const payload = {
      event_id: eventId,
      nama_kategori: formData.nama_kategori,
      jenis_juara: formData.jenis_juara,
      tipe_penilaian:
        formData.jenis_juara === "juara_peringkat"
          ? "global"
          : formData.tipe_penilaian,
      urutan: parseInt(formData.urutan) || 0,
      aspek_id:
        formData.tipe_penilaian === "aspek"
          ? formData.aspek_id
          : formData.lainnya_data,
      kurangi_penalty: formData.kurangi_penalty,
      is_juara_umum: formData.jenis_juara === "juara_umum",
      limit_juara:
        formData.limit_juara === null ||
        formData.limit_juara === "" ||
        parseInt(formData.limit_juara, 10) <= 0
          ? null
          : parseInt(formData.limit_juara, 10),
    };

    try {
      if (editingItem) {
        await api.put(`/rekap/kategori/${editingItem.id}`, payload);
        toast.success("Kategori juara berhasil diperbarui.");
      } else {
        await api.post("/rekap/kategori", payload);
        toast.success("Kategori juara berhasil ditambahkan.");
      }
      setIsDialogOpen(false);
      fetchKategori();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan kategori.");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/rekap/kategori/${itemToDelete.id}`);
      toast.success("Kategori juara berhasil dihapus.");
      fetchKategori();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus kategori.");
    } finally {
      setIsAlertOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <Card className="col-span-full shadow-sm border-border/50 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/20 border-b pb-4 pt-5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            Kategori Juara
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              onClick={() => handleOpenDialog()}
              className="shadow-sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kategori
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Urutan</TableHead>
                <TableHead>Nama Kategori Juara</TableHead>
                <TableHead>Jenis Kejuaraan</TableHead>
                <TableHead>Sumber Aspek</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Memuat data kategori...
                  </TableCell>
                </TableRow>
              ) : kategoriList.length > 0 ? (
                kategoriList.map((item) => {
                  const jenisJuara =
                    item.jenis_juara ||
                    (item.is_juara_umum
                      ? "juara_umum"
                      : item.tipe_penilaian === "global"
                        ? "juara_peringkat"
                        : "juara_kategori");

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-center font-semibold">
                        {item.urutan || 0}
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        {item.nama_kategori}
                      </TableCell>
                      <TableCell>
                        {jenisJuara === "juara_umum" ? (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium gap-1">
                            🏆 Juara Umum
                          </Badge>
                        ) : jenisJuara === "juara_peringkat" ? (
                          <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1">
                            🎖️ Juara Peringkat
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-medium gap-1"
                          >
                            🏅 Juara Kategori
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.tipe_penilaian === "global" ? (
                          <span className="text-muted-foreground italic text-xs">
                            Rekap Total Nilai
                          </span>
                        ) : item.tipe_penilaian === "lainnya" ? (
                          <Badge variant="secondary">
                            Manual ({item.aspek_id?.length || 0} Tim)
                          </Badge>
                        ) : (
                          <span className="font-medium text-xs">
                            {item.aspek_id?.length > 0
                              ? item.aspek_id
                                  .map(
                                    (id) =>
                                      eventAspeks.find((a) => a.aspek_id === id)
                                        ?.nama_aspek,
                                  )
                                  .filter(Boolean)
                                  .join(", ")
                              : "Aspek Tidak Valid"}
                          </span>
                        )}
                        {item.kurangi_penalty && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-red-50 text-red-600 border-red-200"
                          >
                            - Penalti
                          </Badge>
                        )}
                        {jenisJuara !== "juara_umum" && (
                          item.limit_juara === 1 ? (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                            >
                              Top 1
                            </Badge>
                          ) : item.limit_juara && item.limit_juara > 0 ? (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            >
                              Top {item.limit_juara}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                            >
                              Semua
                            </Badge>
                          )
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setItemToDelete(item);
                            setIsAlertOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Belum ada kategori juara yang dibuat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Kategori Juara" : "Tambah Kategori Juara"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Urutan Tampil</Label>
                <Input
                  type="number"
                  value={formData.urutan}
                  onChange={(e) =>
                    setFormData({ ...formData, urutan: e.target.value })
                  }
                  placeholder="Misal: 1, 2, 3"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Nama Kategori <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.nama_kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_kategori: e.target.value })
                  }
                  placeholder="Misal: Juara Umum, Juara Peringkat, Juara PBB Dasar"
                  required
                  autoFocus
                />
              </div>

              {/* Pemilihan Jenis Kejuaraan */}
              <div className="space-y-2">
                <Label className="font-semibold text-sm">
                  Jenis Kejuaraan <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div
                    onClick={() =>
                      setFormData({
                        ...formData,
                        jenis_juara: "juara_umum",
                        is_juara_umum: true,
                      })
                    }
                    className={cn(
                      "cursor-pointer rounded-xl border p-3 transition-all",
                      formData.jenis_juara === "juara_umum"
                        ? "border-amber-500 bg-amber-50/50 shadow-xs ring-1 ring-amber-500 dark:border-amber-600 dark:bg-amber-950/20"
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-sm">
                      🏆 Juara Umum
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                      Juara Umum tertinggi (Banner khusus, tanpa label kejuaraan).
                    </p>
                  </div>

                  <div
                    onClick={() =>
                      setFormData({
                        ...formData,
                        jenis_juara: "juara_peringkat",
                        is_juara_umum: false,
                        tipe_penilaian: "aspek",
                      })
                    }
                    className={cn(
                      "cursor-pointer rounded-xl border p-3 transition-all",
                      formData.jenis_juara === "juara_peringkat"
                        ? "border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500 dark:border-blue-600 dark:bg-blue-950/20"
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400 text-sm">
                      🎖️ Juara Peringkat
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                      Mengikuti Template Event (UTAMA 1-3, HARAPAN, MADYA, dst).
                    </p>
                  </div>

                  <div
                    onClick={() =>
                      setFormData({
                        ...formData,
                        jenis_juara: "juara_kategori",
                        is_juara_umum: false,
                      })
                    }
                    className={cn(
                      "cursor-pointer rounded-xl border p-3 transition-all",
                      formData.jenis_juara === "juara_kategori"
                        ? "border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500 dark:border-emerald-600 dark:bg-emerald-950/20"
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      🏅 Juara Kategori
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                      Format penamaan otomatis: &quot;{formData.nama_kategori ? formData.nama_kategori : "Nama Kategori"} Terbaik 1, 2, 3&quot;.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Metode Penilaian <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.tipe_penilaian}
                  onValueChange={(val) =>
                    setFormData({ ...formData, tipe_penilaian: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aspek">
                      Otomatis (Berdasarkan Aspek Penilaian)
                    </SelectItem>
                    <SelectItem value="lainnya">
                      Manual (Input Bebas / Favorit)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Setting Limit Penamaan Juara (Top N) */}
              {formData.jenis_juara !== "juara_umum" && (
                <div className="space-y-2.5 p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Batas Penamaan Juara (Top N)
                    </Label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {formData.limit_juara && formData.limit_juara > 0
                        ? `Top ${formData.limit_juara} Juara`
                        : "Semua Peringkat"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tentukan berapa peringkat teratas yang mendapatkan gelar/nama juara pada kategori ini (seluruh peserta tetap ditampilkan di hasil klasemen).
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { label: "🥇 Top 3 (1-3)", value: 3 },
                      { label: "🏆 Top 1 (Juara 1)", value: 1 },
                      { label: "Top 5 (1-5)", value: 5 },
                      { label: "Top 10 (1-10)", value: 10 },
                      { label: "Semua Peringkat", value: null },
                    ].map((preset) => {
                      const isSelected =
                        (preset.value === null &&
                          (formData.limit_juara === null ||
                            formData.limit_juara === "" ||
                            formData.limit_juara === 0)) ||
                        parseInt(formData.limit_juara, 10) === preset.value;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              limit_juara: preset.value,
                            })
                          }
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-md border font-medium transition-colors cursor-pointer",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-background hover:bg-muted text-foreground border-border",
                          )}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground shrink-0">
                      Atau kustom angka:
                    </span>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Kosongkan jika semua"
                      value={formData.limit_juara ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          limit_juara:
                            e.target.value === ""
                              ? null
                              : Math.max(1, parseInt(e.target.value, 10) || 1),
                        })
                      }
                      className="h-8 w-28 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {formData.tipe_penilaian === "aspek" && (
                <div className="space-y-2">
                  <Label>
                    Pilih Aspek Penilaian <span className="text-red-500">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-input"
                      >
                        {formData.aspek_id.length > 0
                          ? `${formData.aspek_id.length} aspek dipilih`
                          : "Pilih Aspek Penilaian..."}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[300px] max-h-60 overflow-y-auto"
                      align="start"
                    >
                      {eventAspeks.map((aspek) => (
                        <DropdownMenuCheckboxItem
                          key={aspek.aspek_id}
                          checked={formData.aspek_id.includes(aspek.aspek_id)}
                          onCheckedChange={(checked) => {
                            setFormData((prev) => ({
                              ...prev,
                              aspek_id: checked
                                ? [...prev.aspek_id, aspek.aspek_id]
                                : prev.aspek_id.filter(
                                    (id) => id !== aspek.aspek_id,
                                  ),
                            }));
                          }}
                        >
                          {aspek.nama_aspek}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {formData.tipe_penilaian === "lainnya" && (
                <div className="space-y-3 border p-3 rounded-md bg-muted/20">
                  <div className="flex justify-between items-center">
                    <Label className="font-semibold text-sm">
                      Daftar Pemenang / Peringkat Manual
                    </Label>
                  </div>
                  {formData.lainnya_data.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="w-8 text-center font-bold text-sm">
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <DropdownMenu
                          open={openDropdownIndex === idx}
                          onOpenChange={(open) => {
                            setOpenDropdownIndex(open ? idx : null);
                            if (open) setSearchManualTeam("");
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal border-input text-xs"
                            >
                              {item.team_id ? (
                                (() => {
                                  const t = teamsList.find(
                                    (team) => team.team_id === item.team_id,
                                  );
                                  if (!t) return "Pilih Tim Peserta...";
                                  const nomorStr = t.nomor_tampil
                                    ? `[No. ${String(t.nomor_tampil).padStart(2, "0")}] `
                                    : "";
                                  return `${nomorStr}${t.team_name}${
                                    t.team_sekolah_instansi ? ` - ${t.team_sekolah_instansi}` : ""
                                  }`;
                                })()
                              ) : (
                                <span className="text-muted-foreground">
                                  Pilih Tim Peserta...
                                </span>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-[340px] p-2"
                            align="start"
                          >
                            <Input
                              placeholder="Cari nomor tampil / nama tim / sekolah..."
                              value={searchManualTeam}
                              onChange={(e) =>
                                setSearchManualTeam(e.target.value)
                              }
                              className="h-8 text-xs mb-2"
                              autoFocus
                            />
                            <div className="max-h-56 overflow-y-auto space-y-1">
                              {(() => {
                                const search = (searchManualTeam || "").toLowerCase();
                                const filtered = teamsList.filter((t) => {
                                  const matchSearch =
                                    t.team_name
                                      ?.toLowerCase()
                                      .includes(search) ||
                                    t.team_sekolah_instansi
                                      ?.toLowerCase()
                                      .includes(search) ||
                                    (t.nomor_tampil !== undefined &&
                                      t.nomor_tampil !== null &&
                                      String(t.nomor_tampil).includes(search));
                                  const isSelectedOther =
                                    formData.lainnya_data.some(
                                      (d, dIdx) =>
                                        dIdx !== idx &&
                                        d.team_id === t.team_id,
                                    );
                                  return matchSearch && !isSelectedOther;
                                });

                                if (teamsList.length === 0) {
                                  return (
                                    <div className="p-3 text-center text-xs text-muted-foreground">
                                      Belum ada tim peserta terdaftar di event ini.
                                    </div>
                                  );
                                }

                                if (filtered.length === 0) {
                                  return (
                                    <div className="p-3 text-center text-xs text-muted-foreground">
                                      Tim tidak ditemukan.
                                    </div>
                                  );
                                }

                                return filtered.map((t) => (
                                  <div
                                    key={t.team_id}
                                    onClick={() => {
                                      const updated = [
                                        ...formData.lainnya_data,
                                      ];
                                      updated[idx].team_id = t.team_id;
                                      setFormData({
                                        ...formData,
                                        lainnya_data: updated,
                                      });
                                      setOpenDropdownIndex(null);
                                    }}
                                    className={cn(
                                      "px-2.5 py-2 text-xs rounded-md hover:bg-muted cursor-pointer flex flex-col transition-colors",
                                      item.team_id === t.team_id &&
                                        "bg-primary/10 font-bold",
                                    )}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-foreground font-medium truncate">
                                        {t.team_name}
                                      </span>
                                      {t.nomor_tampil !== undefined &&
                                        t.nomor_tampil !== null && (
                                          <span className="text-[10px] font-mono text-primary font-semibold shrink-0">
                                            No. {String(t.nomor_tampil).padStart(2, "0")}
                                          </span>
                                        )}
                                    </div>
                                    {t.team_sekolah_instansi && (
                                      <span className="text-[10px] text-muted-foreground truncate">
                                        {t.team_sekolah_instansi}
                                      </span>
                                    )}
                                  </div>
                                ));
                              })()}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Input
                        type="number"
                        placeholder="Nilai (opsional)"
                        value={item.nilai_akhir || ""}
                        onChange={(e) => {
                          const updated = [...formData.lainnya_data];
                          updated[idx].nilai_akhir = e.target.value;
                          setFormData({
                            ...formData,
                            lainnya_data: updated,
                          });
                        }}
                        className="w-24 text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          const updated = formData.lainnya_data.filter(
                            (_, i) => i !== idx,
                          );
                          setFormData({
                            ...formData,
                            lainnya_data: updated,
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        lainnya_data: [
                          ...formData.lainnya_data,
                          { team_id: "", nilai_akhir: "" },
                        ],
                      });
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Tambah Pemenang
                  </Button>
                </div>
              )}

              <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/10 mt-2">
                <input
                  type="checkbox"
                  id="kurangi_penalty"
                  checked={formData.kurangi_penalty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kurangi_penalty: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                />
                <Label
                  htmlFor="kurangi_penalty"
                  className="font-normal cursor-pointer text-sm"
                >
                  Kurangi total nilai kategori ini dengan poin Penalti Tim
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori Juara?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori ini akan dihapus. Ini tidak akan memengaruhi data nilai
              yang sudah masuk.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
