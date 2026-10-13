"use client";

import React, { useState, useEffect } from "react";
import api from "@/service/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Key,
  Copy,
  Trash2,
  Edit,
  PlusCircle,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const ManagementKeyPage = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [formData, setFormData] = useState({ name: "", key: "", status: true });
  const [visibleKeys, setVisibleKeys] = useState({});

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const response = await api.get("/keys");
      setApiKeys(response.data);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast.error("Gagal memuat API Key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.key.trim()) {
      toast.error("Nama dan API Key wajib diisi.");
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/keys/${selectedKey.id}`, formData);
        toast.success("API Key berhasil diperbarui.");
      } else {
        await api.post("/keys", formData);
        toast.success("API Key baru berhasil disimpan.");
      }
      setIsDialogOpen(false);
      fetchApiKeys();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan API Key.");
    }
  };

  const handleDeleteKey = async () => {
    if (!selectedKey) return;
    try {
      await api.delete(`/keys/${selectedKey.id}`);
      toast.success("API Key berhasil dihapus.");
      setIsDeleteAlertOpen(false);
      setSelectedKey(null);
      fetchApiKeys();
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Gagal menghapus API Key.");
    }
  };

  const openDialog = (keyItem = null) => {
    if (keyItem) {
      setIsEditing(true);
      setSelectedKey(keyItem);
      setFormData({
        name: keyItem.name,
        key: keyItem.key,
        status: keyItem.status,
      });
    } else {
      setIsEditing(false);
      setSelectedKey(null);
      setFormData({ name: "", key: "", status: true });
    }
    setIsDialogOpen(true);
  };

  // Fungsi untuk menyalin API Key ke clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("API Key disalin ke clipboard!");
  };

  // Fungsi untuk toggle visibilitas karakter kunci
  const toggleVisibility = (id) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const confirmDelete = (keyItem) => {
    setSelectedKey(keyItem);
    setIsDeleteAlertOpen(true);
  };

  return (
    <ProtectedRoute requiredAccess="manage_role_access">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Manajemen API Key</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Manajemen API Key
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Kelola API Key untuk integrasi layanan eksternal atau akses
              third-party.
            </p>
          </div>
          <Button onClick={() => openDialog()} className="shadow-sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah API Key
          </Button>
        </div>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="bg-muted/20 border-b pb-4 pt-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              Daftar Kunci Autentikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[200px]">Nama Kunci</TableHead>
                  <TableHead className="w-[300px]">API Key</TableHead>
                  <TableHead>Dibuat Pada</TableHead>
                  <TableHead>Diperbarui Pada</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : apiKeys.length > 0 ? (
                  apiKeys.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-muted rounded-md text-xs font-mono text-muted-foreground flex-1 truncate max-w-[200px]">
                            {visibleKeys[item.id]
                              ? item.key
                              : "••••••••••••••••••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleVisibility(item.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            {visibleKeys[item.id] ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleCopy(item.key)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.createdAt
                          ? format(
                              new Date(item.createdAt),
                              "dd MMM yyyy, HH:mm",
                              {
                                locale: localeId,
                              },
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.updatedAt
                          ? format(
                              new Date(item.updatedAt),
                              "dd MMM yyyy, HH:mm",
                              {
                                locale: localeId,
                              },
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className={
                            item.status
                              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200/50 shadow-none"
                              : "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200/50 shadow-none"
                          }
                        >
                          {item.status ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:bg-blue-500/10 hover:text-blue-700 mr-2"
                          onClick={() => openDialog(item)}
                          title="Edit Key"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => confirmDelete(item)}
                          title="Revoke/Hapus Key"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Belum ada API Key yang dibuat.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Dialog Simpan API Key */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit API Key" : "Simpan API Key"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Ubah detail API Key."
                  : "Berikan nama dan masukkan API Key."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">
                  Nama <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="keyName"
                  placeholder="Contoh: Production App"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyValue">
                  API Key <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="keyValue"
                  placeholder="Masukkan API Key"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                />
              </div>
              {isEditing && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="keyStatus"
                    checked={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="keyStatus">Status Aktif</Label>
                </div>
              )}
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

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mencabut akses untuk kunci{" "}
              <strong>{selectedKey?.name}</strong>? Aplikasi atau integrasi yang
              menggunakan kunci ini akan segera kehilangan akses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteKey}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Cabut Akses
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
};

export default ManagementKeyPage;
