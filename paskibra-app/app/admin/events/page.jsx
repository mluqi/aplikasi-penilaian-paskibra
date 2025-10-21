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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Edit,
  Users,
  ShieldCheck,
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
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { cn } from "@/lib/utils";

const EventForm = ({ event, coordinators, user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    event_name: event?.event_name || "",
    event_tanggal: event?.event_tanggal ? new Date(event.event_tanggal) : null,
    event_tempat: event?.event_tempat || "",
    event_waktu: event?.event_waktu || "08:00",
    event_biaya_pendaftaran: event?.event_biaya_pendaftaran || 0,
    event_deskripsi: event?.event_deskripsi || "",
    event_status: event?.event_status || "draft",
    event_kategori: event?.event_kategori || "",
    event_tingkat: event?.event_tingkat || "",
    event_provinsi: event?.event_provinsi || "",
    event_kota: event?.event_kota || "",
    koordinator_id: event?.koordinator_id || "",
  });
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk data wilayah
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingWilayah, setLoadingWilayah] = useState({
    provinces: false,
    cities: false,
  });

  useEffect(() => {
    if (event?.event_poster) {
      setPosterPreview(
        `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
      );
    }
  }, [event]);

  // Fetch data provinsi saat komponen dimuat
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingWilayah((prev) => ({ ...prev, provinces: true }));
      try {
        const res = await api.get("/wilayah/provinsi");
        setProvinces(res.data.data || []);
      } catch (error) {
        toast.error("Gagal memuat data provinsi.");
      } finally {
        setLoadingWilayah((prev) => ({ ...prev, provinces: false }));
      }
    };
    fetchProvinces();
  }, []);

  // Fetch data kota saat provinsi berubah
  useEffect(() => {
    const fetchCities = async () => {
      if (formData.event_provinsi) {
        const selectedProvince = provinces.find(
          (p) => p.name === formData.event_provinsi
        );
        if (selectedProvince) {
          setLoadingWilayah((prev) => ({ ...prev, cities: true }));
          try {
            const res = await api.get(
              `/wilayah/kota?province_id=${selectedProvince.id}`
            );
            setCities(res.data.data || []);
          } catch (error) {
            toast.error("Gagal memuat data kota.");
          } finally {
            setLoadingWilayah((prev) => ({ ...prev, cities: false }));
          }
        }
      }
    };
    fetchCities();
  }, [formData.event_provinsi, provinces]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPoster(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData, poster);
    setIsSubmitting(false);
  };

  return (
    <form id="event-form" onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Kolom Kiri */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event_name">Nama Event</Label>
            <Input
              id="event_name"
              name="event_name"
              value={formData.event_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_tanggal">Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.event_tanggal && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.event_tanggal ? (
                    format(formData.event_tanggal, "PPP", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.event_tanggal}
                  onSelect={(date) =>
                    setFormData((prev) => ({ ...prev, event_tanggal: date }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_waktu">Waktu</Label>
            <Input
              id="event_waktu"
              name="event_waktu"
              type="time"
              value={formData.event_waktu}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_tempat">Tempat</Label>
            <Input
              id="event_tempat"
              name="event_tempat"
              value={formData.event_tempat}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_deskripsi">Deskripsi</Label>
            <Textarea
              id="event_deskripsi"
              name="event_deskripsi"
              value={formData.event_deskripsi}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event_kategori">Kategori</Label>
            <Select
              value={formData.event_kategori}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, event_kategori: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smp">SMP/Sederajat</SelectItem>
                <SelectItem value="sma_smk">SMA/Sederajat</SelectItem>
                <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                <SelectItem value="umum">Umum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_tingkat">Tingkat</Label>
            <Select
              value={formData.event_tingkat}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, event_tingkat: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kota_kabupaten">Kota/Kabupaten</SelectItem>
                <SelectItem value="provinsi">Provinsi</SelectItem>
                <SelectItem value="nasional">Nasional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_provinsi">Provinsi</Label>
            <Select
              value={formData.event_provinsi}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  event_provinsi: value,
                  event_kota: "",
                }));
                setCities([]);
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingWilayah.provinces ? "Memuat..." : "Pilih provinsi"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((prov) => (
                  <SelectItem key={prov.id} value={prov.name}>
                    {prov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_kota">Kota/Kab.</Label>
            <Select
              value={formData.event_kota}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, event_kota: value }))
              }
              disabled={!formData.event_provinsi || loadingWilayah.cities}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingWilayah.cities ? "Memuat..." : "Pilih kota/kab."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_biaya_pendaftaran">Biaya Pendaftaran</Label>
            <Input
              id="event_biaya_pendaftaran"
              name="event_biaya_pendaftaran"
              type="number"
              value={formData.event_biaya_pendaftaran}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Bagian Bawah Form */}
      <div className="space-y-4 pt-6 border-t">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="event_status">Status</Label>
            <Select
              value={formData.event_status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, event_status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {user?.role === "admin" && (
            <div className="space-y-2">
              <Label htmlFor="koordinator_id">Koordinator</Label>
              <Select
                value={formData.koordinator_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, koordinator_id: value }))
                }
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
        <div className="space-y-2">
          <Label htmlFor="event_poster">Poster</Label>
          <div className="flex items-center gap-4">
            {posterPreview && (
              <Image
                src={posterPreview}
                alt="Pratinjau Poster"
                width={60}
                height={84}
                className="rounded-md border object-cover p-1"
              />
            )}
            <Input
              id="event_poster"
              name="event_poster"
              type="file"
              onChange={handlePosterChange}
              className="flex-1"
              accept="image/*"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default function EventManagementPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const eventsRes = await api.get("/events");
      setEvents(eventsRes.data.events);

      if (user?.role === "admin") {
        const usersRes = await api.get("/users");
        setCoordinators(
          usersRes.data.filter((u) => u.user_role === "koordinator_event")
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memuat data event.");
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleSaveEvent = async (eventData, poster) => {
    const formData = new FormData();
    Object.keys(eventData).forEach((key) => {
      if (eventData[key] !== null) {
        formData.append(key, eventData[key]);
      }
    });

    if (poster) {
      formData.append("event_poster", poster);
    }

    // Jika user adalah koordinator dan sedang membuat event baru,
    // otomatis set ID koordinatornya.
    if (user?.role === "koordinator_event" && !selectedEvent) {
      formData.set("koordinator_id", user.id);
    }

    try {
      if (selectedEvent) {
        const response = await api.put(
          `/events/${selectedEvent.event_id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success(response.data.message || "Event berhasil diperbarui.");
      } else {
        const response = await api.post("/events", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(response.data.message || "Event berhasil dibuat.");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan.");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      await api.delete(`/events/${selectedEvent.event_id}`);
      toast.success("Event berhasil dihapus.");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus event.");
    } finally {
      setIsAlertOpen(false);
    }
  };

  const openDialog = (event = null) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const openAlert = (event) => {
    setSelectedEvent(event);
    setIsAlertOpen(true);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "secondary";
      case "archived":
        return "destructive";
      default:
        return "default";
    }
  };

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
                <BreadcrumbPage>Manajemen Event</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Daftar Event</h1>
          {user?.role !== "juri" && (
            <Button onClick={() => openDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Event
            </Button>
          )}
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Event</TableHead>
                <TableHead>Tanggal & Tempat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead>Koordinator</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Memuat data event...
                  </TableCell>
                </TableRow>
              ) : events.length > 0 ? (
                events.map((event) => (
                  <TableRow key={event.event_id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            event.event_poster
                              ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                              : "/default-poster.png" // Sediakan gambar placeholder
                          }
                          alt={`Poster ${event.event_name}`}
                          width={40}
                          height={56} // Rasio poster
                          className="rounded-sm border object-cover"
                          onError={(e) =>
                            (e.currentTarget.src = "/default-poster.png")
                          }
                        />
                        <div>
                          <Link
                            href={`/admin/events/${event.event_id}`}
                            className="hover:underline"
                          >
                            {event.event_name}
                          </Link>
                          <p className="text-xs text-muted-foreground font-mono">
                            {event.event_id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(event.event_tanggal), "d MMMM yyyy", {
                          locale: id,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.event_tempat}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(event.event_status)}>
                        {event.event_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.Event_teams?.length || 0} Tim</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        <span>{event.Event_juris?.length || 0} Juri</span>
                      </div>
                    </TableCell>
                    <TableCell>{event.User?.user_name || "-"}</TableCell>
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
                            <Link href={`/admin/events/${event.event_id}`}>
                              <Users className="mr-2 h-4 w-4" />
                              <span>Kelola Peserta</span>
                            </Link>
                          </DropdownMenuItem>
                          {user?.role !== "juri" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => openDialog(event)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => openAlert(event)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Tidak ada data event.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Dialog untuk Tambah/Edit Event akan ditempatkan di sini */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Edit Event" : "Tambah Event Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <EventForm
              event={selectedEvent}
              coordinators={coordinators}
              user={user}
              onSave={handleSaveEvent}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" form="event-form">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog untuk Konfirmasi Hapus */}
      <AlertDialog
        open={isAlertOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
          setIsAlertOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus event{" "}
              <strong>{selectedEvent?.event_name}</strong> beserta semua data
              peserta dan jurinya secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteEvent}
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
