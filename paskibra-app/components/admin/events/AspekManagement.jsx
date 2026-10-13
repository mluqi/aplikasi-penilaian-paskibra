"use client";

import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Trash2,
  Edit,
  ListTree,
  Settings,
  Check,
  X,
  GripVertical,
  Copy,
  MoreHorizontal,
  Info,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const cleanValues = (str) =>
  typeof str === "string"
    ? str
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .join(",")
    : "";

const KATEGORI_GERAKAN_OPTIONS = [
  "Gerakan Diam Ke Berjalan",
  "Gerakan Berjalan Ke Berjalan",
  "Gerakan Berjalan Ke Berhenti",
  "Gerakan Berhenti Ke Berjalan",
  "Gerakan Di Tempat",
  "Gerakan Berpindah Tempat",
  "Gerakan Tambahan",
  "Variasi",
  "Formasi",
];

const MultiScoreInput = ({
  value,
  onChange,
  placeholder,
  size = "default",
  inputClassName,
}) => {
  const vals =
    typeof value === "string" && value.trim() !== ""
      ? value.split(",").map((v) => v.trim())
      : [""];

  const updateVal = (idx, newVal) => {
    const newVals = [...vals];
    newVals[idx] = newVal;
    onChange(newVals.join(","));
  };

  const addVal = () => {
    onChange([...vals, ""].join(","));
  };

  const removeVal = (idx) => {
    const newVals = vals.filter((_, i) => i !== idx);
    if (newVals.length === 0) newVals.push("");
    onChange(newVals.join(","));
  };

  const isSmall = size === "sm";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center",
        isSmall ? "gap-1 justify-center" : "gap-2",
      )}
    >
      {vals.map((v, i) => (
        <div key={i} className="relative group">
          <Input
            type="number"
            value={v}
            onChange={(e) => updateVal(i, e.target.value)}
            className={cn(
              "text-center font-mono",
              isSmall ? "w-12 h-8 px-1" : "w-16 h-10 shadow-sm",
              inputClassName,
            )}
            placeholder={placeholder}
            required
          />
          {vals.length > 1 && (
            <button
              type="button"
              onClick={() => removeVal(i)}
              className={cn(
                "absolute bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10",
                isSmall
                  ? "-top-1.5 -right-1.5 w-3.5 h-3.5"
                  : "-top-2 -right-2 w-4 h-4",
              )}
            >
              <X className={cn(isSmall ? "w-2.5 h-2.5" : "w-3 h-3")} />
            </button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant={isSmall ? "ghost" : "outline"}
        size="icon"
        className={cn("shrink-0", isSmall ? "w-8 h-8" : "w-10 h-10")}
        onClick={addVal}
        title="Tambah Nilai"
      >
        <PlusCircle className={cn(isSmall ? "w-3.5 h-3.5" : "w-4 h-4")} />
      </Button>
    </div>
  );
};

const AspekForm = ({
  item,
  onSave,
  onCancel,
  itemType = "aspek",
  masterCategories = KATEGORI_GERAKAN_OPTIONS,
}) => {
  const [formData, setFormData] = useState({
    nama: item?.nama_aspek || item?.nama_subaspek || "",
    kategori: item?.kategori || "",
    nilai_kurang_sekali: item?.nilai_kurang_sekali || "",
    nilai_kurang: item?.nilai_kurang || "",
    nilai_cukup: item?.nilai_cukup || "",
    nilai_baik: item?.nilai_baik || "",
    nilai_sangat_baik: item?.nilai_sangat_baik || "",
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
            urutan: formData.urutan,
          }
        : {
            nama_subaspek: formData.nama,
            kategori: formData.kategori,
            nilai_kurang_sekali: cleanValues(formData.nilai_kurang_sekali),
            nilai_kurang: cleanValues(formData.nilai_kurang),
            nilai_cukup: cleanValues(formData.nilai_cukup),
            nilai_baik: cleanValues(formData.nilai_baik),
            nilai_sangat_baik: cleanValues(formData.nilai_sangat_baik),
            urutan: formData.urutan,
          };
    await onSave(payload);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-2">
      <div className="space-y-2">
        <Label htmlFor="nama" className="font-semibold text-foreground">
          Nama {itemType === "aspek" ? "Aspek" : "Sub-Aspek"}{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nama"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          placeholder={`Ketikkan nama ${itemType}...`}
          className="h-11"
          required
        />
      </div>
      {itemType === "sub-aspek" && (
        <div className="space-y-2 pt-1">
          <Label htmlFor="kategori" className="font-semibold text-foreground">
            Kategori Gerakan{" "}
            <span className="text-muted-foreground font-normal">
              (Pilih dari Master Kategori)
            </span>
          </Label>
          <Select
            value={formData.kategori || "none"}
            onValueChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                kategori: val === "none" ? "" : val,
              }))
            }
          >
            <SelectTrigger id="kategori" className="h-11 w-full bg-background">
              <SelectValue placeholder="-- Pilih Kategori Gerakan --" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="none">
                <span className="text-muted-foreground italic">-- Tanpa Kategori --</span>
              </SelectItem>
              {Array.from(
                new Set([
                  ...(masterCategories || KATEGORI_GERAKAN_OPTIONS),
                  ...(item?.kategori ? [item.kategori] : []),
                ]),
              )
                .filter(Boolean)
                .map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {itemType === "sub-aspek" && (
        <div className="space-y-3 pt-2">
          <Label className="font-semibold text-foreground">
            Parameter Poin Mutlak{" "}
            <span className="text-muted-foreground font-normal">
              (Opsional / Bebas diisi)
            </span>
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-muted/20 rounded-xl border border-border/50 shadow-sm">
            <div className="space-y-2">
              <Label
                htmlFor="nilai_kurang_sekali"
                className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>{" "}
                K. Sekali
              </Label>
              <Input
                id="nilai_kurang_sekali"
                name="nilai_kurang_sekali"
                value={formData.nilai_kurang_sekali}
                onChange={handleChange}
                className="h-10 border-rose-200 dark:border-rose-900/50 focus-visible:ring-rose-500/30 font-mono text-center text-lg shadow-sm"
                placeholder="4, 5"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="nilai_kurang"
                className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{" "}
                Kurang
              </Label>
              <Input
                id="nilai_kurang"
                name="nilai_kurang"
                value={formData.nilai_kurang}
                onChange={handleChange}
                className="h-10 border-red-200 dark:border-red-900/50 focus-visible:ring-red-500/30 font-mono text-center text-lg shadow-sm"
                placeholder="6, 8"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="nilai_cukup"
                className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>{" "}
                Cukup
              </Label>
              <Input
                id="nilai_cukup"
                name="nilai_cukup"
                value={formData.nilai_cukup}
                onChange={handleChange}
                className="h-10 border-orange-200 dark:border-orange-900/50 focus-visible:ring-orange-500/30 font-mono text-center text-lg shadow-sm"
                placeholder="12, 14, 16"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="nilai_baik"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{" "}
                Baik
              </Label>
              <Input
                id="nilai_baik"
                name="nilai_baik"
                value={formData.nilai_baik}
                onChange={handleChange}
                className="h-10 border-blue-200 dark:border-blue-900/50 focus-visible:ring-blue-500/30 font-mono text-center text-lg shadow-sm"
                placeholder="20, 23, 25"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="nilai_sangat_baik"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                S. Baik
              </Label>
              <Input
                id="nilai_sangat_baik"
                name="nilai_sangat_baik"
                value={formData.nilai_sangat_baik}
                onChange={handleChange}
                className="h-10 border-emerald-200 dark:border-emerald-900/50 focus-visible:ring-emerald-500/30 font-mono text-center text-lg shadow-sm"
                placeholder="25"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" /> Isikan poin angka baku
            sesuai parameter yang digunakan pada event ini (opsional).
          </p>
        </div>
      )}
      <div className="space-y-2 pt-1">
        <Label htmlFor="urutan" className="font-semibold text-foreground">
          Nomor Urut Tampil{" "}
          <span className="text-muted-foreground font-normal">(Opsional)</span>
        </Label>
        <Input
          id="urutan"
          name="urutan"
          type="number"
          value={formData.urutan}
          onChange={handleChange}
          className="h-11 max-w-[150px]"
          placeholder="Contoh: 1"
        />
      </div>
      <DialogFooter className="pt-4 mt-2 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-11"
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting} className="h-11">
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
};

const SubAspekManager = ({
  aspek,
  onBack,
  masterCategories = KATEGORI_GERAKAN_OPTIONS,
}) => {
  const [subAspeks, setSubAspeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const fetchSubAspeks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/aspek/${aspek.aspek_id}/subaspek`);
      const sorted = response.data.sort(
        (a, b) => (a.urutan || 0) - (b.urutan || 0),
      );
      setSubAspeks(sorted);
    } catch (error) {
      toast.error("Gagal memuat data sub-aspek.");
    } finally {
      setLoading(false);
    }
  }, [aspek.aspek_id]);

  useEffect(() => {
    fetchSubAspeks();
  }, [fetchSubAspeks]);

  const handleAddClick = () => {
    setEditingRowId("new");
    setEditFormData({
      nama_subaspek: "",
      kategori: "",
      nilai_kurang_sekali: "",
      nilai_kurang: "",
      nilai_cukup: "",
      nilai_baik: "",
      nilai_sangat_baik: "",
      urutan: "",
    });
  };

  const handleEditClick = (sub) => {
    setEditingRowId(sub.subaspek_id);
    setEditFormData({ ...sub });
  };

  const handleCopyClick = (sub) => {
    setEditingRowId("new");
    setEditFormData({
      nama_subaspek: `${sub.nama_subaspek} (Copy)`,
      kategori: sub.kategori || "",
      nilai_kurang_sekali: sub.nilai_kurang_sekali || "",
      nilai_kurang: sub.nilai_kurang || "",
      nilai_cukup: sub.nilai_cukup || "",
      nilai_baik: sub.nilai_baik || "",
      nilai_sangat_baik: sub.nilai_sangat_baik || "",
      urutan: "",
    });
  };

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newItems = [...subAspeks];
    const [draggedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, draggedItem);

    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      urutan: idx + 1,
    }));

    setSubAspeks(updatedItems);

    try {
      await Promise.all(
        updatedItems.map((sub) =>
          api.put(`/aspek/subaspek/${sub.subaspek_id}`, { urutan: sub.urutan }),
        ),
      );
      toast.success("Urutan berhasil diperbarui.");
    } catch (error) {
      toast.error("Gagal memperbarui urutan ke server.");
      fetchSubAspeks(); // Kembalikan posisi awal jika terjadi gagal
    }
  };

  const saveInlineEdit = async () => {
    const payload = {
      ...editFormData,
      nilai_kurang_sekali: cleanValues(editFormData.nilai_kurang_sekali),
      nilai_kurang: cleanValues(editFormData.nilai_kurang),
      nilai_cukup: cleanValues(editFormData.nilai_cukup),
      nilai_baik: cleanValues(editFormData.nilai_baik),
      nilai_sangat_baik: cleanValues(editFormData.nilai_sangat_baik),
      aspek_id: aspek.aspek_id,
      event_id: aspek.event_id,
      urutan:
        editFormData.urutan ||
        (editingRowId === "new" ? subAspeks.length + 1 : undefined),
    };

    if (!payload.nama_subaspek) {
      toast.error("Nama sub-aspek wajib diisi.");
      return;
    }

    try {
      if (editingRowId === "new") {
        await api.post(`/aspek/${aspek.aspek_id}/subaspek`, payload);
        toast.success("Sub-aspek berhasil dibuat.");
      } else {
        await api.put(`/aspek/subaspek/${editingRowId}`, payload);
        toast.success("Sub-aspek berhasil diperbarui.");
      }
      setEditingRowId(null);
      fetchSubAspeks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan.");
    }
  };

  const handleDeleteSubAspek = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/aspek/subaspek/${itemToDelete.subaspek_id}`);
      toast.success("Sub-aspek berhasil dihapus.");
      fetchSubAspeks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menghapus sub-aspek.",
      );
    } finally {
      setIsAlertOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteAlert = (subAspek) => {
    setItemToDelete(subAspek);
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
        <Button onClick={handleAddClick} disabled={editingRowId !== null}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Sub-Aspek
        </Button>
      </div>
      <div className="rounded-lg border max-h-[60vh] sm:max-h-[65vh] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Urutan</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Nama Sub-Aspek</TableHead>
              <TableHead className="text-center text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/10">
                K. Sekali
              </TableHead>
              <TableHead className="text-center text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/10">
                Kurang
              </TableHead>
              <TableHead className="text-center text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10">
                Cukup
              </TableHead>
              <TableHead className="text-center text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">
                Baik
              </TableHead>
              <TableHead className="text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10">
                S. Baik
              </TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="subaspeks-droppable">
              {(provided) => (
                <tbody
                  data-slot="table-body"
                  className="[&_tr:last-child]:border-0"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
                        Memuat...
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {subAspeks.map((sub, index) => {
                        const isEditing = editingRowId === sub.subaspek_id;
                        if (isEditing) {
                          return (
                            <TableRow
                              key={sub.subaspek_id}
                              className="bg-muted/30"
                            >
                              <TableCell className="text-center font-medium text-muted-foreground">
                                {sub.urutan || index + 1}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={editFormData.kategori || "none"}
                                  onValueChange={(val) =>
                                    handleInputChange("kategori", val === "none" ? "" : val)
                                  }
                                >
                                  <SelectTrigger className="h-8 min-w-[140px] text-xs bg-background">
                                    <SelectValue placeholder="Pilih..." />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    <SelectItem value="none">
                                      <span className="text-muted-foreground italic">-- Tanpa Kategori --</span>
                                    </SelectItem>
                                    {Array.from(
                                      new Set([
                                        ...(masterCategories || KATEGORI_GERAKAN_OPTIONS),
                                        ...(sub?.kategori ? [sub.kategori] : []),
                                      ]),
                                    )
                                      .filter(Boolean)
                                      .map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                          {opt}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={editFormData.nama_subaspek}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "nama_subaspek",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 min-w-[150px]"
                                  autoFocus
                                />
                              </TableCell>
                              <TableCell>
                                <MultiScoreInput
                                  value={editFormData.nilai_kurang_sekali}
                                  onChange={(val) =>
                                    handleInputChange("nilai_kurang_sekali", val)
                                  }
                                  size="sm"
                                />
                              </TableCell>
                              <TableCell>
                                <MultiScoreInput
                                  value={editFormData.nilai_kurang}
                                  onChange={(val) =>
                                    handleInputChange("nilai_kurang", val)
                                  }
                                  size="sm"
                                />
                              </TableCell>
                              <TableCell>
                                <MultiScoreInput
                                  value={editFormData.nilai_cukup}
                                  onChange={(val) =>
                                    handleInputChange("nilai_cukup", val)
                                  }
                                  size="sm"
                                />
                              </TableCell>
                              <TableCell>
                                <MultiScoreInput
                                  value={editFormData.nilai_baik}
                                  onChange={(val) =>
                                    handleInputChange("nilai_baik", val)
                                  }
                                  size="sm"
                                />
                              </TableCell>
                              <TableCell>
                                <MultiScoreInput
                                  value={editFormData.nilai_sangat_baik}
                                  onChange={(val) =>
                                    handleInputChange("nilai_sangat_baik", val)
                                  }
                                  size="sm"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={saveInlineEdit}
                                    className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setEditingRowId(null)}
                                    className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        }
                        return (
                          <Draggable
                            key={sub.subaspek_id}
                            draggableId={String(sub.subaspek_id)}
                            index={index}
                            isDragDisabled={editingRowId !== null}
                          >
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                onDoubleClick={() => handleEditClick(sub)}
                                className={cn(
                                  "border-b transition-colors group",
                                  editingRowId === null ? "" : "",
                                  snapshot.isDragging
                                    ? "bg-muted opacity-90 shadow-lg table-row"
                                    : "hover:bg-muted/50",
                                )}
                                style={{
                                  ...provided.draggableProps.style,
                                  display: snapshot.isDragging ? "table" : "",
                                }}
                                title="Klik 2x untuk mengedit. Tarik (Drag) ikon titik untuk mengubah urutan."
                              >
                                <TableCell className="text-center border-r bg-muted/10">
                                  <div
                                    {...provided.dragHandleProps}
                                    className={cn(
                                      "flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground",
                                      editingRowId === null
                                        ? "cursor-grab active:cursor-grabbing"
                                        : "cursor-not-allowed opacity-50",
                                    )}
                                  >
                                    <GripVertical className="h-4 w-4 shrink-0" />
                                    <span className="font-semibold">
                                      {sub.urutan || index + 1}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium text-xs text-muted-foreground">
                                  {sub.kategori ? (
                                    <Badge
                                      variant="outline"
                                      className="font-normal bg-muted/30"
                                    >
                                      {sub.kategori}
                                    </Badge>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell className="font-medium group-hover:text-primary transition-colors">
                                  {sub.nama_subaspek}
                                </TableCell>
                                <TableCell className="text-center font-mono text-rose-600 dark:text-rose-400 bg-rose-50/20 dark:bg-rose-900/5">
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {String(sub.nilai_kurang_sekali || "")
                                      .split(",")
                                      .map((v, i) => (
                                        <span
                                          key={i}
                                          className="bg-background/80 px-1.5 py-0.5 rounded border shadow-sm text-md font-bold"
                                        >
                                          {v.trim()}
                                        </span>
                                      ))}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center font-mono text-red-600 dark:text-red-400 bg-red-50/20 dark:bg-red-900/5">
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {String(sub.nilai_kurang || "")
                                      .split(",")
                                      .map((v, i) => (
                                        <span
                                          key={i}
                                          className="bg-background/80 px-1.5 py-0.5 rounded border shadow-sm text-md font-bold"
                                        >
                                          {v.trim()}
                                        </span>
                                      ))}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center font-mono text-orange-600 dark:text-orange-400 bg-orange-50/20 dark:bg-orange-900/5">
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {String(sub.nilai_cukup || "")
                                      .split(",")
                                      .map((v, i) => (
                                        <span
                                          key={i}
                                          className="bg-background/80 px-1.5 py-0.5 rounded border shadow-sm text-md font-bold"
                                        >
                                          {v.trim()}
                                        </span>
                                      ))}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center font-mono text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-900/5">
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {String(sub.nilai_baik || "")
                                      .split(",")
                                      .map((v, i) => (
                                        <span
                                          key={i}
                                          className="bg-background/80 px-1.5 py-0.5 rounded border shadow-sm text-md font-bold"
                                        >
                                          {v.trim()}
                                        </span>
                                      ))}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-900/5">
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {String(sub.nilai_sangat_baik || "")
                                      .split(",")
                                      .map((v, i) => (
                                        <span
                                          key={i}
                                          className="bg-background/80 px-1.5 py-0.5 rounded border shadow-sm text-md font-bold"
                                        >
                                          {v.trim()}
                                        </span>
                                      ))}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyClick(sub)}
                                    disabled={editingRowId !== null}
                                    title="Duplikat"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditClick(sub)}
                                    disabled={editingRowId !== null}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={() => openDeleteAlert(sub)}
                                    disabled={editingRowId !== null}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </tr>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      {/* Baris Baru (Add) */}
                      {editingRowId === "new" && (
                        <TableRow key="new" className="bg-muted/30">
                          <TableCell className="text-center font-medium text-muted-foreground">
                            {subAspeks.length + 1}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editFormData.kategori || "none"}
                              onValueChange={(val) =>
                                handleInputChange("kategori", val === "none" ? "" : val)
                              }
                            >
                              <SelectTrigger className="h-8 min-w-[140px] text-xs bg-background">
                                <SelectValue placeholder="Pilih..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                <SelectItem value="none">
                                  <span className="text-muted-foreground italic">-- Tanpa Kategori --</span>
                                </SelectItem>
                                {Array.from(
                                  new Set([
                                    ...(masterCategories || KATEGORI_GERAKAN_OPTIONS),
                                    ...(subAspeks?.map((s) => s.kategori).filter(Boolean) || []),
                                  ]),
                                )
                                  .filter(Boolean)
                                  .map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editFormData.nama_subaspek}
                              onChange={(e) =>
                                handleInputChange(
                                  "nama_subaspek",
                                  e.target.value,
                                )
                              }
                              className="h-8 min-w-[150px]"
                              placeholder="Nama..."
                              autoFocus
                            />
                          </TableCell>
                          <TableCell>
                            <MultiScoreInput
                              value={editFormData.nilai_kurang_sekali}
                              onChange={(val) =>
                                handleInputChange("nilai_kurang_sekali", val)
                              }
                              size="sm"
                            />
                          </TableCell>
                          <TableCell>
                            <MultiScoreInput
                              value={editFormData.nilai_kurang}
                              onChange={(val) =>
                                handleInputChange("nilai_kurang", val)
                              }
                              size="sm"
                            />
                          </TableCell>
                          <TableCell>
                            <MultiScoreInput
                              value={editFormData.nilai_cukup}
                              onChange={(val) =>
                                handleInputChange("nilai_cukup", val)
                              }
                              size="sm"
                            />
                          </TableCell>
                          <TableCell>
                            <MultiScoreInput
                              value={editFormData.nilai_baik}
                              onChange={(val) =>
                                handleInputChange("nilai_baik", val)
                              }
                              size="sm"
                            />
                          </TableCell>
                          <TableCell>
                            <MultiScoreInput
                              value={editFormData.nilai_sangat_baik}
                              onChange={(val) =>
                                handleInputChange("nilai_sangat_baik", val)
                              }
                              size="sm"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={saveInlineEdit}
                                className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditingRowId(null)}
                                className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {subAspeks.length === 0 && editingRowId !== "new" && (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            Belum ada sub-aspek.
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </tbody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
      </DialogFooter>

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

export default function AspekManagementCard({ eventId, onUpdate }) {
  const [aspeks, setAspeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAspek, setSelectedAspek] = useState(null);
  const [isAspekDialogOpen, setIsAspekDialogOpen] = useState(false);
  const [isSubAspekManagerOpen, setIsSubAspekManagerOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [masterCategories, setMasterCategories] = useState(
    KATEGORI_GERAKAN_OPTIONS,
  );
  const [isMasterKategoriDialogOpen, setIsMasterKategoriDialogOpen] =
    useState(false);

  const fetchEventData = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      const evt = response.data?.event || response.data;
      if (evt?.kategori_options) {
        try {
          const parsed = JSON.parse(evt.kategori_options);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMasterCategories(parsed);
          }
        } catch (e) {
          console.error("Gagal parse kategori_options JSON:", e);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data master kategori event:", error);
    }
  };

  const fetchAspeks = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/aspek?event_id=${eventId}`);
      const sorted = response.data.sort(
        (a, b) => (a.urutan || 0) - (b.urutan || 0),
      );
      setAspeks(sorted);
    } catch (error) {
      toast.error("Gagal memuat data aspek.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchAspeks();
      fetchEventData();
    }
  }, [eventId]);

  const handleSaveMasterCategories = async (newCats) => {
    try {
      await api.put(`/events/${eventId}`, {
        kategori_options: JSON.stringify(newCats),
      });
      setMasterCategories(newCats);
      toast.success("Master Kategori Gerakan berhasil disimpan.");
    } catch (error) {
      toast.error("Gagal menyimpan Master Kategori Gerakan.");
      throw error;
    }
  };

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
      if (onUpdate) onUpdate();
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
      if (onUpdate) onUpdate();
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

  const handleExportFormat = async () => {
    try {
      const response = await api.get(`/aspek/export/${eventId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `format_penilaian_${eventId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Gagal mengekspor data format penilaian.");
    }
  };

  const handleImportFormat = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (
      !window.confirm(
        "Apakah Anda yakin ingin meng-import format penilaian dari file Excel ini?\n\nData baru akan ditambahkan ke event ini.",
      )
    ) {
      e.target.value = null;
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (ev) => {
      const base64Data = ev.target.result.split(",")[1];
      try {
        await api.post(`/aspek/import/${eventId}`, { excel_data: base64Data });
        toast.success("Format penilaian berhasil diimport!");
        fetchAspeks(); // Refresh state aspek di card ini
        if (onUpdate) onUpdate(); // Refresh state event di parent (page.jsx)
      } catch (error) {
        toast.error(error.response?.data?.message || "Gagal mengimport data.");
      }
      e.target.value = null; // Reset input file
    };
  };

  return (
    <>
      <Card className="flex flex-col h-full shadow-sm border-border/50 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/20 border-b pb-4 pt-5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            Aspek Penilaian
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMasterKategoriDialogOpen(true)}
              className="shadow-sm border-dashed"
            >
              <ListTree className="mr-2 h-4 w-4 text-primary" /> Master Kategori
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportFormat}
              className="shadow-sm"
            >
              <Upload className="mr-2 h-4 w-4" /> Export Excel
            </Button>
            <div
              className={cn(
                "relative",
                aspeks.length > 0 && "opacity-50 cursor-not-allowed",
              )}
              title={
                aspeks.length > 0
                  ? "Hapus semua aspek terlebih dahulu untuk mengimport"
                  : "Import Format Excel"
              }
            >
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportFormat}
                disabled={aspeks.length > 0}
                className={cn(
                  "absolute inset-0 w-full h-full opacity-0",
                  aspeks.length > 0 ? "cursor-not-allowed" : "cursor-pointer",
                )}
              />
              <Button
                variant="outline"
                size="sm"
                className="shadow-sm pointer-events-none"
                disabled={aspeks.length > 0}
              >
                <Download className="mr-2 h-4 w-4" /> Import Excel
              </Button>
            </div>
            <Button
              size="sm"
              onClick={() => openAspekDialog()}
              className="shadow-sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Aspek
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground">
              Memuat data aspek...
            </div>
          ) : aspeks.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {aspeks.map((aspek) => (
                <AccordionItem
                  key={aspek.aspek_id}
                  value={aspek.aspek_id}
                  className="border-b last:border-b-0"
                >
                  <div className="flex items-center px-4">
                    <AccordionTrigger className="py-4 hover:no-underline flex-1 pr-4">
                      <div className="flex items-center gap-3 text-left w-full">
                        <span className="font-semibold text-foreground">
                          {aspek.nama_aspek}
                        </span>
                        <Badge
                          variant="outline"
                          className="font-normal text-xs bg-muted/50"
                        >
                          Urutan: {aspek.urutan || "-"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="font-normal text-xs ml-auto"
                        >
                          {aspek.SubAspeks?.length || 0} Sub-Aspek
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <div
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                            <span>Edit Aspek</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => openAlert(aspek)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Hapus Aspek</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-muted/10 border-t border-border/50">
                    {aspek.SubAspeks && aspek.SubAspeks.length > 0 ? (
                      <div className="rounded-md border bg-background overflow-hidden mt-2">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="w-12 text-center h-8 text-xs font-semibold">
                                No
                              </TableHead>
                              <TableHead className="h-8 text-xs font-semibold">
                                Sub-Aspek
                              </TableHead>
                              <TableHead className="h-8 text-xs font-semibold">
                                Kategori
                              </TableHead>
                              <TableHead className="text-center h-8 text-xs font-semibold">
                                K. Sekali
                              </TableHead>
                              <TableHead className="text-center h-8 text-xs font-semibold">
                                Kurang
                              </TableHead>
                              <TableHead className="text-center h-8 text-xs font-semibold">
                                Cukup
                              </TableHead>
                              <TableHead className="text-center h-8 text-xs font-semibold">
                                Baik
                              </TableHead>
                              <TableHead className="text-center h-8 text-xs font-semibold">
                                S. Baik
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...aspek.SubAspeks]
                              .sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
                              .map((sub, idx) => (
                                <TableRow key={sub.subaspek_id}>
                                  <TableCell className="text-center py-2 text-xs text-muted-foreground">
                                    {sub.urutan || idx + 1}
                                  </TableCell>
                                  <TableCell className="py-2 text-sm font-medium">
                                    {sub.nama_subaspek}
                                  </TableCell>
                                  <TableCell className="py-2 text-xs font-medium text-muted-foreground">
                                    {sub.kategori &&
                                    sub.kategori.trim() !== "" ? (
                                      <Badge
                                        variant="outline"
                                        className="font-normal bg-muted/30"
                                      >
                                        {sub.kategori}
                                      </Badge>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center py-2 text-xs font-mono text-rose-600">
                                    {sub.nilai_kurang_sekali || "-"}
                                  </TableCell>
                                  <TableCell className="text-center py-2 text-xs font-mono text-red-600">
                                    {sub.nilai_kurang || "-"}
                                  </TableCell>
                                  <TableCell className="text-center py-2 text-xs font-mono text-orange-600">
                                    {sub.nilai_cukup || "-"}
                                  </TableCell>
                                  <TableCell className="text-center py-2 text-xs font-mono text-blue-600">
                                    {sub.nilai_baik || "-"}
                                  </TableCell>
                                  <TableCell className="text-center py-2 text-xs font-mono text-emerald-600 font-semibold">
                                    {sub.nilai_sangat_baik || "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-6 mt-2 text-sm text-muted-foreground border rounded-md border-dashed bg-background">
                        Belum ada sub-aspek untuk aspek ini.{" "}
                        <button
                          type="button"
                          onClick={() => openSubAspekManager(aspek)}
                          className="text-primary hover:underline font-medium"
                        >
                          Tambahkan Sub-Aspek
                        </button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="h-24 flex items-center justify-center text-muted-foreground">
              Belum ada aspek penilaian.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Form Aspek */}
      <Dialog open={isAspekDialogOpen} onOpenChange={setIsAspekDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Manager Sub-Aspek */}
      <Dialog
        open={isSubAspekManagerOpen}
        onOpenChange={setIsSubAspekManagerOpen}
      >
        <DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-[1400px] w-full max-h-[92vh] overflow-y-auto">
          {selectedAspek && (
            <SubAspekManager
              aspek={selectedAspek}
              onBack={() => setIsSubAspekManagerOpen(false)}
              masterCategories={masterCategories}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Master Kategori Gerakan */}
      <MasterKategoriModal
        open={isMasterKategoriDialogOpen}
        onOpenChange={setIsMasterKategoriDialogOpen}
        currentMasterCategories={masterCategories}
        onSaveMaster={handleSaveMasterCategories}
      />

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
}

const MasterKategoriModal = ({
  open,
  onOpenChange,
  currentMasterCategories,
  onSaveMaster,
}) => {
  const [categories, setCategories] = useState([]);
  const [newCatInput, setNewCatInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCategories(
        currentMasterCategories && currentMasterCategories.length > 0
          ? [...currentMasterCategories]
          : [...KATEGORI_GERAKAN_OPTIONS],
      );
      setNewCatInput("");
    }
  }, [open, currentMasterCategories]);

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      toast.error("Kategori ini sudah ada di dalam list master.");
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    setNewCatInput("");
  };

  const handleDelete = (index) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetDefault = () => {
    setCategories([...KATEGORI_GERAKAN_OPTIONS]);
    toast.info("Master kategori direset ke pilihan standar.");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveMaster(categories);
      onOpenChange(false);
    } catch (err) {
      // Error dimuat di parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListTree className="w-5 h-5 text-primary" />
            Master Data Kategori Gerakan
          </DialogTitle>
          <DialogDescription>
            Atur opsi daftar pilihan kategori gerakan yang tersedia untuk event ini. Data disimpan dalam format JSON master data event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="Ketik nama kategori baru (misal: Kategori Danton)..."
              className="h-10 text-sm"
            />
            <Button type="submit" size="sm" className="h-10 shrink-0">
              <PlusCircle className="mr-1.5 h-4 w-4" /> Tambah
            </Button>
          </form>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold px-1">
              <span>Daftar Master Kategori ({categories.length})</span>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-xs text-primary hover:underline"
              >
                Reset ke Standar
              </button>
            </div>
            <div className="max-h-[260px] overflow-y-auto border rounded-lg p-3 space-y-2 bg-muted/20">
              {categories.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Belum ada kategori dalam master data.
                </p>
              ) : (
                categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-background border px-3 py-2 rounded-md text-sm shadow-sm"
                  >
                    <span className="font-medium">{cat}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(idx)}
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan Master Kategori"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
