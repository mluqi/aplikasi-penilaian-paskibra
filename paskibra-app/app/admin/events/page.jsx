"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  DialogFooter,
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
  X,
  Info,
  MapPin,
  PhoneCall,
  FileText,
  ImageIcon,
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
import { useRouter } from "next/navigation";
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
import usePalindoWilayah from "@/hooks/usePalindoWilayah";

const EventForm = ({
  event,
  coordinators,
  user,
  onSave,
  onCancel,
  setIsDirty,
}) => {
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
    event_batas_pendaftaran: event?.event_batas_pendaftaran
      ? new Date(event.event_batas_pendaftaran)
      : null,
    event_penyelenggara: event?.event_penyelenggara || "",
    event_contact_person_name: event?.event_contact_person_name || "",
    event_contact_person_number: event?.event_contact_person_number || "",
    event_kuota: event?.event_kuota || "",
    donasi_mulai: event?.donasi_mulai ? new Date(event.donasi_mulai) : null,
    donasi_selesai: event?.donasi_selesai
      ? new Date(event.donasi_selesai)
      : null,
    is_result_show: event?.is_result_show || false,
  });
  const [poster, setPoster] = useState(null);
  const [kejuaraanTemplate, setKejuaraanTemplate] = useState(() => {
    if (event?.kejuaraan_template) {
      try {
        return typeof event.kejuaraan_template === "string"
          ? JSON.parse(event.kejuaraan_template)
          : event.kejuaraan_template;
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  // Convert legacy format to objects when initializing state
  useEffect(() => {
    setKejuaraanTemplate((prev) =>
      prev.map((item) =>
        typeof item === "string" ? { name: item, numbered: true } : item,
      ),
    );
  }, []);
  const [newTemplateInput, setNewTemplateInput] = useState("");
  const [newTemplateNumbered, setNewTemplateNumbered] = useState(true);
  const [posterPreview, setPosterPreview] = useState(null);
  const [juknis, setJuknis] = useState(null);
  const [juknisName, setJuknisName] = useState(event?.event_juknis || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("published");

  const posterInputRef = useRef(null);
  const juknisInputRef = useRef(null);
  const formRef = useRef(null);

  const [step, setStep] = useState(1);
  const isEditMode = !!event;

  // State untuk dropdown Combobox
  const [openProvinsi, setOpenProvinsi] = useState(false);
  const [searchProvinsi, setSearchProvinsi] = useState("");
  const [openKota, setOpenKota] = useState(false);
  const [searchKota, setSearchKota] = useState("");
  const [openKoordinator, setOpenKoordinator] = useState(false);
  const [searchKoordinator, setSearchKoordinator] = useState("");

  const filteredCoordinators = coordinators.filter((c) =>
    c.user_name.toLowerCase().includes(searchKoordinator.toLowerCase()),
  );

  const steps = [
    { id: 1, title: "Informasi Dasar" },
    { id: 2, title: "Lokasi & Wilayah" },
    { id: 3, title: "Jadwal & Klasifikasi" },
    { id: 4, title: "Kontak & Publikasi" },
    { id: 5, title: "Berkas Pendukung" },
  ];

  const handleNextStep = () => {
    // Validasi per langkah untuk komponen kustom yang mengabaikan validasi HTML5
    if (step === 1) {
      if (!formData.event_name.trim())
        return toast.error("Nama event wajib diisi.");
      if (
        formData.event_biaya_pendaftaran === "" ||
        formData.event_biaya_pendaftaran === null
      )
        return toast.error(
          "Biaya pendaftaran wajib diisi (isi 0 jika gratis).",
        );
    } else if (step === 2) {
      if (!formData.event_provinsi)
        return toast.error("Provinsi wajib dipilih.");
      if (!formData.event_kota)
        return toast.error("Kota/Kabupaten wajib dipilih.");
      if (!formData.event_tempat.trim())
        return toast.error("Detail tempat wajib diisi.");
    } else if (step === 3) {
      if (!formData.event_tanggal)
        return toast.error("Tanggal pelaksanaan wajib dipilih.");
      if (!formData.event_waktu)
        return toast.error("Waktu dimulai wajib diisi.");
      if (!formData.event_kategori)
        return toast.error("Kategori peserta wajib dipilih.");
      if (!formData.event_tingkat)
        return toast.error("Tingkat skala wajib dipilih.");
    } else if (step === 4) {
      if (
        (user?.role === "admin" || user?.role === "superadmin") &&
        !formData.koordinator_id
      ) {
        return toast.error("Koordinator event wajib dipilih.");
      }
    }

    // Jalankan validasi bawaan HTML5 sebagai pengaman ganda
    if (formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }

    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleAddTemplate = () => {
    if (newTemplateInput.trim()) {
      setKejuaraanTemplate((prev) => [
        ...prev,
        {
          name: newTemplateInput.trim().toUpperCase(),
          numbered: newTemplateNumbered,
        },
      ]);
      setNewTemplateInput("");
      setNewTemplateNumbered(true);
      setIsDirty(true);
    }
  };

  const handleRemoveTemplate = (index) => {
    setKejuaraanTemplate((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // State untuk data wilayah
  const {
    provinces,
    cities,
    loadingProvinces,
    loadingCities,
    fetchProvinces,
    fetchCities,
    setCities,
  } = usePalindoWilayah();

  useEffect(() => {
    if (event?.event_poster) {
      setPosterPreview(
        `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`,
      );
    } else {
      setPosterPreview(null);
    }

    if (event?.event_juknis) {
      setJuknisName(event.event_juknis);
    } else {
      setJuknisName(null);
    }
  }, [event]);

  // Fetch data provinsi saat komponen dimuat
  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const filteredProvinces = provinces.filter((p) =>
    p.name.toLowerCase().includes(searchProvinsi.toLowerCase()),
  );
  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(searchKota.toLowerCase()),
  );

  // Fetch data kota saat provinsi berubah
  useEffect(() => {
    if (formData.event_provinsi) {
      const selectedProvince = provinces.find(
        (p) => p.name === formData.event_provinsi,
      );
      if (selectedProvince) {
        fetchCities(selectedProvince.id);
      }
    }
  }, [formData.event_provinsi, provinces, fetchCities]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 1 * 1024 * 1024; // 1MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        "Tipe file tidak valid. Harap unggah gambar (JPG, PNG, WEBP).",
      );
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(`Ukuran file terlalu besar. Maksimal 1MB.`);
      e.target.value = "";
      return;
    }

    setPoster(file);
    setPosterPreview(URL.createObjectURL(file));
    setIsDirty(true);
  };

  const handleJuknisChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setJuknis(file);
      setJuknisName(file.name);
      setIsDirty(true);
    }
  };

  const handleRemovePoster = () => {
    setPoster(null);
    if (event?.event_poster) {
      setPosterPreview(
        `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`,
      );
    } else {
      setPosterPreview(null);
    }
    if (posterInputRef.current) posterInputRef.current.value = "";
    setIsDirty(true);
  };

  const handleRemoveJuknis = () => {
    setJuknis(null);
    if (event?.event_juknis) {
      setJuknisName(event.event_juknis);
    } else {
      setJuknisName(null);
    }
    if (juknisInputRef.current) juknisInputRef.current.value = "";
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi Menyeluruh (Terutama untuk Mode Edit di mana semua form tampil sekaligus)
    if (!formData.event_name.trim())
      return toast.error("Nama event wajib diisi.");
    if (
      formData.event_biaya_pendaftaran === "" ||
      formData.event_biaya_pendaftaran === null
    )
      return toast.error("Biaya pendaftaran wajib diisi.");
    if (!formData.event_provinsi) return toast.error("Provinsi wajib dipilih.");
    if (!formData.event_kota)
      return toast.error("Kota/Kabupaten wajib dipilih.");
    if (!formData.event_tempat.trim())
      return toast.error("Detail tempat wajib diisi.");
    if (!formData.event_tanggal)
      return toast.error("Tanggal pelaksanaan wajib dipilih.");
    if (!formData.event_waktu) return toast.error("Waktu dimulai wajib diisi.");
    if (!formData.event_kategori)
      return toast.error("Kategori peserta wajib dipilih.");
    if (!formData.event_tingkat)
      return toast.error("Tingkat skala wajib dipilih.");
    if (
      (user?.role === "admin" || user?.role === "superadmin") &&
      !formData.koordinator_id
    )
      return toast.error("Koordinator event wajib dipilih.");

    // Validasi: Batas pendaftaran tidak boleh melebihi tanggal pelaksanaan
    if (formData.event_batas_pendaftaran && formData.event_tanggal) {
      const batas = new Date(formData.event_batas_pendaftaran);
      const pelaksanaan = new Date(formData.event_tanggal);

      // Gabungkan jam pelaksanaan agar perbandingannya akurat
      if (formData.event_waktu) {
        const [hours, minutes] = formData.event_waktu.split(":");
        pelaksanaan.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        pelaksanaan.setHours(23, 59, 59, 999);
      }

      if (batas > pelaksanaan) {
        toast.error(
          "Batas waktu pendaftaran tidak boleh melebihi jadwal pelaksanaan event.",
        );
        return;
      }
    }

    if (formData.donasi_mulai && formData.donasi_selesai) {
      if (
        new Date(formData.donasi_selesai) <= new Date(formData.donasi_mulai)
      ) {
        toast.error(
          "Waktu berakhir E-Voting harus lebih besar dari waktu mulai.",
        );
        return;
      }
    }

    setIsSubmitting(true);

    let finalStatus = submitStatus;
    // Jika mode edit, dan dropdown dipilih 'archived', biarkan archived jika tombol utama ditekan
    if (
      event &&
      formData.event_status === "archived" &&
      submitStatus === "published"
    ) {
      finalStatus = "archived";
    }

    const finalData = { ...formData, event_status: finalStatus };
    if (kejuaraanTemplate.length > 0) {
      finalData.kejuaraan_template = JSON.stringify(kejuaraanTemplate);
    } else {
      finalData.kejuaraan_template = "";
    }

    await onSave(finalData, poster, juknis);
    setIsSubmitting(false);
  };

  return (
    <form
      ref={formRef}
      id="event-form"
      onSubmit={handleSubmit}
      className="space-y-8 py-2"
    >
      {!isEditMode && (
        <div className="mb-8 px-2 md:px-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full -z-10"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / (5 - 1)) * 100}%` }}
            ></div>
            {steps.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-2 bg-background px-2"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500",
                    step > s.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : step === s.id
                        ? "bg-background border-primary text-primary"
                        : "bg-background border-muted text-muted-foreground",
                  )}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold hidden md:block transition-colors duration-500 text-center max-w-[80px]",
                    step >= s.id ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEKSI 1: INFORMASI DASAR ── */}
      {(isEditMode || step === 1) && (
        <div className="space-y-5 bg-muted/20 p-5 md:p-6 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 border-b pb-3">
            <Info className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">
              Informasi Dasar
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="event_name">
                Nama Event <span className="text-red-500">*</span>
              </Label>
              <Input
                id="event_name"
                name="event_name"
                value={formData.event_name}
                onChange={handleChange}
                placeholder="Contoh: Lomba Paskibraka Tingkat Provinsi 2024"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="event_deskripsi">Deskripsi Lengkap</Label>
              <Textarea
                id="event_deskripsi"
                name="event_deskripsi"
                value={formData.event_deskripsi}
                onChange={handleChange}
                placeholder="Tuliskan deskripsi lengkap tentang event ini..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_penyelenggara">
                Instansi Penyelenggara
              </Label>
              <Input
                id="event_penyelenggara"
                name="event_penyelenggara"
                value={formData.event_penyelenggara}
                onChange={handleChange}
                placeholder="Contoh: PPI Kota Bandung"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_biaya_pendaftaran">
                Biaya Pendaftaran (Rp) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="event_biaya_pendaftaran"
                name="event_biaya_pendaftaran"
                type="number"
                value={formData.event_biaya_pendaftaran}
                onChange={handleChange}
                placeholder="0 jika gratis"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* ── SEKSI 2: LOKASI & WILAYAH ── */}
      {(isEditMode || step === 2) && (
        <div className="space-y-5 bg-muted/20 p-5 md:p-6 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 border-b pb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">
              Lokasi & Wilayah
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="event_provinsi">
                Provinsi <span className="text-red-500">*</span>
              </Label>
              <Popover open={openProvinsi} onOpenChange={setOpenProvinsi}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProvinsi}
                    className={cn(
                      "w-full justify-between font-normal",
                      !formData.event_provinsi && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">
                      {formData.event_provinsi ||
                        (loadingProvinces ? "Memuat..." : "Pilih provinsi...")}
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
                        placeholder="Cari provinsi..."
                        value={searchProvinsi}
                        onChange={(e) => setSearchProvinsi(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                      {filteredProvinces.length > 0 ? (
                        filteredProvinces.map((prov) => (
                          <Button
                            key={prov.id}
                            variant="ghost"
                            className="w-full justify-start font-normal"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                event_provinsi: prov.name,
                                event_kota: "",
                              }));
                              setCities([]);
                              setIsDirty(true);
                              setOpenProvinsi(false);
                              setSearchProvinsi("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                formData.event_provinsi === prov.name
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {prov.name}
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
            <div className="space-y-2">
              <Label htmlFor="event_kota">
                Kota/Kabupaten <span className="text-red-500">*</span>
              </Label>
              <Popover open={openKota} onOpenChange={setOpenKota}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openKota}
                    disabled={!formData.event_provinsi || loadingCities}
                    className={cn(
                      "w-full justify-between font-normal",
                      !formData.event_kota && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">
                      {formData.event_kota ||
                        (loadingCities ? "Memuat..." : "Pilih kota/kab...")}
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
                        placeholder="Cari kota/kab..."
                        value={searchKota}
                        onChange={(e) => setSearchKota(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                          <Button
                            key={city.id}
                            variant="ghost"
                            className="w-full justify-start font-normal"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                event_kota: city.name,
                              }));
                              setIsDirty(true);
                              setOpenKota(false);
                              setSearchKota("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                formData.event_kota === city.name
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {city.name}
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="event_tempat">
                Detail Tempat (Gedung/Lapangan){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="event_tempat"
                name="event_tempat"
                value={formData.event_tempat}
                onChange={handleChange}
                placeholder="Contoh: GOR Basket Padjajaran"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* ── SEKSI 3: JADWAL & KLASIFIKASI ── */}
      {(isEditMode || step === 3) && (
        <div className="space-y-5 bg-muted/20 p-5 md:p-6 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 border-b pb-3">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">
              Jadwal & Klasifikasi
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="event_tanggal">
                Tanggal Pelaksanaan <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.event_tanggal && "text-muted-foreground",
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
                    onSelect={(date) => {
                      setFormData((prev) => ({ ...prev, event_tanggal: date }));
                      setIsDirty(true);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_waktu">
                Waktu Dimulai <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="event_batas_pendaftaran">
                Batas Waktu Pendaftaran (Opsional)
              </Label>
              <Input
                id="event_batas_pendaftaran"
                name="event_batas_pendaftaran"
                type="datetime-local"
                value={
                  formData.event_batas_pendaftaran
                    ? format(
                        formData.event_batas_pendaftaran,
                        "yyyy-MM-dd'T'HH:mm",
                      )
                    : ""
                }
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    event_batas_pendaftaran: e.target.value
                      ? new Date(e.target.value)
                      : null,
                  }));
                  setIsDirty(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_kuota">
                Kuota Tim (Kosongkan jika bebas)
              </Label>
              <Input
                id="event_kuota"
                name="event_kuota"
                type="number"
                value={formData.event_kuota}
                onChange={handleChange}
                placeholder="Contoh: 30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_kategori">
                Kategori Peserta <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.event_kategori}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, event_kategori: value }));
                  setIsDirty(true);
                }}
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
              <Label htmlFor="event_tingkat">
                Tingkat Skala <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.event_tingkat}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, event_tingkat: value }));
                  setIsDirty(true);
                }}
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
              <Label htmlFor="donasi_mulai">
                Waktu Mulai E-Voting (Opsional)
              </Label>
              <Input
                id="donasi_mulai"
                name="donasi_mulai"
                type="datetime-local"
                value={
                  formData.donasi_mulai
                    ? format(formData.donasi_mulai, "yyyy-MM-dd'T'HH:mm")
                    : ""
                }
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    donasi_mulai: e.target.value
                      ? new Date(e.target.value)
                      : null,
                  }));
                  setIsDirty(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donasi_selesai">
                Waktu Berakhir E-Voting (Opsional)
              </Label>
              <Input
                id="donasi_selesai"
                name="donasi_selesai"
                type="datetime-local"
                value={
                  formData.donasi_selesai
                    ? format(formData.donasi_selesai, "yyyy-MM-dd'T'HH:mm")
                    : ""
                }
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    donasi_selesai: e.target.value
                      ? new Date(e.target.value)
                      : null,
                  }));
                  setIsDirty(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── SEKSI 4: KONTAK & PENGATURAN ── */}
      {(isEditMode || step === 4) && (
        <div className="space-y-5 bg-muted/20 p-5 md:p-6 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 border-b pb-3">
            <PhoneCall className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">
              Kontak & Publikasi
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="event_contact_person_name">
                Nama Contact Person (Opsional)
              </Label>
              <Input
                id="event_contact_person_name"
                name="event_contact_person_name"
                value={formData.event_contact_person_name}
                onChange={handleChange}
                placeholder="Contoh: Budi Santoso"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_contact_person_number">
                No. WA Contact Person (Opsional)
              </Label>
              <Input
                id="event_contact_person_number"
                name="event_contact_person_number"
                value={formData.event_contact_person_number}
                onChange={handleChange}
                placeholder="Contoh: 081234567890"
              />
            </div>
            {event && (
              <div className="space-y-2">
                <Label htmlFor="event_status">
                  Status Publikasi <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.event_status}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, event_status: value }));
                    setIsDirty(true);
                  }}
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
            )}
            <div className="space-y-2">
              <Label htmlFor="is_result_show">Tampilkan Hasil Klasemen</Label>
              <Select
                value={formData.is_result_show ? "true" : "false"}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    is_result_show: value === "true",
                  }));
                  setIsDirty(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Sembunyikan</SelectItem>
                  <SelectItem value="true">Tampilkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(user?.role === "admin" || user?.role === "superadmin") && (
              <div className="space-y-2">
                <Label htmlFor="koordinator_id">
                  Pilih Koordinator Event{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Popover
                  open={openKoordinator}
                  onOpenChange={setOpenKoordinator}
                >
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
                                setFormData((prev) => ({
                                  ...prev,
                                  koordinator_id: c.user_id,
                                }));
                                setIsDirty(true);
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
            <div className="space-y-2 md:col-span-2 pt-2 mt-2 border-t border-border/50">
              <Label>Template Penamaan Kejuaraan (Opsional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Kosongkan untuk menggunakan standar bawaan. Tambahkan berurutan
                dari blok peringkat teratas (Misal: UTAMA, HARAPAN, MADYA).
                Setiap 1 blok mewakili 3 peringkat. Jika item urutan paling
                akhir tidak dicentang "Beri Nomor", maka namanya akan otomatis
                diterapkan untuk SEMUA sisa peringkat.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                <Input
                  value={newTemplateInput}
                  onChange={(e) => setNewTemplateInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTemplate();
                    }
                  }}
                  placeholder="Ketik lalu enter, contoh: BINA"
                />
                <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-background h-10 w-full sm:w-auto shrink-0">
                  <input
                    type="checkbox"
                    id="form-numbered-checkbox"
                    checked={newTemplateNumbered}
                    onChange={(e) => setNewTemplateNumbered(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label
                    htmlFor="form-numbered-checkbox"
                    className="text-sm cursor-pointer whitespace-nowrap"
                  >
                    Beri Nomor (1-3)
                  </Label>
                </div>
                <Button
                  type="button"
                  onClick={handleAddTemplate}
                  variant="secondary"
                  className="w-full sm:w-auto shrink-0"
                >
                  Tambah
                </Button>
              </div>
              {kejuaraanTemplate.length > 0 && (
                <div className="flex flex-col gap-2 mt-3 p-3 bg-muted/5 border rounded-xl max-h-60 overflow-y-auto scrollbar-thin">
                  {kejuaraanTemplate.map((item, idx) => {
                    const startRank = idx * 3 + 1;
                    const isLastAndUnnumbered =
                      !item.numbered && idx === kejuaraanTemplate.length - 1;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-background border rounded-lg shadow-sm transition-colors hover:border-purple-300 dark:hover:border-purple-700"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-7 h-7 mt-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {item.name}
                            </span>
                            <span className="text-xs text-muted-foreground mb-1.5">
                              {item.numbered
                                ? "Diberi Nomor (1-3)"
                                : isLastAndUnnumbered
                                  ? "Tanpa Nomor (Penyapu Sisa)"
                                  : "Tanpa Nomor (Tetap 3 Peringkat)"}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.numbered ? (
                                <>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 h-5 font-normal bg-muted/30 text-muted-foreground"
                                  >
                                    Peringkat {startRank}:{" "}
                                    <strong className="text-foreground ml-1">
                                      {item.name} 1
                                    </strong>
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 h-5 font-normal bg-muted/30 text-muted-foreground"
                                  >
                                    Peringkat {startRank + 1}:{" "}
                                    <strong className="text-foreground ml-1">
                                      {item.name} 2
                                    </strong>
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 h-5 font-normal bg-muted/30 text-muted-foreground"
                                  >
                                    Peringkat {startRank + 2}:{" "}
                                    <strong className="text-foreground ml-1">
                                      {item.name} 3
                                    </strong>
                                  </Badge>
                                </>
                              ) : isLastAndUnnumbered ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 h-5 font-normal bg-muted/30 text-muted-foreground"
                                >
                                  Peringkat {startRank} dst:{" "}
                                  <strong className="text-foreground ml-1">
                                    {item.name}
                                  </strong>
                                </Badge>
                              ) : (
                                <>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 h-5 font-normal bg-muted/30 text-muted-foreground"
                                  >
                                    Peringkat {startRank}:{" "}
                                    <strong className="text-foreground ml-1">
                                      {item.name}
                                    </strong>
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 h-5 font-normal bg-muted/30 text-muted-foreground"
                                  >
                                    Peringkat {startRank + 1}:{" "}
                                    <strong className="text-foreground ml-1">
                                      {item.name}
                                    </strong>
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 h-5 font-normal bg-muted/30 text-muted-foreground"
                                  >
                                    Peringkat {startRank + 2}:{" "}
                                    <strong className="text-foreground ml-1">
                                      {item.name}
                                    </strong>
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveTemplate(idx)}
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 h-8 w-8 ml-2"
                          title="Hapus template ini"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SEKSI 5: BERKAS PENDUKUNG ── */}
      {(isEditMode || step === 5) && (
        <div className="space-y-5 bg-muted/20 p-5 md:p-6 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 border-b pb-3">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">
              Berkas Pendukung
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="event_poster">Poster Event (Opsional)</Label>
              <div className="flex items-center gap-4">
                {posterPreview && (
                  <Image
                    src={posterPreview}
                    alt="Pratinjau Poster"
                    width={60}
                    height={84}
                    className="rounded-md border object-cover p-1 bg-white"
                  />
                )}
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    id="event_poster"
                    name="event_poster"
                    type="file"
                    onChange={handlePosterChange}
                    className="flex-1"
                    accept="image/*"
                    ref={posterInputRef}
                  />
                  {poster && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemovePoster}
                      title="Batal pilih poster"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_juknis">
                Petunjuk Teknis / Juknis (PDF/Doc)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="event_juknis"
                  name="event_juknis"
                  type="file"
                  onChange={handleJuknisChange}
                  className="flex-1"
                  accept=".pdf,.doc,.docx"
                  ref={juknisInputRef}
                />
                {juknis && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveJuknis}
                    title="Batal pilih juknis"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              {juknisName && (
                <p className="text-xs text-muted-foreground mt-1">
                  File saat ini:{" "}
                  <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {juknisName.split("/").pop()}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER TOMBOL SIMPAN ── */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>

        {!isEditMode && step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            disabled={isSubmitting}
          >
            Kembali
          </Button>
        )}

        {!isEditMode && step < 5 ? (
          <Button type="button" onClick={handleNextStep}>
            Selanjutnya
          </Button>
        ) : (
          <>
            <Button
              type="submit"
              variant="secondary"
              onClick={() => setSubmitStatus("draft")}
              disabled={isSubmitting}
            >
              Simpan sebagai Draft
            </Button>
            <Button
              type="submit"
              onClick={() => setSubmitStatus("published")}
              disabled={isSubmitting}
            >
              {isEditMode && formData.event_status === "archived"
                ? "Simpan Perubahan"
                : "Simpan & Publish"}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};

export default function EventManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(10);
  const [totalEvents, setTotalEvents] = useState(0);
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
        limit: eventsPerPage,
      });
      if (debouncedSearch) params.append("search", debouncedSearch);

      const eventsRes = await api.get(`/events?${params.toString()}`);

      setEvents(eventsRes.data.events);
      setTotalEvents(eventsRes.data.totalItems || 0);
      setTotalPages(eventsRes.data.totalPages || 0);

      if (user?.role === "admin" || user?.role === "superadmin") {
        const usersRes = await api.get("/users");
        setCoordinators(
          usersRes.data.filter((u) => u.user_role === "koordinator_event"),
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memuat data event.");
    } finally {
      setLoading(false);
    }
  }, [user?.role, currentPage, eventsPerPage, debouncedSearch]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleSaveEvent = async (eventData, poster, juknis) => {
    const formData = new FormData();
    Object.keys(eventData).forEach((key) => {
      if (eventData[key] !== null) {
        formData.append(key, eventData[key]);
      }
    });

    if (poster) {
      formData.append("event_poster", poster);
    }
    if (juknis) {
      formData.append("event_juknis", juknis);
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
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        toast.success(response.data.message || "Event berhasil diperbarui.");
      } else {
        const response = await api.post("/events", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(response.data.message || "Event berhasil dibuat.");
      }
      setIsDirty(false);
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
    setIsDirty(false);
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Daftar Event</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola jadwal, pendaftaran, dan pelaksanaan event.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama atau tempat..."
                className="w-full bg-background pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {user?.role !== "juri" && (
              <Button className="w-full sm:w-auto" onClick={() => openDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Event
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Detail Event</TableHead>
                <TableHead>Pelaksanaan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Partisipan</TableHead>
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
                  <TableRow
                    key={event.event_id}
                    className="hover:bg-muted/40 transition-colors group cursor-pointer"
                    onClick={(e) => {
                      if (
                        e.target.closest("button") ||
                        e.target.closest('[role="menu"]') ||
                        e.target.closest('[role="menuitem"]')
                      ) {
                        return;
                      }
                      router.push(`/admin/events/${event.event_id}`);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-16 shrink-0 rounded-md overflow-hidden border shadow-sm bg-white">
                          <Image
                            src={
                              event.event_poster
                                ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                                : "/default-poster.png"
                            }
                            alt={`Poster ${event.event_name}`}
                            fill
                            className="object-cover"
                            onError={(e) =>
                              (e.currentTarget.src = "/default-poster.png")
                            }
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/admin/events/${event.event_id}`}
                            className="font-bold text-sm md:text-base text-foreground hover:text-primary transition-colors truncate"
                            title={event.event_name}
                          >
                            {event.event_name}
                          </Link>
                          <div className="flex items-center mt-1">
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 font-mono tracking-wider text-muted-foreground bg-muted/50 border-border/50"
                            >
                              {event.event_id}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/90">
                          <CalendarIcon className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                          {format(new Date(event.event_tanggal), "d MMM yyyy", {
                            locale: id,
                          })}
                        </div>
                        <div
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                          title={event.event_tempat}
                        >
                          <MapPin className="h-3.5 w-3.5 opacity-70 shrink-0" />
                          <span className="truncate max-w-[150px] sm:max-w-[200px]">
                            {event.event_tempat}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(event.event_status)}
                        className="capitalize shadow-sm"
                      >
                        {event.event_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-md w-fit border border-emerald-200/50 dark:border-emerald-800/50">
                          <Users className="h-3 w-3" />{" "}
                          {event.Event_teams?.length || 0} Tim
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded-md w-fit border border-blue-200/50 dark:border-blue-800/50">
                          <ShieldCheck className="h-3 w-3" />{" "}
                          {event.Event_juris?.length || 0} Juri
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {event.User?.user_name?.charAt(0).toUpperCase() ||
                            "-"}
                        </div>
                        <span
                          className="text-sm font-medium truncate max-w-[120px]"
                          title={event.User?.user_name || "-"}
                        >
                          {event.User?.user_name || "-"}
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

        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tampilkan</span>
              <Select
                value={eventsPerPage.toString()}
                onValueChange={(val) => {
                  setEventsPerPage(Number(val));
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
                dari {totalEvents} event
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

      {/* Dialog untuk Tambah/Edit Event akan ditempatkan di sini */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (isDirty) {
              setIsCancelAlertOpen(true);
            } else {
              setSelectedEvent(null);
              setIsDialogOpen(false);
            }
          } else {
            setIsDialogOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Edit Event" : "Tambah Event Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-2">
            <EventForm
              event={selectedEvent}
              coordinators={coordinators}
              user={user}
              onSave={handleSaveEvent}
              onCancel={() => {
                if (isDirty) {
                  setIsCancelAlertOpen(true);
                } else {
                  setSelectedEvent(null);
                  setIsDialogOpen(false);
                }
              }}
              setIsDirty={setIsDirty}
            />
          </div>
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

      {/* Dialog untuk Konfirmasi Batal / Close */}
      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buang Perubahan?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin
              ingin membuang perubahan ini dan menutup form?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali ke Form</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setIsCancelAlertOpen(false);
                setIsDirty(false);
                setSelectedEvent(null);
                setIsDialogOpen(false);
              }}
            >
              Ya, Buang Perubahan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
