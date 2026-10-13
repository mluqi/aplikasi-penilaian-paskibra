"use client";

import { useState, useEffect, useCallback, Fragment, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  RefreshCcw,
  MapPin,
  Building2,
  Hourglass,
  Wallet,
  Phone,
  CalendarIcon as CalendarCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  Gavel,
  MonitorPlay,
  GripVertical,
  Copy,
  FileText,
  UserCircle,
  Printer,
  UserCog,
  Award,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Info,
  Check,
  X,
  ChevronsUpDown,
  Trophy,
  ArrowUp,
  ArrowDown,
  Download,
  Search,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import AspekManagementCard from "@/components/admin/events/AspekManagement";
import { useReactToPrint } from "react-to-print";
import PDFLayoutEVoting from "@/components/shared/PDFLayoutEVoting";
import CertificateLayout from "@/components/shared/CertificateLayout";
import { exportEVotingPDF } from "@/lib/exportEVotingPDF";
import {
  PenaltyManagementCard,
  TeamPenaltyManager,
} from "@/components/admin/events/PenaltyManagement";
import KategoriJuaraManagementCard from "@/components/admin/events/KategoriJuaraManagement";

const getCountdownText = (targetDateStr) => {
  if (!targetDateStr) return null;
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays} hari lagi`;
  if (diffDays === 0) return "Hari ini";
  return "Selesai";
};

const getKejuaraanTitle = (rank, templateStr) => {
  const defaultTemplate = [
    { name: "UTAMA", numbered: true },
    { name: "HARAPAN UTAMA", numbered: true },
    { name: "MADYA", numbered: true },
    { name: "HARAPAN MADYA", numbered: true },
    { name: "BINA", numbered: true },
    { name: "HARAPAN BINA", numbered: true },
    { name: "MULA", numbered: true },
    { name: "HARAPAN MULA", numbered: true },
    { name: "PURWA", numbered: true },
    { name: "HARAPAN PURWA", numbered: true },
    { name: "CARAKA", numbered: true },
    { name: "POTENSIAL", numbered: false },
  ];

  let activeTemplate = defaultTemplate;

  if (templateStr) {
    try {
      const parsed =
        typeof templateStr === "string" ? JSON.parse(templateStr) : templateStr;
      if (Array.isArray(parsed) && parsed.length > 0) {
        activeTemplate = parsed.map((item) =>
          typeof item === "string" ? { name: item, numbered: true } : item,
        );
      }
    } catch (e) {
      console.error("Gagal mem-parsing kejuaraan_template", e);
    }
  }

  const blockIndex = Math.floor((rank - 1) / 3);
  if (blockIndex < activeTemplate.length) {
    const templateItem = activeTemplate[blockIndex];
    if (templateItem.numbered) {
      return `${templateItem.name} ${((rank - 1) % 3) + 1}`;
    } else {
      return templateItem.name;
    }
  } else if (activeTemplate.length > 0) {
    const lastItem = activeTemplate[activeTemplate.length - 1];
    if (!lastItem.numbered) {
      return lastItem.name;
    }
  }
  return "-";
};

// --- Komponen Utama Halaman ---

export default function EventDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const eventId = params.id;
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [allJuries, setAllJuries] = useState([]);
  const [allAsistens, setAllAsistens] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [selectedJuri, setSelectedJuri] = useState("");
  const [selectedAsisten, setSelectedAsisten] = useState("");
  const [selectedAspekJuriIds, setSelectedAspekJuriIds] = useState([]);
  const [eventAspeks, setEventAspeks] = useState([]);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [syncingTeamId, setSyncingTeamId] = useState(null);
  const [selectedTeamForPenalty, setSelectedTeamForPenalty] = useState(null);

  const [openTeamDropdown, setOpenTeamDropdown] = useState(false);
  const [searchTeam, setSearchTeam] = useState("");
  const [openJuriDropdown, setOpenJuriDropdown] = useState(false);
  const [searchJuri, setSearchJuri] = useState("");
  const [openAsistenDropdown, setOpenAsistenDropdown] = useState(false);
  const [searchAsisten, setSearchAsisten] = useState("");

  const [editingTeamIdForTampil, setEditingTeamIdForTampil] = useState(null);
  const [editNomorTampil, setEditNomorTampil] = useState("");
  const [selectedTeamDetails, setSelectedTeamDetails] = useState(null);

  const [editingJuriId, setEditingJuriId] = useState(null);
  const [editJuriAspekIds, setEditJuriAspekIds] = useState([]);
  const [isEditJuriDialogOpen, setIsEditJuriDialogOpen] = useState(false);

  const [teamSortConfig, setTeamSortConfig] = useState({
    key: "team_id",
    direction: "asc",
  });

  const [kejuaraanTemplate, setKejuaraanTemplate] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateNumbered, setNewTemplateNumbered] = useState(true);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const printEVotingRef = useRef();
  const handlePrintEVoting = useReactToPrint({
    contentRef: printEVotingRef,
    documentTitle: `Rekap_EVoting_${event?.event_name?.replace(/\s+/g, "_") || "Event"}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  });

  const [certData, setCertData] = useState([]);
  const [isReadyToPrint, setIsReadyToPrint] = useState(false);
  const [teamPredikats, setTeamPredikats] = useState({});
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [teamAwardsMap, setTeamAwardsMap] = useState({});
  const [klasemenLoaded, setKlasemenLoaded] = useState(false);
  const [teamMembers, setTeamMembers] = useState({});
  const [loadingMembers, setLoadingMembers] = useState({});
  const [printDocTitle, setPrintDocTitle] = useState("");
  const [teamRankings, setTeamRankings] = useState({});
  const [certSortBy, setCertSortBy] = useState("no_tampil");

  const fetchTeamMembers = async (teamId) => {
    if (teamMembers[teamId]) return;
    setLoadingMembers((prev) => ({ ...prev, [teamId]: true }));
    try {
      const response = await api.get(`/anggota/team/${teamId}`);
      const members = response.data?.anggota || response.data || [];
      setTeamMembers((prev) => ({ ...prev, [teamId]: members }));
    } catch (error) {
      console.error("Gagal mengambil data anggota tim:", error);
      toast.error("Gagal mengambil data anggota tim");
    } finally {
      setLoadingMembers((prev) => ({ ...prev, [teamId]: false }));
    }
  };

  const handleToggleExpandTeam = (teamId) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null);
    } else {
      setExpandedTeamId(teamId);
      fetchTeamMembers(teamId);
    }
  };

  const printCertificateRef = useRef();
  const handlePrintCertificate = useReactToPrint({
    contentRef: printCertificateRef,
    documentTitle: printDocTitle || `Sertifikat_${event?.event_name?.replace(/\s+/g, "_") || "Event"}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
    onAfterPrint: () => {
      setCertData([]);
      setIsReadyToPrint(false);
    }
  });

  useEffect(() => {
    if (isReadyToPrint && certData.length > 0) {
      handlePrintCertificate();
      setIsReadyToPrint(false);
    }
  }, [isReadyToPrint, certData, handlePrintCertificate]);

  const fetchKlasemenAwards = useCallback(async () => {
    if (!eventId || !event) return;
    try {
      const kategoriRes = await api.get(`/rekap/kategori/${eventId}`);
      const categories = kategoriRes.data.data || [];
      const awardsMap = {};
      const rankingsMap = {};

      await Promise.all(
        categories.map(async (kat) => {
          try {
            const res = await api.get(`/rekap/klasemen/${kat.id}`);
            const klasemen = res.data.klasemen || [];
            
            const isJuaraUmumOrGlobal =
              kat.jenis_juara === "juara_umum" ||
              kat.jenis_juara === "juara_peringkat" ||
              kat.is_juara_umum ||
              kat.tipe_penilaian === "global";

            if (isJuaraUmumOrGlobal) {
              klasemen.forEach((item, idx) => {
                const teamId = item.team_id || item.Team?.team_id;
                if (!teamId) return;
                rankingsMap[teamId] = idx + 1;
              });
            }

            const limitJuara = kat.limit_juara
              ? parseInt(kat.limit_juara, 10)
              : null;

            if (kat.jenis_juara === "juara_umum" || kat.is_juara_umum) {
              if (klasemen.length > 0) {
                const firstTeam = klasemen[0];
                const teamId = firstTeam.team_id || firstTeam.Team?.team_id;
                if (teamId) {
                  if (!awardsMap[teamId]) awardsMap[teamId] = [];
                  awardsMap[teamId].push({
                    categoryName: kat.nama_kategori,
                    title: "JUARA UMUM",
                    isJuaraUmumOrGlobal: true,
                  });
                }
              }
            } else if (
              kat.jenis_juara === "juara_peringkat" ||
              kat.tipe_penilaian === "global"
            ) {
              klasemen.forEach((item, idx) => {
                const teamId = item.team_id || item.Team?.team_id;
                if (!teamId) return;
                const rank = idx + 1;
                if (limitJuara && rank > limitJuara) return;
                const title = getKejuaraanTitle(rank, event.kejuaraan_template);
                if (!awardsMap[teamId]) awardsMap[teamId] = [];
                awardsMap[teamId].push({
                  categoryName: kat.nama_kategori,
                  title: title,
                  isJuaraUmumOrGlobal: true,
                });
              });
            } else {
              klasemen.forEach((item, idx) => {
                const teamId = item.team_id || item.Team?.team_id;
                if (!teamId) return;
                const rank = idx + 1;
                if (limitJuara && rank > limitJuara) return;
                if (!awardsMap[teamId]) awardsMap[teamId] = [];
                awardsMap[teamId].push({
                  categoryName: kat.nama_kategori,
                  title: `${kat.nama_kategori} Terbaik ${rank}`,
                  isJuaraUmumOrGlobal: false,
                });
              });
            }
          } catch (e) {
            console.error("Gagal memuat klasemen untuk kategori " + kat.id, e);
          }
        })
      );

      setTeamRankings(rankingsMap);
      setTeamAwardsMap(awardsMap);
      setKlasemenLoaded(true);

      setTeamPredikats((prev) => {
        const updated = { ...prev };
        event.Event_teams?.forEach((et) => {
          const teamId = et.team_id || et.Team?.team_id;
          if (!teamId) return;
          const awards = awardsMap[teamId] || [];
          const mainAward = awards.find(a => a.isJuaraUmumOrGlobal) ||
            awards.find(a => 
              a.categoryName.toLowerCase().includes("umum") || 
              a.categoryName.toLowerCase().includes("global") || 
              a.categoryName.toLowerCase().includes("utama")
            ) || awards[0];
          
          const rank = rankingsMap[teamId];
          const hasAward = mainAward && mainAward.title && !mainAward.title.startsWith("-");

          if (hasAward) {
            updated[teamId] = mainAward.title;
          } else if (rank) {
            updated[teamId] = `PERINGKAT ${rank}`;
          } else {
            updated[teamId] = "PESERTA";
          }
        });
        return updated;
      });
    } catch (error) {
      console.error("Gagal mengambil data klasemen untuk sertifikat:", error);
    }
  }, [eventId, event]);

  useEffect(() => {
    const isLocked = !event?.is_result_show && event?.event_status !== "archived";
    if (event && !isLocked && !klasemenLoaded) {
      fetchKlasemenAwards();
    }
  }, [event, fetchKlasemenAwards, klasemenLoaded]);

  const fetchData = useCallback(async () => {
    if (!eventId) return;
    try {
      const eventRes = await api.get(`/events/${eventId}`);
      const fetchedEvent = eventRes.data.event;
      setEvent(fetchedEvent);

      if (fetchedEvent?.Event_teams) {
        setTeamPredikats((prev) => {
          const initial = { ...prev };
          fetchedEvent.Event_teams.forEach((et) => {
            if (!initial[et.team_id]) {
              initial[et.team_id] = "PESERTA";
            }
          });
          return initial;
        });
      }

      if (user?.role !== "juri") {
        const [teamsRes, usersRes, aspeksRes] = await Promise.all([
          api.get("/teams"),
          api.get("/users"),
          api.get(`/aspek?event_id=${eventId}`),
        ]);
        setAllTeams(teamsRes.data.teams);
        setAllJuries(usersRes.data.filter((u) => u.user_role === "juri"));
        setAllAsistens(
          usersRes.data.filter((u) => u.user_role === "asisten_juri"),
        );
        const sortedAspeks = aspeksRes.data.sort(
          (a, b) => (a.urutan || 0) - (b.urutan || 0),
        );
        setEventAspeks(sortedAspeks);
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

  useEffect(() => {
    if (event?.kejuaraan_template) {
      try {
        const parsed =
          typeof event.kejuaraan_template === "string"
            ? JSON.parse(event.kejuaraan_template)
            : event.kejuaraan_template;
        setKejuaraanTemplate(
          parsed.map((item) =>
            typeof item === "string" ? { name: item, numbered: true } : item,
          ),
        );
      } catch (e) {
        setKejuaraanTemplate([]);
      }
    } else {
      setKejuaraanTemplate([]);
    }
  }, [event]);

  const handleAdd = async (type) => {
    if (type === "team") {
      if (selectedTeams.length === 0) {
        toast.warning("Pilih setidaknya satu tim.");
        return;
      }
      try {
        setIsSubmittingTeam(true);
        await api.post("/events/team", {
          event_id: eventId,
          team_id: selectedTeams[0],
          team_ids: selectedTeams,
        });
        toast.success(`${selectedTeams.length} tim berhasil ditambahkan ke event.`);
        fetchData();
        setSelectedTeams([]);
        setIsAddTeamDialogOpen(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Gagal menambahkan tim.");
      } finally {
        setIsSubmittingTeam(false);
      }
      return;
    }

    const id =
      type === "juri"
        ? selectedJuri
        : selectedAsisten;
    if (!id) {
      toast.warning(`Pilih ${type} terlebih dahulu.`);
      return;
    }

    try {
      const payload =
        type === "juri"
          ? {
              event_id: eventId,
              juri_id: id,
              aspek_ids: selectedAspekJuriIds,
            }
          : { event_id: eventId, asisten_id: id };
      await api.post(`/events/${type}`, payload);
      toast.success(
        `${type === "juri" ? "Juri" : "Asisten Juri"} berhasil ditambahkan.`,
      );
      fetchData();
      if (type === "juri") {
        setSelectedJuri("");
        setSelectedAspekJuriIds([]);
      }
      if (type === "asisten") {
        setSelectedAsisten("");
      }
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
          : type === "juri"
            ? { event_id: eventId, juri_id: id }
            : { event_id: eventId, asisten_id: id };
      await api.delete(`/events/${type}`, { data: payload });
      toast.success(
        `${type === "team" ? "Tim" : type === "juri" ? "Juri" : "Asisten Juri"} berhasil dihapus.`,
      );
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

  const openEditJuri = (juriItem) => {
    setEditingJuriId(juriItem.User.user_id);
    setEditJuriAspekIds(juriItem.Aspeks?.map((a) => a.aspek_id) || []);
    setIsEditJuriDialogOpen(true);
  };

  const handleUpdateJuri = async () => {
    try {
      await api.put("/events/juri", {
        event_id: eventId,
        juri_id: editingJuriId,
        aspek_ids: editJuriAspekIds,
      });
      toast.success("Aspek Juri berhasil diperbarui.");
      setIsEditJuriDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui Aspek Juri.",
      );
    }
  };

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    try {
      const response = await api.post("/events/xenplatform", {
        event_id: eventId,
      });
      toast.success(response.data?.message || "Fitur E-Voting berhasil diaktifkan.");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengaktifkan E-Voting.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleSyncBalance = async (teamId) => {
    setSyncingTeamId(teamId);
    try {
      const res = await api.post("/events/team/sync-balance", {
        event_id: eventId,
        team_id: teamId,
      });
      toast.success(res.data.message || "Saldo berhasil disinkronisasi.");
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menyinkronkan saldo.",
      );
    } finally {
      setSyncingTeamId(null);
    }
  };

  const handleToggleResultShow = async () => {
    try {
      const formData = new FormData();
      formData.append("is_result_show", !event.is_result_show);

      await api.put(`/events/${eventId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        `Klasemen berhasil ${!event.is_result_show ? "ditampilkan di" : "disembunyikan dari"} halaman publik.`,
      );
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal mengubah status klasemen.",
      );
    }
  };

  const handleUpdateNomorTampil = async (teamId) => {
    try {
      await api.put("/events/team/nomor-tampil", {
        event_id: eventId,
        team_id: teamId,
        nomor_tampil: editNomorTampil ? parseInt(editNomorTampil, 10) : null,
      });
      toast.success("Nomor tampil berhasil diperbarui.");
      setEditingTeamIdForTampil(null);
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui nomor tampil.",
      );
    }
  };

  const handleSortTeams = (key) => {
    let direction = "asc";
    if (teamSortConfig.key === key && teamSortConfig.direction === "asc") {
      direction = "desc";
    }
    setTeamSortConfig({ key, direction });
  };

  const handleAddTemplateItem = () => {
    if (!newTemplateName.trim()) return;
    setKejuaraanTemplate((prev) => [
      ...prev,
      {
        name: newTemplateName.trim().toUpperCase(),
        numbered: newTemplateNumbered,
      },
    ]);
    setNewTemplateName("");
    setNewTemplateNumbered(true);
  };

  const handleRemoveTemplateItem = (index) => {
    setKejuaraanTemplate((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true);
    try {
      const formData = new FormData();
      formData.append(
        "kejuaraan_template",
        kejuaraanTemplate.length > 0 ? JSON.stringify(kejuaraanTemplate) : "",
      );

      await api.put(`/events/${eventId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Template kejuaraan berhasil disimpan.");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan template.");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Memuat data event...
        </p>
      </div>
    );
  }
  if (!event) return <div>Event tidak ditemukan.</div>;

  const participatingTeamIds = new Set(event.Event_teams.map((t) => t.team_id));
  const availableTeams = allTeams.filter(
    (t) => !participatingTeamIds.has(t.team_id),
  );

  const participatingJuriIds = new Set(event.Event_juris.map((j) => j.juri_id));
  const availableJuries = allJuries.filter(
    (j) => !participatingJuriIds.has(j.user_id),
  );

  const filteredAvailableTeams = availableTeams.filter(
    (t) =>
      (t.team_name || "").toLowerCase().includes(searchTeam.toLowerCase()) ||
      (t.team_sekolah_instansi || "")
        .toLowerCase()
        .includes(searchTeam.toLowerCase()) ||
      (t.team_id || "").toLowerCase().includes(searchTeam.toLowerCase()),
  );

  const filteredAvailableJuries = availableJuries.filter(
    (j) =>
      (j.user_name || "").toLowerCase().includes(searchJuri.toLowerCase()) ||
      (j.user_email || "").toLowerCase().includes(searchJuri.toLowerCase()),
  );

  const participatingAsistenIds = new Set(
    event.Event_asistens?.map((a) => a.asisten_id) || [],
  );
  const availableAsistens = allAsistens.filter(
    (a) => !participatingAsistenIds.has(a.user_id),
  );

  const filteredAvailableAsistens = availableAsistens.filter(
    (a) =>
      (a.user_name || "").toLowerCase().includes(searchAsisten.toLowerCase()) ||
      (a.user_email || "").toLowerCase().includes(searchAsisten.toLowerCase()),
  );

  const sortedEventTeams = [...(event.Event_teams || [])].sort((a, b) => {
    const { key, direction } = teamSortConfig;
    let valA, valB;

    if (key === "team_id") {
      valA = a.Team?.team_id || "";
      valB = b.Team?.team_id || "";
    } else if (key === "team_name") {
      valA = (a.Team?.team_name || "").toLowerCase();
      valB = (b.Team?.team_name || "").toLowerCase();
    } else if (key === "nomor_tampil") {
      const numA = Number(a.nomor_tampil) || 0;
      const numB = Number(b.nomor_tampil) || 0;
      // Jika salah satu tidak memiliki nomor tampil, taruh di bawah
      if (numA === 0 && numB !== 0) return 1;
      if (numA !== 0 && numB === 0) return -1;
      valA = numA;
      valB = numB;
    } else if (key === "balance") {
      valA = Number(a.balance) || 0;
      valB = Number(b.balance) || 0;
    }

    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

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
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-6 mb-2">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-32 lg:w-40 shrink-0 mx-auto md:mx-0">
              <Image
                src={
                  event.event_poster
                    ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                    : "/default-poster.png"
                }
                alt={`Poster ${event.event_name}`}
                width={160}
                height={224}
                className="rounded-xl border shadow-sm object-cover w-full h-auto aspect-[3/4]"
              />
            </div>
            <div className="flex-1 w-full">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">
                {event.event_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-primary" />{" "}
                  {format(new Date(event.event_tanggal), "EEEE, d MMMM yyyy", {
                    locale: id,
                  })}
                  <span className="font-bold text-red-500 dark:text-red-400 ml-1">
                    ({getCountdownText(event.event_tanggal)})
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />{" "}
                  {event.event_tempat}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Penyelenggara
                  </span>
                  <p
                    className="font-medium text-sm truncate"
                    title={event.event_penyelenggara || "-"}
                  >
                    {event.event_penyelenggara || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Hourglass className="w-3.5 h-3.5" /> Batas Daftar
                  </span>
                  <p className="font-medium text-sm">
                    {event.event_batas_pendaftaran ? (
                      <>
                        {format(
                          new Date(event.event_batas_pendaftaran),
                          "d MMM yyyy",
                          { locale: id },
                        )}
                        <span className="text-xs text-purple-500 dark:text-purple-400 ml-1.5 font-bold">
                          ({getCountdownText(event.event_batas_pendaftaran)})
                        </span>
                      </>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" /> Biaya
                  </span>
                  <p className="font-medium text-sm text-green-600 dark:text-green-400">
                    {event.event_biaya_pendaftaran === 0
                      ? "Gratis"
                      : new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(event.event_biaya_pendaftaran)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Kontak
                  </span>
                  <p
                    className="font-medium text-sm truncate"
                    title={event.event_contact_person_name || "-"}
                  >
                    {event.event_contact_person_name || "-"}
                    {event.event_contact_person_number
                      ? ` (${event.event_contact_person_number})`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                {event.xenplatform_id ? (
                  <>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white shadow-sm px-3 py-1 text-sm">
                      <ShieldCheck className="w-4 h-4 mr-2" /> E-Voting Aktif
                    </Badge>
                    {user?.role !== "koordinator_event" && (
                      <Button
                        onClick={() => exportEVotingPDF(event)}
                        variant="outline"
                        className="shadow-sm border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer"
                      >
                        <Download className="mr-2 h-4 w-4" /> Cetak / Download Rekap E-Voting
                      </Button>
                    )}
                  </>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={isCreatingAccount}
                        className="shadow-sm cursor-pointer"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Aktifkan
                        E-Voting Event
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Aktifkan E-Voting Event?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini akan mengaktifkan fitur E-Voting (QRIS)
                          untuk event ini agar penonton dan pendukung dapat
                          memberikan dukungan suara langsung ke tim. Apakah Anda
                          yakin ingin melanjutkan?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCreateAccount}>
                          Lanjutkan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {user?.role !== "juri" && (
                  <>
                    <Button
                      onClick={handleToggleResultShow}
                      variant={event.is_result_show ? "secondary" : "default"}
                      className="shadow-sm cursor-pointer"
                    >
                      {event.is_result_show ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" /> Sembunyikan
                          Klasemen Publik
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" /> Tampilkan Klasemen
                          Publik
                        </>
                      )}
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="shadow-sm cursor-pointer"
                    >
                      <Link href={`/admin/events/${eventId}/preview`}>
                        <MonitorPlay className="mr-2 h-4 w-4" /> Preview
                        Klasemen
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden print:block print:fixed print:inset-0 print:z-[99999] print:bg-white print:p-0 print:m-0">
          <PDFLayoutEVoting ref={printEVotingRef} event={event} />
          <CertificateLayout ref={printCertificateRef} certificates={certData} event={event} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {/* Kolom Tim Peserta */}
          <Card className="xl:col-span-2 flex flex-col h-full shadow-sm border-border/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b pb-4 pt-5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Tim Peserta
              </CardTitle>
              {user?.role !== "juri" && (
                <Dialog
                  open={isAddTeamDialogOpen}
                  onOpenChange={(open) => {
                    setIsAddTeamDialogOpen(open);
                    if (!open) {
                      setSelectedTeams([]);
                      setSearchTeam("");
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="shadow-sm">
                      <PlusCircle className="mr-2 h-4 w-4" /> Tambah Tim
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-[95vw] sm:max-w-4xl max-h-[88vh] flex flex-col p-6 overflow-hidden">
                    <DialogHeader className="pb-2 border-b">
                      <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
                        <div>
                          <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            Tambah Tim ke Event
                          </DialogTitle>
                          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Pilih satu atau beberapa tim sekaligus untuk ditambahkan ke event{" "}
                            <strong>{event.event_name}</strong>.
                          </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-medium">
                            Tersedia: {availableTeams.length}
                          </Badge>
                          <Badge variant="secondary" className="text-xs font-semibold">
                            Terdaftar: {event.Event_teams?.length || 0}
                            {event.event_kuota ? ` / ${event.event_kuota}` : ""}
                          </Badge>
                        </div>
                      </div>
                    </DialogHeader>

                    {/* Search & Bulk Actions Bar */}
                    <div className="pt-3 pb-2 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Cari nama tim, sekolah/instansi, atau ID tim..."
                            value={searchTeam}
                            onChange={(e) => setSearchTeam(e.target.value)}
                            className="pl-9 h-10 text-sm bg-muted/20"
                          />
                          {searchTeam && (
                            <button
                              type="button"
                              onClick={() => setSearchTeam("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const allFilteredIds = filteredAvailableTeams.map((t) => t.team_id);
                              const combined = Array.from(new Set([...selectedTeams, ...allFilteredIds]));
                              setSelectedTeams(combined);
                            }}
                            disabled={filteredAvailableTeams.length === 0}
                            className="text-xs h-10"
                          >
                            Pilih Semua ({filteredAvailableTeams.length})
                          </Button>
                          {selectedTeams.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTeams([])}
                              className="text-xs h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              Reset ({selectedTeams.length})
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Selected Teams Chips */}
                      {selectedTeams.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-2 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-lg max-h-24 overflow-y-auto">
                          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 shrink-0 mr-1">
                            Dipilih ({selectedTeams.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedTeams.map((tId) => {
                              const teamObj = allTeams.find((x) => x.team_id === tId);
                              return (
                                <Badge
                                  key={tId}
                                  variant="secondary"
                                  className="bg-background border border-emerald-300 dark:border-emerald-800 text-foreground text-xs py-0.5 pl-2 pr-1 gap-1 flex items-center shadow-xs"
                                >
                                  <span className="max-w-[140px] truncate">{teamObj?.team_name || tId}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTeams((prev) => prev.filter((id) => id !== tId));
                                    }}
                                    className="hover:bg-muted rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scrollable Team Selection Cards */}
                    <div className="flex-1 overflow-y-auto pr-1 py-2 min-h-[280px]">
                      {filteredAvailableTeams.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {filteredAvailableTeams.map((team) => {
                            const isSelected = selectedTeams.includes(team.team_id);
                            return (
                              <div
                                key={team.team_id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedTeams((prev) => prev.filter((id) => id !== team.team_id));
                                  } else {
                                    setSelectedTeams((prev) => [...prev, team.team_id]);
                                  }
                                }}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none",
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-1 ring-emerald-500 shadow-sm"
                                    : "border-border/70 hover:border-border hover:bg-muted/30 bg-card",
                                )}
                              >
                                {/* Checkbox box */}
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors border",
                                    isSelected
                                      ? "bg-emerald-600 border-emerald-600 text-white"
                                      : "border-muted-foreground/30 bg-background",
                                  )}
                                >
                                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                </div>

                                {/* Logo */}
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-muted border p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                                  <Image
                                    src={
                                      team.team_logo
                                        ? `${process.env.NEXT_PUBLIC_API_URL}${team.team_logo}`
                                        : "/default-logo.png"
                                    }
                                    alt=""
                                    width={36}
                                    height={36}
                                    className="object-contain w-full h-full"
                                  />
                                </div>

                                {/* Details */}
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-semibold text-sm truncate text-foreground">
                                      {team.team_name}
                                    </span>
                                    <span className="text-[10px] font-mono text-muted-foreground shrink-0 bg-muted px-1.5 py-0.5 rounded">
                                      {team.team_id}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {team.team_sekolah_instansi || "Sekolah / Instansi"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                          <Users className="w-10 h-10 opacity-30 mb-2" />
                          <p className="text-sm font-medium">
                            {availableTeams.length === 0
                              ? "Semua tim yang ada di sistem sudah terdaftar pada event ini."
                              : "Tidak ada tim yang sesuai dengan kata kunci pencarian."}
                          </p>
                        </div>
                      )}
                    </div>

                    <DialogFooter className="pt-3 border-t flex-row items-center justify-between gap-2 sm:justify-between">
                      <div className="text-xs text-muted-foreground font-medium">
                        {selectedTeams.length > 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            {selectedTeams.length} tim terpilih
                          </span>
                        ) : (
                          <span>Pilih tim dari daftar di atas</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddTeamDialogOpen(false)}
                          disabled={isSubmittingTeam}
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={() => handleAdd("team")}
                          disabled={selectedTeams.length === 0 || isSubmittingTeam}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
                        >
                          {isSubmittingTeam ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menambahkan...
                            </>
                          ) : (
                            `Tambahkan ${selectedTeams.length > 0 ? `(${selectedTeams.length})` : ""} Tim`
                          )}
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="p-0 overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSortTeams("team_id")}
                    >
                      <div className="flex items-center gap-1">
                        ID Tim
                        {teamSortConfig.key === "team_id" ? (
                          teamSortConfig.direction === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSortTeams("team_name")}
                    >
                      <div className="flex items-center gap-1">
                        Nama Tim
                        {teamSortConfig.key === "team_name" ? (
                          teamSortConfig.direction === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 select-none text-center"
                      onClick={() => handleSortTeams("nomor_tampil")}
                    >
                      <div className="flex items-center gap-1 justify-center">
                        No. Tampil
                        {teamSortConfig.key === "nomor_tampil" ? (
                          teamSortConfig.direction === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSortTeams("balance")}
                    >
                      <div className="flex items-center gap-1">
                        Status E-Voting
                        {teamSortConfig.key === "balance" ? (
                          teamSortConfig.direction === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    {user?.role !== "juri" && (
                      <>
                        <TableHead>Surat Rekomendasi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEventTeams.length > 0 ? (
                    sortedEventTeams.map((eventTeam) => {
                      const {
                        Team,
                        xenplatform_id,
                        qris_data,
                        balance,
                        nomor_tampil,
                        surat_rekomendasi,
                      } = eventTeam;

                      // Cek kelengkapan persyaratan tim
                      const anggotaList =
                        Team?.Anggota_teams || Team?.Anggota_team || [];
                      const isIncomplete =
                        !surat_rekomendasi ||
                        !Team?.team_logo ||
                        !Team?.foto_all_team ||
                        anggotaList.length === 0;

                      return (
                        <Fragment key={Team.team_id}>
                          <TableRow
                            className={cn(
                              "cursor-pointer transition-colors",
                              isIncomplete
                                ? "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40"
                                : "hover:bg-muted/50",
                            )}
                            onClick={(e) => {
                              if (
                                e.target.tagName === "BUTTON" ||
                                e.target.tagName === "INPUT" ||
                                e.target.closest("button") ||
                                e.target.closest("a")
                              )
                                return;
                              setSelectedTeamDetails({
                                ...Team,
                                nomor_tampil,
                                balance,
                                surat_rekomendasi,
                              });
                            }}
                          >
                            <TableCell className="font-mono text-xs">
                              {Team.team_id}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {Team.team_logo ? (
                                  <div className="w-8 h-8 shrink-0 bg-white rounded-full border flex items-center justify-center p-0.5 overflow-hidden">
                                    <Image
                                      src={`${process.env.NEXT_PUBLIC_API_URL}${Team.team_logo}`}
                                      alt="Logo"
                                      width={32}
                                      height={32}
                                      className="object-contain w-full h-full"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 shrink-0 bg-muted rounded-full border flex items-center justify-center overflow-hidden">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="font-bold text-foreground">
                                    {Team.team_name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {Team.team_sekolah_instansi}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {editingTeamIdForTampil === Team.team_id ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Input
                                    type="number"
                                    value={editNomorTampil}
                                    onChange={(e) =>
                                      setEditNomorTampil(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleUpdateNomorTampil(Team.team_id);
                                      } else if (e.key === "Escape") {
                                        setEditingTeamIdForTampil(null);
                                      }
                                    }}
                                    className="w-16 h-8 text-center px-1 font-mono shadow-sm"
                                    autoFocus
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                    onClick={() =>
                                      handleUpdateNomorTampil(Team.team_id)
                                    }
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100"
                                    onClick={() =>
                                      setEditingTeamIdForTampil(null)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : user?.role !== "juri" ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTeamIdForTampil(Team.team_id);
                                    setEditNomorTampil(nomor_tampil || "");
                                  }}
                                  className="inline-flex items-center justify-center min-w-[40px] h-8 px-2.5 rounded-lg border border-border/80 bg-background hover:bg-muted hover:border-primary/50 text-foreground font-bold font-mono text-sm transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                                  title="Klik untuk ubah nomor tampil"
                                >
                                  <span>{nomor_tampil || "-"}</span>
                                  <Edit className="ml-1.5 h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                </button>
                              ) : (
                                <span className="font-bold font-mono text-base text-foreground">
                                  {nomor_tampil || "-"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {event.xenplatform_id ? (
                                <div className="flex flex-col gap-1 items-start">
                                  <Badge className="bg-green-600 hover:bg-green-700">
                                    Siap Menerima E-Voting
                                  </Badge>
                                  {user?.role !== "koordinator_event" && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs font-medium text-muted-foreground">
                                        Saldo: Rp{" "}
                                        {(Number(balance) || 0).toLocaleString(
                                          "id-ID",
                                        )}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 text-muted-foreground hover:text-primary"
                                        onClick={() =>
                                          handleSyncBalance(Team.team_id)
                                        }
                                        disabled={
                                          syncingTeamId === Team.team_id
                                        }
                                        title="Sync Saldo"
                                      >
                                        <RefreshCcw
                                          className={`h-3 w-3 ${syncingTeamId === Team.team_id ? "animate-spin" : ""}`}
                                        />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="secondary">Belum Aktif</Badge>
                              )}
                            </TableCell>
                            {user?.role !== "juri" && (
                              <>
                                <TableCell>
                                  {surat_rekomendasi ? (
                                    <a
                                      href={`${process.env.NEXT_PUBLIC_API_URL}${surat_rekomendasi}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded-md transition-colors hover:bg-primary/20"
                                      onClick={(e) => e.stopPropagation()} // Supaya baris detail tidak ikut terbuka jika diklik
                                    >
                                      <FileText className="w-3.5 h-3.5" /> Lihat
                                      Surat
                                    </a>
                                  ) : (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] text-muted-foreground font-normal"
                                    >
                                      Belum Upload
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                      onClick={() =>
                                        setSelectedTeamForPenalty(Team)
                                      }
                                      title="Input Penalti Tim"
                                    >
                                      <Gavel className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-destructive"
                                      onClick={() =>
                                        openAlert(
                                          "team",
                                          Team.team_id,
                                          Team.team_name,
                                        )
                                      }
                                      title="Hapus Tim"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        </Fragment>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={user?.role !== "juri" ? 6 : 4}
                        className="h-24 text-center"
                      >
                        Belum ada tim peserta.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Kolom Dewan Juri */}
          <Card className="flex flex-col h-full shadow-sm border-border/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b pb-4 pt-5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Dewan Juri
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
                      <div>
                        <Button
                          onClick={() => router.push("/admin/add-juri")}
                          variant="outline"
                          className="mb-4 cursor-pointer"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Daftarkan Juri Baru
                        </Button>
                      </div>
                      <Popover
                        open={openJuriDropdown}
                        onOpenChange={setOpenJuriDropdown}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openJuriDropdown}
                            className={cn(
                              "w-full justify-between font-normal h-auto py-2",
                              !selectedJuri && "text-muted-foreground",
                            )}
                          >
                            <span className="truncate text-left">
                              {selectedJuri
                                ? (() => {
                                    const j = availableJuries.find(
                                      (x) => x.user_id === selectedJuri,
                                    );
                                    return j
                                      ? `${j.user_name} (${j.user_email})`
                                      : "Pilih juri...";
                                  })()
                                : "Pilih juri..."}
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
                                placeholder="Cari juri..."
                                value={searchJuri}
                                onChange={(e) => setSearchJuri(e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto p-1">
                              {filteredAvailableJuries.length > 0 ? (
                                filteredAvailableJuries.map((juri) => (
                                  <Button
                                    key={juri.user_id}
                                    variant="ghost"
                                    className="w-full justify-start font-normal h-auto py-2"
                                    onClick={() => {
                                      setSelectedJuri(juri.user_id);
                                      setOpenJuriDropdown(false);
                                      setSearchJuri("");
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 shrink-0 mt-0.5",
                                        selectedJuri === juri.user_id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col items-start ml-1 overflow-hidden">
                                      <span className="truncate w-full font-medium">
                                        {juri.user_name}
                                      </span>
                                      <span className="text-xs text-muted-foreground truncate w-full">
                                        {juri.user_email}
                                      </span>
                                    </div>
                                  </Button>
                                ))
                              ) : (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  {availableJuries.length === 0
                                    ? "Semua juri sudah ditugaskan."
                                    : "Juri tidak ditemukan."}
                                </div>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Label htmlFor="aspek_juri" className="mt-2 block">
                        Aspek Penilaian
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {selectedAspekJuriIds.length > 0
                              ? `${selectedAspekJuriIds.length} aspek dipilih`
                              : "Pilih Aspek Penilaian..."}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-56 max-h-60 overflow-y-auto"
                          align="start"
                        >
                          {eventAspeks.length > 0 && (
                            <>
                              <DropdownMenuCheckboxItem
                                checked={
                                  selectedAspekJuriIds.length ===
                                  eventAspeks.length
                                }
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedAspekJuriIds(
                                      eventAspeks.map((a) => a.aspek_id),
                                    );
                                  } else {
                                    setSelectedAspekJuriIds([]);
                                  }
                                }}
                                className="font-bold"
                              >
                                Pilih Semua
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {eventAspeks.map((aspek) => (
                            <DropdownMenuCheckboxItem
                              key={aspek.aspek_id}
                              checked={selectedAspekJuriIds.includes(
                                aspek.aspek_id,
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAspekJuriIds((prev) => [
                                    ...prev,
                                    aspek.aspek_id,
                                  ]);
                                } else {
                                  setSelectedAspekJuriIds((prev) =>
                                    prev.filter((id) => id !== aspek.aspek_id),
                                  );
                                }
                              }}
                            >
                              {aspek.nama_aspek}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => handleAdd("juri")}
                        disabled={
                          !selectedJuri || selectedAspekJuriIds.length === 0
                        }
                      >
                        Simpan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="p-0 overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Juri</TableHead>
                    <TableHead>Nama Juri</TableHead>
                    <TableHead>Aspek Penilaian</TableHead>
                    {user?.role !== "juri" && (
                      <TableHead className="text-right">Aksi</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.Event_juris.length > 0 ? (
                    event.Event_juris.map((juriItem) => (
                      <TableRow key={juriItem.User.user_id}>
                        <TableCell className="font-mono text-xs">
                          {juriItem.User.user_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {juriItem.User.user_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {juriItem.Aspeks?.length > 0
                              ? juriItem.Aspeks.map((aspek) => (
                                  <Badge
                                    key={aspek.aspek_id}
                                    variant="secondary"
                                  >
                                    {aspek.nama_aspek}
                                  </Badge>
                                ))
                              : "-"}
                          </div>
                        </TableCell>
                        {user?.role !== "juri" && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEditJuri(juriItem)}
                                title="Edit Aspek Juri"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive"
                                onClick={() =>
                                  openAlert(
                                    "juri",
                                    juriItem.User.user_id,
                                    juriItem.User.user_name,
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

          {/* Kolom Asisten Juri */}
          <Card className="flex flex-col h-full shadow-sm border-border/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b pb-4 pt-5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <UserCog className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                Team Rekap
              </CardTitle>
              {user?.role !== "juri" &&
                (event.Event_asistens?.length || 0) < 2 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah Asisten
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Asisten Juri ke Event</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Popover
                          open={openAsistenDropdown}
                          onOpenChange={setOpenAsistenDropdown}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openAsistenDropdown}
                              className={cn(
                                "w-full justify-between font-normal h-auto py-2",
                                !selectedAsisten && "text-muted-foreground",
                              )}
                            >
                              <span className="truncate text-left">
                                {selectedAsisten
                                  ? (() => {
                                      const a = availableAsistens.find(
                                        (x) => x.user_id === selectedAsisten,
                                      );
                                      return a
                                        ? `${a.user_name} (${a.user_email})`
                                        : "Pilih asisten...";
                                    })()
                                  : "Pilih asisten..."}
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
                                  placeholder="Cari asisten..."
                                  value={searchAsisten}
                                  onChange={(e) =>
                                    setSearchAsisten(e.target.value)
                                  }
                                  className="h-8"
                                />
                              </div>
                              <div className="max-h-60 overflow-y-auto p-1">
                                {filteredAvailableAsistens.length > 0 ? (
                                  filteredAvailableAsistens.map((asisten) => (
                                    <Button
                                      key={asisten.user_id}
                                      variant="ghost"
                                      className="w-full justify-start font-normal h-auto py-2"
                                      onClick={() => {
                                        setSelectedAsisten(asisten.user_id);
                                        setOpenAsistenDropdown(false);
                                        setSearchAsisten("");
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4 shrink-0 mt-0.5",
                                          selectedAsisten === asisten.user_id
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      <div className="flex flex-col items-start ml-1 overflow-hidden">
                                        <span className="truncate w-full font-medium">
                                          {asisten.user_name}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate w-full">
                                          {asisten.user_email}
                                        </span>
                                      </div>
                                    </Button>
                                  ))
                                ) : (
                                  <div className="py-6 text-center text-sm text-muted-foreground">
                                    {availableAsistens.length === 0
                                      ? "Semua asisten sudah ditugaskan."
                                      : "Asisten tidak ditemukan."}
                                  </div>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => handleAdd("asisten")}
                          disabled={!selectedAsisten}
                        >
                          Simpan
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
            </CardHeader>
            <CardContent className="p-0 overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Asisten</TableHead>
                    <TableHead>Nama Asisten</TableHead>
                    {user?.role !== "juri" && (
                      <TableHead className="text-right">Aksi</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.Event_asistens?.length > 0 ? (
                    event.Event_asistens.map((asistenItem) => (
                      <TableRow key={asistenItem.User.user_id}>
                        <TableCell className="font-mono text-xs">
                          {asistenItem.User.user_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {asistenItem.User.user_name}
                        </TableCell>
                        {user?.role !== "juri" && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive"
                                onClick={() =>
                                  openAlert(
                                    "asisten",
                                    asistenItem.User.user_id,
                                    asistenItem.User.user_name,
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Belum ada asisten juri yang ditugaskan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Kartu Manajemen Aspek */}
          {user?.role !== "juri" && (
            <div className="xl:col-span-2">
            <AspekManagementCard eventId={eventId} onUpdate={fetchData} />
            </div>
          )}

          {/* Kartu Manajemen Penalti */}
          {user?.role !== "juri" && <PenaltyManagementCard eventId={eventId} />}

          {/* Kartu Manajemen Kategori Juara */}
          {user?.role !== "juri" && (
            <KategoriJuaraManagementCard
              eventId={eventId}
              eventAspeks={eventAspeks}
              eventTeams={event.Event_teams}
            />
          )}

          {/* Kartu Manajemen Template Kejuaraan */}
          {user?.role !== "juri" && (
            <Card className="flex flex-col h-full shadow-sm border-border/50 overflow-hidden xl:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b pb-4 pt-5">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Template Penamaan Kejuaraan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">
                    Setiap blok mewakili 3 peringkat (Juara 1, 2, 3). Jika "Beri
                    Nomor" dicentang, sistem akan menambahkan angka 1-3 (misal:
                    UTAMA 1). Kosongkan semua untuk menggunakan standar bawaan.
                    Jika template urutan paling akhir tidak diberi nomor, maka
                    akan otomatis diterapkan ke SEMUA sisa tim.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Input
                      placeholder="Nama Kejuaraan (misal: UTAMA)"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTemplateItem();
                        }
                      }}
                    />
                    <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-background h-10 w-full sm:w-auto shrink-0">
                      <input
                        type="checkbox"
                        id="numbered-checkbox-detail"
                        checked={newTemplateNumbered}
                        onChange={(e) =>
                          setNewTemplateNumbered(e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <Label
                        htmlFor="numbered-checkbox-detail"
                        className="text-sm cursor-pointer whitespace-nowrap"
                      >
                        Beri Nomor (1-3)
                      </Label>
                    </div>
                    <Button
                      onClick={handleAddTemplateItem}
                      className="w-full sm:w-auto shrink-0"
                      variant="secondary"
                    >
                      Tambah
                    </Button>
                  </div>
                </div>

                <div className="flex-1 border rounded-xl bg-muted/5 p-4 max-h-80 overflow-y-auto scrollbar-thin">
                  {kejuaraanTemplate.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {kejuaraanTemplate.map((item, idx) => {
                        const startRank = idx * 3 + 1;
                        const isLastAndUnnumbered =
                          !item.numbered &&
                          idx === kejuaraanTemplate.length - 1;
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
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleRemoveTemplateItem(idx)}
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 h-8 w-8 ml-2"
                              title="Hapus template ini"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                      <Trophy className="h-8 w-8 mb-2 opacity-20" />
                      <p>Menggunakan Template Standar Bawaan</p>
                      <p className="text-xs mt-1">
                        (Peringkat 1: UTAMA 1, dst)
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={isSavingTemplate}
                  >
                    {isSavingTemplate && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Simpan Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section E-Sertifikat */}
          {user?.role !== "juri" && (() => {
            const isLocked = !event.is_result_show && event.event_status !== "archived";
            return (
              <Card className="xl:col-span-2 flex flex-col h-full shadow-sm border-border/50 overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/20 border-b pb-4 pt-5 gap-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    E-Sertifikat Event
                  </CardTitle>
                  {!isLocked && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">Urutkan:</span>
                      <Button
                        size="xs"
                        variant={certSortBy === "no_tampil" ? "default" : "outline"}
                        onClick={() => setCertSortBy("no_tampil")}
                        className="text-xs h-7 py-0 px-2.5"
                      >
                        No. Tampil
                      </Button>
                      <Button
                        size="xs"
                        variant={certSortBy === "peringkat" ? "default" : "outline"}
                        onClick={() => setCertSortBy("peringkat")}
                        className="text-xs h-7 py-0 px-2.5"
                        disabled={!klasemenLoaded}
                      >
                        Peringkat
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className={isLocked ? "p-6" : "p-0 overflow-auto flex-1"}>
                  {isLocked ? (
                    <div className="flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-muted rounded-xl bg-muted/5 max-w-xl mx-auto">
                      <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full mb-4">
                        <Lock className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Pencetakan Sertifikat Terkunci</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        E-Sertifikat hanya dapat dicetak setelah hasil klasemen selesai/dipublikasikan (Tampilkan Klasemen Publik diaktifkan) atau setelah status event diubah menjadi Archived.
                      </p>
                      <Button onClick={handleToggleResultShow} size="sm">
                        Tampilkan Klasemen Publik
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30%]">Nama Tim</TableHead>
                          <TableHead className="w-[30%]">Sekolah / Instansi</TableHead>
                          <TableHead className="w-[20%]">Predikat Sertifikat</TableHead>
                          <TableHead className="text-right w-[20%]">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const sortedEventTeams = [...(event.Event_teams || [])].sort((a, b) => {
                            if (certSortBy === "peringkat") {
                              const rankA = teamRankings[a.team_id] || 9999;
                              const rankB = teamRankings[b.team_id] || 9999;
                              return rankA - rankB;
                            } else {
                              const noA = a.nomor_tampil || 9999;
                              const noB = b.nomor_tampil || 9999;
                              return noA - noB;
                            }
                          });

                          return sortedEventTeams.length > 0 ? (
                            sortedEventTeams.map((eventTeam) => {
                              const { Team, team_id } = eventTeam;
                              const members = teamMembers[team_id] || Team?.Anggota_teams || Team?.Anggota_team || [];
                              const isExpanded = expandedTeamId === team_id;
                              const teamRank = teamRankings[team_id];
                              const nomorTampil = eventTeam.nomor_tampil;

                              return (
                                <Fragment key={team_id}>
                                  <TableRow className="hover:bg-muted/30">
                                    <TableCell className="font-bold">
                                      <div className="flex flex-col">
                                        <span>{Team?.team_name || "-"}</span>
                                        <div className="flex gap-2 mt-1">
                                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground">
                                            No. Tampil: {nomorTampil || "-"}
                                          </Badge>
                                          {teamRank && (
                                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium bg-amber-500/10 text-amber-800 border-amber-500/20">
                                              Peringkat: {teamRank}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>{Team?.team_sekolah_instansi || "-"}</TableCell>
                                    <TableCell>
                                      <Input
                                        value={teamPredikats[team_id] || "PESERTA"}
                                        onChange={(e) =>
                                          setTeamPredikats((prev) => ({
                                            ...prev,
                                            [team_id]: e.target.value,
                                          }))
                                        }
                                        className="h-8 max-w-[200px]"
                                        placeholder="Predikat (Cth: PESERTA)"
                                      />
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setPrintDocTitle(`Sertifikat_${Team.team_name?.replace(/\s+/g, "_")}`);
                                          const cert = {
                                            recipientName: Team.team_name,
                                            instansiName: Team.team_sekolah_instansi,
                                            predikat: teamPredikats[team_id] || "PESERTA",
                                            certificateNo: `SERT/${event.event_id}/${Team.team_id}`,
                                          };
                                          setCertData([cert]);
                                          setIsReadyToPrint(true);
                                        }}
                                      >
                                        Cetak Tim
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleExpandTeam(team_id)}
                                        disabled={loadingMembers[team_id]}
                                      >
                                        {loadingMembers[team_id]
                                          ? "Memuat..."
                                          : isExpanded
                                          ? "Tutup Anggota"
                                          : `Anggota (${members.length})`}
                                      </Button>
                                    </TableCell>
                                  </TableRow>

                                  {isExpanded && (
                                    <TableRow className="bg-muted/10">
                                      <TableCell colSpan={4} className="p-4">
                                        <div className="border rounded-lg bg-background p-4 space-y-4">
                                          {loadingMembers[team_id] ? (
                                            <div className="flex justify-center items-center py-8">
                                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-500 border-t-transparent mr-2"></div>
                                              <span className="text-sm text-muted-foreground">Memuat data anggota...</span>
                                            </div>
                                          ) : (
                                            <>
                                              <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                                                  Daftar Anggota Tim - {Team?.team_name}
                                                </h4>
                                                {members.length > 0 && (
                                                  <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                      setPrintDocTitle(`Sertifikat_Massal_${Team.team_name?.replace(/\s+/g, "_")}`);
                                                      const certs = members.map((m) => ({
                                                        recipientName: m.anggota_nama,
                                                        instansiName: Team.team_sekolah_instansi,
                                                        predikat: teamPredikats[team_id] || "PESERTA",
                                                        certificateNo: `SERT/${event.event_id}/${m.anggota_id}`,
                                                      }));
                                                      setCertData(certs);
                                                      setIsReadyToPrint(true);
                                                    }}
                                                  >
                                                    Cetak Semua Anggota ({members.length})
                                                  </Button>
                                                )}
                                              </div>

                                              {members.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                  {members.map((member) => (
                                                    <div
                                                      key={member.anggota_id}
                                                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                                                    >
                                                      <div className="overflow-hidden mr-2">
                                                        <p className="font-bold text-sm text-foreground truncate" title={member.anggota_nama}>
                                                          {member.anggota_nama}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground capitalize">
                                                          {member.anggota_tipe || "Anggota"}
                                                        </p>
                                                      </div>
                                                      <Button
                                                        size="xs"
                                                        variant="ghost"
                                                        className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer shrink-0"
                                                        onClick={() => {
                                                          setPrintDocTitle(`Sertifikat_${member.anggota_nama?.replace(/\s+/g, "_")}`);
                                                          const cert = {
                                                            recipientName: member.anggota_nama,
                                                            instansiName: Team.team_sekolah_instansi,
                                                            predikat: teamPredikats[team_id] || "PESERTA",
                                                            certificateNo: `SERT/${event.event_id}/${member.anggota_id}`,
                                                          };
                                                          setCertData([cert]);
                                                          setIsReadyToPrint(true);
                                                        }}
                                                      >
                                                        Cetak
                                                      </Button>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : (
                                                <p className="text-sm text-center text-muted-foreground py-4">
                                                  Belum ada anggota terdaftar untuk tim ini.
                                                </p>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </Fragment>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                Belum ada tim peserta terdaftar.
                              </TableCell>
                            </TableRow>
                          );
                        })()}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            );
          })()}
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

      {/* Dialog untuk Mengelola Penalti per Tim */}
      <Dialog
        open={!!selectedTeamForPenalty}
        onOpenChange={(open) => !open && setSelectedTeamForPenalty(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          {selectedTeamForPenalty && (
            <TeamPenaltyManager
              eventId={eventId}
              team={selectedTeamForPenalty}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog untuk Edit Aspek Juri */}
      <Dialog
        open={isEditJuriDialogOpen}
        onOpenChange={setIsEditJuriDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Aspek Penilaian Juri</DialogTitle>
            <DialogDescription>
              Pilih atau kurangi aspek penilaian yang ditugaskan kepada juri
              ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Aspek Penilaian</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {editJuriAspekIds.length > 0
                      ? `${editJuriAspekIds.length} aspek dipilih`
                      : "Pilih Aspek Penilaian..."}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 max-h-60 overflow-y-auto"
                  align="start"
                >
                  {eventAspeks.length > 0 && (
                    <>
                      <DropdownMenuCheckboxItem
                        checked={editJuriAspekIds.length === eventAspeks.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditJuriAspekIds(
                              eventAspeks.map((a) => a.aspek_id),
                            );
                          } else {
                            setEditJuriAspekIds([]);
                          }
                        }}
                        className="font-bold"
                      >
                        Pilih Semua
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {eventAspeks.map((aspek) => (
                    <DropdownMenuCheckboxItem
                      key={aspek.aspek_id}
                      checked={editJuriAspekIds.includes(aspek.aspek_id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditJuriAspekIds((prev) => [
                            ...prev,
                            aspek.aspek_id,
                          ]);
                        } else {
                          setEditJuriAspekIds((prev) =>
                            prev.filter((id) => id !== aspek.aspek_id),
                          );
                        }
                      }}
                    >
                      {aspek.nama_aspek}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditJuriDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateJuri}
              disabled={editJuriAspekIds.length === 0}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail Tim (Anggota & Foto) */}
      <Dialog
        open={!!selectedTeamDetails}
        onOpenChange={(open) => !open && setSelectedTeamDetails(null)}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
          {selectedTeamDetails && (
            <>
              <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/10 shrink-0">
                <DialogTitle className="flex items-center gap-4 w-full pr-6">
                  <div className="relative group w-12 h-12 shrink-0 bg-white rounded-full border shadow-sm flex items-center justify-center p-1 overflow-hidden">
                    <Image
                      src={
                        selectedTeamDetails.team_logo
                          ? `${process.env.NEXT_PUBLIC_API_URL}${selectedTeamDetails.team_logo}`
                          : "/default-logo.png"
                      }
                      alt="Logo"
                      width={48}
                      height={48}
                      className="object-contain w-full h-full"
                    />
                    {selectedTeamDetails.team_logo && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}${selectedTeamDetails.team_logo}`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col items-center justify-center text-white cursor-pointer transition-colors"
                        title="Download Logo"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-1 flex-1">
                    <span className="text-xl font-bold tracking-tight">
                      {selectedTeamDetails.team_name}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-primary/70" />
                      {selectedTeamDetails.team_sekolah_instansi}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        No. Tampil
                      </span>
                      <span className="text-lg font-black text-primary leading-none mt-1">
                        {selectedTeamDetails.nomor_tampil || "-"}
                      </span>
                    </div>
                    {user?.role !== "koordinator_event" && (
                      <>
                        <div className="w-px h-8 bg-border"></div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            E-Voting
                          </span>
                          <span className="text-lg font-black text-green-600 dark:text-green-400 leading-none mt-1">
                            Rp{" "}
                            {(
                              Number(selectedTeamDetails.balance) || 0
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Bagian Kiri: Foto Tim */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-bold flex items-center gap-2 text-foreground">
                          <Users className="w-4 h-4 text-primary" /> Foto
                          Keseluruhan Tim
                        </h4>
                        {selectedTeamDetails.foto_all_team && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-7 text-xs px-2"
                          >
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL}${selectedTeamDetails.foto_all_team}`}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="w-3 h-3 mr-1.5" /> Download
                            </a>
                          </Button>
                        )}
                      </div>
                      {selectedTeamDetails.foto_all_team ? (
                        <div className="w-full rounded-xl overflow-hidden border shadow-sm bg-white/50 dark:bg-gray-900 group relative">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}${selectedTeamDetails.foto_all_team}`}
                            alt={`Foto Tim ${selectedTeamDetails.team_name}`}
                            width={800}
                            height={600}
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground py-12 border rounded-xl bg-muted/20 border-dashed">
                          <Users className="h-10 w-10 mb-3 opacity-30" />
                          <p className="text-sm font-medium">
                            Belum ada foto tim
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Dokumen Rekomendasi Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-bold flex items-center gap-2 text-foreground">
                          <FileText className="w-4 h-4 text-primary" /> Surat
                          Rekomendasi
                        </h4>
                        {selectedTeamDetails.surat_rekomendasi && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-7 text-xs px-2"
                          >
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL}${selectedTeamDetails.surat_rekomendasi}`}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="w-3 h-3 mr-1.5" /> Download
                            </a>
                          </Button>
                        )}
                      </div>
                      {selectedTeamDetails.surat_rekomendasi ? (
                        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                          <FileText className="w-8 h-8 text-primary shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              Dokumen Tersedia
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Klik tombol download untuk mengunduh berkas.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground py-8 border rounded-xl bg-muted/20 border-dashed">
                          <FileText className="h-8 w-8 mb-3 opacity-30" />
                          <p className="text-sm font-medium">
                            Belum ada surat rekomendasi
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bagian Kanan: Daftar Anggota */}
                  <div className="lg:col-span-3 space-y-6">
                    {(() => {
                      const anggotaList =
                        selectedTeamDetails.Anggota_teams ||
                        selectedTeamDetails.Anggota_team ||
                        [];
                      const pelatihDanton = anggotaList.filter(
                        (a) =>
                          a.anggota_tipe === "pelatih" ||
                          a.anggota_tipe === "danton",
                      );
                      const anggotaPasukan = anggotaList.filter(
                        (a) =>
                          a.anggota_tipe === "anggota pasukan" ||
                          a.anggota_tipe === "anggota cadangan",
                      );

                      return (
                        <>
                          {/* Pelatih & Danton Section */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b pb-2">
                              <h4 className="font-bold flex items-center gap-2 text-foreground">
                                <ShieldCheck className="w-4 h-4 text-primary" />{" "}
                                Pelatih & Danton
                              </h4>
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary"
                              >
                                {pelatihDanton.length} Orang
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {pelatihDanton.length > 0 ? (
                                pelatihDanton.map((anggota) => (
                                  <div
                                    key={anggota.anggota_id}
                                    className="flex items-center gap-3 p-3 bg-muted/10 rounded-xl border border-border/50 hover:border-primary/30 transition-colors shadow-sm"
                                  >
                                    <div className="w-11 h-11 shrink-0 rounded-full overflow-hidden border shadow-sm bg-muted flex items-center justify-center">
                                      {anggota.anggota_foto ? (
                                        <Image
                                          src={`${process.env.NEXT_PUBLIC_API_URL}${anggota.anggota_foto}`}
                                          alt={anggota.anggota_nama}
                                          width={44}
                                          height={44}
                                          className="object-cover w-full h-full"
                                        />
                                      ) : (
                                        <UserCircle className="w-6 h-6 text-muted-foreground opacity-50" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <p
                                        className="font-bold text-sm truncate text-foreground leading-tight mb-0.5"
                                        title={anggota.anggota_nama}
                                      >
                                        {anggota.anggota_nama}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className="w-fit text-[9px] px-1.5 py-0 uppercase tracking-wider bg-background text-muted-foreground"
                                      >
                                        {anggota.anggota_tipe}
                                      </Badge>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-6 border rounded-xl bg-muted/10 border-dashed">
                                  <UserCircle className="h-8 w-8 mb-2 opacity-30" />
                                  <p className="text-sm">
                                    Belum ada pelatih / danton
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Anggota Pasukan Section */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b pb-2">
                              <h4 className="font-bold flex items-center gap-2 text-foreground">
                                <UserCircle className="w-4 h-4 text-primary" />{" "}
                                Anggota Pasukan & Cadangan
                              </h4>
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary"
                              >
                                {anggotaPasukan.length} /{" "}
                                {selectedTeamDetails.team_jumlah_anggota}{" "}
                                Anggota
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {anggotaPasukan.length > 0 ? (
                                anggotaPasukan.map((anggota) => (
                                  <div
                                    key={anggota.anggota_id}
                                    className="flex items-center gap-3 p-3 bg-muted/10 rounded-xl border border-border/50 hover:border-primary/30 transition-colors shadow-sm"
                                  >
                                    <div className="w-11 h-11 shrink-0 rounded-full overflow-hidden border shadow-sm bg-muted flex items-center justify-center">
                                      {anggota.anggota_foto ? (
                                        <Image
                                          src={`${process.env.NEXT_PUBLIC_API_URL}${anggota.anggota_foto}`}
                                          alt={anggota.anggota_nama}
                                          width={44}
                                          height={44}
                                          className="object-cover w-full h-full"
                                        />
                                      ) : (
                                        <UserCircle className="w-6 h-6 text-muted-foreground opacity-50" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <p
                                        className="font-bold text-sm truncate text-foreground leading-tight mb-0.5"
                                        title={anggota.anggota_nama}
                                      >
                                        {anggota.anggota_nama}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className="w-fit text-[9px] px-1.5 py-0 uppercase tracking-wider bg-background text-muted-foreground"
                                      >
                                        {anggota.anggota_tipe}
                                      </Badge>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-6 border rounded-xl bg-muted/10 border-dashed">
                                  <UserCircle className="h-8 w-8 mb-2 opacity-30" />
                                  <p className="text-sm">
                                    Belum ada anggota terdaftar
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
