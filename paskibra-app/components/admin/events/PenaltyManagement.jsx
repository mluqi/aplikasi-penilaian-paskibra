"use client";

import { useState, useEffect, useCallback } from "react";
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
  DialogDescription,
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
import { PlusCircle, Trash2, AlertTriangle, Gavel } from "lucide-react";

export const PenaltyManagementCard = ({ eventId }) => {
  const [eventPenalties, setEventPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [namaPelanggaran, setNamaPelanggaran] = useState("");
  const [poinPotongan, setPoinPotongan] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchPenalties = useCallback(async () => {
    setLoading(true);
    try {
      const eventRes = await api.get(`/penalties/event/${eventId}`);
      setEventPenalties(eventRes.data.data || []);
    } catch (error) {
      toast.error("Gagal memuat data penalti.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) fetchPenalties();
  }, [eventId, fetchPenalties]);

  const handleAddPenalty = async (e) => {
    e.preventDefault();
    if (!namaPelanggaran.trim() || !poinPotongan) {
      toast.error("Nama pelanggaran dan poin potongan wajib diisi.");
      return;
    }

    try {
      await api.post("/penalties/event", {
        event_id: eventId,
        nama_pelanggaran: namaPelanggaran,
        poin_potongan: parseInt(poinPotongan),
      });
      toast.success("Aturan penalti berhasil ditambahkan.");
      setIsDialogOpen(false);
      setNamaPelanggaran("");
      setPoinPotongan("");
      fetchPenalties();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menambahkan penalti.",
      );
    }
  };

  const handleDeletePenalty = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/penalties/event/${itemToDelete.id}`);
      toast.success("Penalti berhasil dicabut dari event.");
      fetchPenalties();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus penalti.");
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
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            Aturan Penalti & Pelanggaran
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="shadow-sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Aturan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pelanggaran / Penalti</TableHead>
                <TableHead className="w-[200px] text-center">
                  Poin Potongan
                </TableHead>
                <TableHead className="text-right w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Memuat data penalti...
                  </TableCell>
                </TableRow>
              ) : eventPenalties.length > 0 ? (
                eventPenalties.map((ep) => (
                  <TableRow key={ep.id}>
                    <TableCell className="font-medium text-destructive">
                      {ep.nama_pelanggaran}
                    </TableCell>
                    <TableCell className="text-center font-bold text-destructive">
                      -{Math.abs(ep.poin_potongan || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-red-600"
                        onClick={() => {
                          setItemToDelete(ep);
                          setIsAlertOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Belum ada penalti yang diberlakukan di event ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Tambah Penalti */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAddPenalty}>
            <DialogHeader>
              <DialogTitle>Berlakukan Penalti</DialogTitle>
              <DialogDescription>
                Tambahkan aturan penalti baru secara spesifik untuk event ini.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>
                  Nama Pelanggaran <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={namaPelanggaran}
                  onChange={(e) => setNamaPelanggaran(e.target.value)}
                  placeholder="Misal: Melewati garis batas (per orang)"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poin_potongan">
                  Poin Potongan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="poin_potongan"
                  type="number"
                  value={poinPotongan}
                  onChange={(e) => setPoinPotongan(e.target.value)}
                  placeholder="Misal: 15"
                  required
                  min="1"
                />
                <p className="text-[11px] text-muted-foreground">
                  Masukkan angka positif. Sistem akan otomatis menjadikannya
                  pemotongan nilai.
                </p>
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
              <Button
                type="submit"
                disabled={!namaPelanggaran.trim() || !poinPotongan}
              >
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Hapus Penalti */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cabut Aturan Penalti?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pelanggaran ini dari daftar
              aturan event?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePenalty}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const TeamPenaltyManager = ({ eventId, team, onClose }) => {
  const [history, setHistory] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    event_penalty_id: "",
    jumlah: 1,
    catatan: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [histRes, rulesRes] = await Promise.all([
        api.get(`/penalties/${eventId}/${team.team_id}`),
        api.get(`/penalties/event/${eventId}`),
      ]);
      setHistory(histRes.data.data || []);
      setRules(rulesRes.data.data || []);
    } catch (error) {
      toast.error("Gagal memuat data penalti tim.");
    } finally {
      setLoading(false);
    }
  }, [eventId, team.team_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.event_penalty_id || !formData.jumlah || !formData.catatan) {
      toast.error("Pilih pelanggaran, jumlah, dan isi catatan.");
      return;
    }

    try {
      await api.post("/penalties", {
        event_id: eventId,
        team_id: team.team_id,
        event_penalty_id: formData.event_penalty_id,
        jumlah: parseInt(formData.jumlah, 10),
        catatan: formData.catatan,
      });
      toast.success("Penalti berhasil diberikan.");
      setFormData({ event_penalty_id: "", jumlah: 1, catatan: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memberikan penalti.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/penalties/${id}`);
      toast.success("Penalti berhasil dicabut/dihapus.");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus penalti tim.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
          <Gavel className="w-5 h-5 text-red-600" /> Kelola Penalti:{" "}
          {team.team_name}
        </h2>
        <p className="text-sm text-muted-foreground">
          Berikan penalti atau potong nilai berdasarkan pelanggaran yang
          dilakukan saat lomba berlangsung.
        </p>
      </div>

      {/* Form Tambah Penalti */}
      <form
        onSubmit={handleSubmit}
        className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Jenis Pelanggaran <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.event_penalty_id}
              onValueChange={(val) =>
                setFormData({ ...formData, event_penalty_id: val })
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Pilih aturan..." />
              </SelectTrigger>
              <SelectContent>
                {rules.length > 0 ? (
                  rules.map((rule) => (
                    <SelectItem key={rule.id} value={rule.id.toString()}>
                      {rule.nama_pelanggaran} (-{rule.poin_potongan})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Belum ada aturan di event ini.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>
              Jumlah Kejadian/Orang <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              className="bg-background"
              value={formData.jumlah}
              onChange={(e) =>
                setFormData({ ...formData, jumlah: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>
            Catatan / Keterangan <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Misal: Nomor dada 04 dan 05 melintasi garis..."
            className="bg-background"
            value={formData.catatan}
            onChange={(e) =>
              setFormData({ ...formData, catatan: e.target.value })
            }
            required
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="destructive" size="sm">
            <AlertTriangle className="w-4 h-4 mr-2" /> Eksekusi Penalti
          </Button>
        </div>
      </form>

      {/* Riwayat Penalti Tim */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Riwayat Pelanggaran Tim</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Pelanggaran</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="text-center">Total Potongan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-16">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : history.length > 0 ? (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-xs">
                      {item.event_penalty?.nama_pelanggaran} <br />
                      <span className="text-muted-foreground font-normal">
                        Qty: {item.jumlah}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{item.catatan}</TableCell>
                    <TableCell className="text-center font-bold text-destructive">
                      -{item.total_pengurangan}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground h-16"
                  >
                    Belum ada pelanggaran.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
