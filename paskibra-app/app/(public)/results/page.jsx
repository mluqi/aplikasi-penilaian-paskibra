"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Trophy,
  Award,
  Medal,
  Crown,
  Loader2,
  Heart,
  Medal as MedalIcon,
  Sparkles,
  Calendar,
  MapPin,
  ChevronRight,
  SearchX,
  Search,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ---------------------------------------------------------------------- */
/*  Rank helpers — one source of truth used by the podium, the tables,    */
/*  and the mobile cards so rank 1/2/3 always look the same everywhere.   */
/* ---------------------------------------------------------------------- */

const RANK_META = [
  {
    icon: Crown,
    badge:
      "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg shadow-yellow-400/30",
    solid: "bg-gradient-to-t from-yellow-500 to-yellow-400",
    ring: "ring-yellow-400",
    label: "text-yellow-600 dark:text-yellow-400",
  },
  {
    icon: Medal,
    badge:
      "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 shadow-lg shadow-slate-400/30",
    solid: "bg-gradient-to-t from-slate-400 to-slate-300",
    ring: "ring-slate-300",
    label: "text-slate-500 dark:text-slate-300",
  },
  {
    icon: Award,
    badge:
      "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30",
    solid: "bg-gradient-to-t from-amber-600 to-amber-500",
    ring: "ring-amber-500",
    label: "text-amber-700 dark:text-amber-500",
  },
];

const getRankIcon = (index) => {
  const meta = RANK_META[index];
  if (!meta) return null;
  const Icon = meta.icon;
  return <Icon className="h-6 w-6" />;
};

const getRankBadgeColor = (index) =>
  RANK_META[index]?.badge ||
  "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";

// Helper untuk menggenerate penamaan kejuaraan standar Paskibra berdasarkan peringkat
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
    }
    return templateItem.name;
  }
  if (activeTemplate.length > 0) {
    const lastItem = activeTemplate[activeTemplate.length - 1];
    if (!lastItem.numbered) return lastItem.name;
  }
  return "-";
};

// Satu fungsi untuk membaca field tim, baik dari bentuk klasemen ({team_name})
// maupun e-voting ({Team: {team_name}}) — supaya podium, tabel, dan kartu
// mobile semuanya membaca data dengan cara yang sama persis.
const getTeamInfo = (item) => ({
  id: item.team_id || item.Team?.team_id,
  name: item.team_name || item.Team?.team_name || "-",
  sekolah: item.team_sekolah_instansi || item.Team?.team_sekolah_instansi || "-",
  logo: item.team_logo || item.Team?.team_logo,
});

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const truncateText = (text = "", maxLength = 24) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

/* ---------------------------------------------------------------------- */
/*  Small presentational pieces                                           */
/* ---------------------------------------------------------------------- */

function TeamAvatar({ name, logo, size = 36, ring = false, rank }) {
  return (
    <div className="relative flex-shrink-0">
      {logo ? (
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}${logo}`}
          alt={`${name} Logo`}
          width={size}
          height={size}
          className={`rounded-full bg-white object-cover ${
            ring ? "ring-4 ring-white dark:ring-gray-900 shadow-lg" : "ring-1 ring-gray-200 dark:ring-gray-700"
          }`}
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-gray-100 font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          style={{ width: size, height: size, fontSize: size * 0.34 }}
        >
          {getInitials(name)}
        </div>
      )}
      {typeof rank === "number" && rank < 3 && (
        <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
          <span className={RANK_META[rank]?.label}>{getRankIcon(rank)}</span>
        </div>
      )}
    </div>
  );
}

function KejuaraanBadge({ children }) {
  if (!children || children === "-") return <span className="text-gray-400">—</span>;
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-red-50 px-3 py-1 text-xs font-black tracking-wide text-red-700 ring-1 ring-inset ring-red-100 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-900">
      {children}
    </span>
  );
}

function RankBadge({ index, rank }) {
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getRankBadgeColor(index)}`}>
      {rank ?? index + 1}
    </div>
  );
}

/* ---------- Podium: the celebratory top-3 spotlight ---------- */

function Podium({ entries }) {
  if (!entries.length) return null;
  // Center layout: 2nd — 1st — 3rd (or adapted if < 3)
  const ordered =
    entries.length === 1
      ? [entries[0]]
      : entries.length === 2
        ? [entries[1], entries[0]]
        : [entries[1], entries[0], entries[2]].filter(Boolean);
  const heightFor = (rank) =>
    rank === 1 ? "h-24 md:h-32" : rank === 2 ? "h-16 md:h-24" : "h-12 md:h-16";

  const title =
    entries.length === 1
      ? "Juara Kategori"
      : entries.length === 2
        ? "Dua Besar"
        : "Tiga Besar";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {title}
        </h3>
      </div>
      <div className="flex items-end justify-center gap-3 md:gap-8">
        {ordered.map((entry) => {
          const idx = entry.rank - 1;
          const meta = RANK_META[idx] || RANK_META[2];
          return (
            <div key={entry.id} className="flex w-24 flex-col items-center md:w-40">
              <TeamAvatar
                name={entry.name}
                logo={entry.logo}
                size={entry.rank === 1 ? 72 : 56}
                ring
                rank={idx}
              />
              <p className="mt-3 line-clamp-1 text-center text-sm font-bold text-gray-900 dark:text-white">
                {entry.name}
              </p>
              <p className="line-clamp-1 text-center text-xs text-gray-500 dark:text-gray-400">
                {entry.sekolah}
              </p>
              {entry.kejuaraan && (
                <div className="mt-2">
                  <KejuaraanBadge>{entry.kejuaraan}</KejuaraanBadge>
                </div>
              )}
              <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                {entry.valueDisplay}
              </p>
              <div
                className={`mt-3 flex w-full items-start justify-center rounded-t-xl pt-2 ${heightFor(
                  entry.rank,
                )} ${meta.solid}`}
              >
                <span className="text-lg font-black text-white md:text-2xl">{entry.rank}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Category pill tabs (replaces the old dropdown) ---------- */

function CategoryTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {tabs.map((kat) => {
        const active = kat.id === activeTab;
        return (
          <button
            key={kat.id}
            type="button"
            onClick={() => onChange(kat.id)}
            aria-pressed={active}
            className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
              active
                ? "bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {kat.id === "e-voting" ? (
              <Heart className={`h-4 w-4 ${active ? "" : "text-pink-500"}`} />
            ) : kat.jenis_juara === "juara_umum" || kat.is_juara_umum ? (
              <Trophy className={`h-4 w-4 ${active ? "" : "text-yellow-500"}`} />
            ) : (
              <MedalIcon className={`h-4 w-4 ${active ? "" : "text-gray-400"}`} />
            )}
            {kat.nama_kategori.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Loading / empty states ---------- */

function PageLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="mb-3 h-8 w-8 animate-spin text-red-600" />
      <p className="text-sm font-medium text-muted-foreground">Menyiapkan data klasemen…</p>
    </div>
  );
}

function EmptyResultsState({ onPickAnother }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-5 rounded-full bg-red-50 p-4 dark:bg-red-950/30">
        <Trophy className="h-10 w-10 text-red-400" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        Hasil belum dipublikasikan
      </h2>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Panitia belum mempublikasikan klasemen atau E-Voting untuk event ini. Coba lagi nanti,
        atau lihat event lain di bawah.
      </p>
      <Button variant="outline" onClick={onPickAnother}>
        Pilih Event Lain
      </Button>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 p-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-2 w-1/4 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

function JuaraUmumBanner({ team }) {
  const info = getTeamInfo(team);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-6 text-white shadow-lg shadow-yellow-500/20 md:p-8">
      <Trophy className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-white/10" />
      <div className="relative flex items-center gap-4">
        {info.logo ? (
          <div className="relative flex-shrink-0">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${info.logo}`}
              alt={info.name}
              width={64}
              height={64}
              className="rounded-full bg-white object-cover ring-4 ring-white/30 shadow-md"
            />
          </div>
        ) : (
          <div className="rounded-full bg-white/20 p-3 backdrop-blur">
            <Trophy className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
        )}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-50">Juara Umum</p>
          <p className="text-xl font-black md:text-3xl">{info.name}</p>
          {info.sekolah !== "-" && <p className="text-sm text-yellow-50/90">{info.sekolah}</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Event picker: hero search + browsable event cards ---------- */

const formatEventDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

function EventSelect({
  eventList = [],
  selectedEventId,
  onSelect,
  placeholder = "Cari & pilih event lomba...",
  size = "lg",
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);

  const selectedEvent = useMemo(
    () => eventList.find((e) => e.event_id === selectedEventId),
    [eventList, selectedEventId],
  );

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return eventList;
    const q = searchQuery.toLowerCase();
    return eventList.filter(
      (e) =>
        e.event_name?.toLowerCase().includes(q) ||
        e.event_kota?.toLowerCase().includes(q) ||
        e.event_tempat?.toLowerCase().includes(q) ||
        (e.event_tanggal &&
          formatEventDate(e.event_tanggal).toLowerCase().includes(q)),
    );
  }, [eventList, searchQuery]);

  const sizeClasses =
    size === "lg"
      ? "h-14 rounded-2xl px-4 text-base"
      : "h-11 rounded-xl px-3.5 text-sm";
  const iconSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  // Auto-focus input pencarian saat dropdown dibuka
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={`group flex w-full items-center justify-between gap-3 border border-gray-200 bg-white font-medium text-gray-800 shadow-sm transition-all hover:border-red-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-red-900 dark:focus:ring-offset-gray-950 ${sizeClasses}`}
        >
          <div className="flex items-center gap-3 overflow-hidden text-left">
            <Search
              className={`shrink-0 text-gray-400 transition-colors group-hover:text-red-500 ${open ? "text-red-500" : ""} ${iconSize}`}
            />
            {selectedEvent ? (
              <span className="truncate font-semibold text-gray-900 dark:text-white">
                {selectedEvent.event_name}
              </span>
            ) : (
              <span className="truncate text-gray-400">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {selectedEventId && (
              <span
                role="button"
                tabIndex={0}
                title="Hapus pilihan"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onSelect("");
                  }
                }}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 text-gray-400 shrink-0" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] min-w-[320px] max-w-[540px] p-0 shadow-2xl rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 z-50 overflow-hidden"
      >
        {/* Input Pencarian (Select2 Search Box) */}
        <div className="relative flex items-center border-b border-gray-100 dark:border-gray-800 px-3.5 py-2.5 bg-gray-50/50 dark:bg-gray-900/50">
          <Search className="h-4 w-4 shrink-0 text-gray-400 mr-2.5" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
            placeholder="Ketik nama event, kota, atau tanggal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Opsi Event */}
        <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <SearchX className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tidak ada event yang cocok dengan pencarian
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                Bersihkan pencarian
              </button>
            </div>
          ) : (
            filteredEvents.map((e) => {
              const isSelected = e.event_id === selectedEventId;
              return (
                <button
                  key={e.event_id}
                  type="button"
                  onClick={() => {
                    onSelect(e.event_id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group ${
                    isSelected
                      ? "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-300 font-semibold"
                      : "hover:bg-gray-100/80 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  <div className="flex flex-col gap-0.5 overflow-hidden pr-2">
                    <span className="text-sm font-bold truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {e.event_name}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {formatEventDate(e.event_tanggal)}
                      </span>
                      {e.event_kota && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {e.event_kota}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EventCard({ event, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(event.event_id)}
      className="group flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-red-900"
    >
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
        <Trophy className="h-3.5 w-3.5" />
        Lihat Hasil
      </div>
      <h3 className="line-clamp-2 text-base font-bold text-gray-900 dark:text-white">
        {event.event_name}
      </h3>
      <div className="mt-auto flex flex-col gap-1.5 pt-1 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{formatEventDate(event.event_tanggal)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{event.event_kota}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-red-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-red-400">
        Lihat Klasemen
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function EventGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      ))}
    </div>
  );
}

function EventListEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-5 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <SearchX className="h-10 w-10 text-gray-400" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Belum ada event</h2>
      <p className="max-w-sm text-muted-foreground">
        Belum ada event yang dipublikasikan saat ini. Cek kembali halaman ini nanti.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Main page                                                              */
/* ---------------------------------------------------------------------- */

export default function EventResultsPage() {
  const router = useRouter();

  const [eventList, setEventList] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [event, setEvent] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const [kategoriRekap, setKategoriRekap] = useState({
    klasemen: [],
    aspeks: [],
    kurangi_penalty: false,
  });
  const [eVotingRekap, setEVotingRekap] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);

  const nomorTampilMap = useMemo(() => {
    if (!event?.Event_teams) return new Map();
    return new Map(
      event.Event_teams.map((et) => [et.team_id || et.Team?.team_id, et.nomor_tampil]),
    );
  }, [event]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/events/public?limit=100`).then((r) => r.json());
        if (res.events) setEventList(res.events);
      } catch (err) {
        console.error("Gagal memuat daftar event", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setEvent(null);
      setKategoriList([]);
      setActiveTab(null);
      setEVotingRekap([]);
      return;
    }

    const fetchInitialData = async () => {
      setLoadingData(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        const [eventRes, kategoriRes] = await Promise.all([
          fetch(`${apiUrl}/api/events/public/${selectedEventId}?type=evoting`).then((r) =>
            r.json(),
          ),
          fetch(`${apiUrl}/api/rekap/public/kategori/${selectedEventId}`).then((r) => r.json()),
        ]);

        if (eventRes.event) setEvent(eventRes.event);

        let firstTab = null;
        let sortedKategori = [];
        if (kategoriRes.data && kategoriRes.data.length > 0) {
          sortedKategori = [...kategoriRes.data].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
          setKategoriList(sortedKategori);
        } else {
          setKategoriList([]);
        }

        if (eventRes.event?.is_result_show && sortedKategori.length > 0) {
          firstTab = sortedKategori[0].id;
        } else if (eventRes.event?.xenplatform_id) {
          firstTab = "e-voting";
        }

        if (firstTab) {
          await handleTabChange(firstTab, selectedEventId);
        } else {
          setActiveTab(null);
        }
        setLoadingData(false);
      } catch (error) {
        console.error("Gagal memuat data klasemen:", error);
        setLoadingData(false);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  const handleTabChange = async (tabId, currentEventId = selectedEventId) => {
    setActiveTab(tabId);
    setLoadingTab(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (tabId === "e-voting") {
        const res = await fetch(`${apiUrl}/api/rekap/public/${currentEventId}?type=evoting`).then(
          (r) => r.json(),
        );
        if (res.donasi) {
          setEVotingRekap(res.donasi);
          setKategoriRekap({ klasemen: [], aspeks: [], kurangi_penalty: false });
        }
      } else {
        const res = await fetch(`${apiUrl}/api/rekap/public/klasemen/${tabId}`).then((r) =>
          r.json(),
        );
        if (res.klasemen) {
          const katObj = kategoriList.find((k) => k.id === tabId);
          setKategoriRekap({
            klasemen: res.klasemen,
            aspeks: res.aspeks || [],
            kurangi_penalty: res.kurangi_penalty || false,
            limit_juara:
              res.limit_juara !== undefined
                ? res.limit_juara
                : katObj?.limit_juara ?? null,
          });
          setEVotingRekap([]);
        }
      }
    } catch (error) {
      console.error("Gagal memuat kategori:", error);
    } finally {
      setLoadingTab(false);
    }
  };

  const allTabs = [];
  if (event?.is_result_show && kategoriList.length > 0) {
    allTabs.push(...kategoriList);
  }
  if (event?.xenplatform_id) {
    allTabs.push({ id: "e-voting", nama_kategori: "E-Voting", is_juara_umum: false });
  }

  const activeKategoriObj = kategoriList.find((k) => k.id === activeTab);
  const isJuaraUmum =
    activeKategoriObj?.jenis_juara === "juara_umum" ||
    activeKategoriObj?.is_juara_umum ||
    kategoriRekap.is_juara_umum;
  const isEvoting = activeTab === "e-voting";
  const juaraUmum = isJuaraUmum && kategoriRekap.klasemen.length > 0 ? kategoriRekap.klasemen[0] : null;

  // Normalized podium entries — same shape whether the source is klasemen or e-voting.
  const podiumEntries = useMemo(() => {
    const source = isEvoting ? eVotingRekap : kategoriRekap.klasemen;
    const limitJuara =
      !isEvoting && kategoriRekap.limit_juara
        ? parseInt(kategoriRekap.limit_juara, 10)
        : null;
    const count = limitJuara ? Math.min(3, limitJuara) : 3;

    return source.slice(0, count).map((item, index) => {
      const info = getTeamInfo(item);
      const rank = index + 1;
      if (isEvoting) {
        const points = Math.floor((item.balance || 0) / 1000);
        return {
          ...info,
          rank,
          kejuaraan: null,
          valueDisplay: `${points.toLocaleString("id-ID")} Poin`,
        };
      }
      const finalScore = item.nilai_akhir ?? item.total ?? 0;
      const isWithinLimit = !limitJuara || rank <= limitJuara;
      const isGlobal =
        activeKategoriObj?.jenis_juara === "juara_peringkat" ||
        kategoriRekap.jenis_juara === "juara_peringkat" ||
        kategoriRekap.tipe_penilaian === "global" ||
        activeKategoriObj?.tipe_penilaian === "global";
      return {
        ...info,
        rank,
        kejuaraan: isJuaraUmum
          ? null
          : isWithinLimit
            ? isGlobal
              ? getKejuaraanTitle(item.rank || rank, event?.kejuaraan_template)
              : `${activeKategoriObj?.nama_kategori || "Kategori"} Terbaik ${item.rank || rank}`
            : "-",
        valueDisplay: `${parseInt(finalScore, 10) || 0} Nilai`,
      };
    });
  }, [isEvoting, isJuaraUmum, activeKategoriObj, eVotingRekap, kategoriRekap.klasemen, kategoriRekap.limit_juara, kategoriRekap.tipe_penilaian, kategoriRekap.jenis_juara, event]);

  const handleSelectEvent = (id) => {
    setSelectedEventId(id);
    setShowAllEvents(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <main className="flex-grow">
        <PageHeader
          breadcrumb="Hasil Lomba"
          title="Hasil Akhir & Klasemen Lomba"
          subtitle="Pilih event di bawah ini untuk melihat rekapitulasi penilaian, hasil akhir klasemen, dan peringkat E-Voting secara transparan."
        />

        {!selectedEventId ? (
          // ---------- Landing: belum ada event dipilih ----------
          <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">
            {loadingEvents ? (
              <>
                <div className="mx-auto mb-8 h-14 max-w-md animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                <EventGridSkeleton />
              </>
            ) : eventList.length === 0 ? (
              <EventListEmptyState />
            ) : (
              <>
                <div className="mx-auto mb-8 max-w-md">
                  <EventSelect
                    eventList={eventList}
                    selectedEventId={selectedEventId}
                    onSelect={handleSelectEvent}
                    placeholder="Cari nama event lomba..."
                  />
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {eventList.length} Event Tersedia
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(showAllEvents ? eventList : eventList.slice(0, 9)).map((e) => (
                    <EventCard key={e.event_id} event={e} onSelect={handleSelectEvent} />
                  ))}
                </div>

                {!showAllEvents && eventList.length > 9 && (
                  <div className="mt-6 flex justify-center">
                    <Button variant="outline" onClick={() => setShowAllEvents(true)}>
                      Tampilkan Semua Event ({eventList.length})
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // ---------- Event terpilih: tampilkan switcher ringkas ----------
          <div className="relative z-10 mx-auto max-w-md px-4 py-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Ganti Event
            </p>
            <EventSelect
              eventList={eventList}
              selectedEventId={selectedEventId}
              onSelect={handleSelectEvent}
              placeholder="-- Pilih Event Lomba --"
              className="h-11 text-sm"
            />
          </div>
        )}

        {selectedEventId && (
          <section className="pb-16 pt-8">
            {loadingData ? (
              <PageLoadingState />
            ) : allTabs.length === 0 ? (
              <EmptyResultsState
                onPickAnother={() => {
                  setSelectedEventId("");
                  setShowAllEvents(false);
                }}
              />
            ) : (
              <div className="container mx-auto px-4">
                <div className="mx-auto max-w-6xl space-y-6">
                  {/* Judul event + tab kategori */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {event.event_name}
                    </h2>
                    <CategoryTabs tabs={allTabs} activeTab={activeTab} onChange={handleTabChange} />
                  </div>

                  {loadingTab ? (
                    <TableSkeleton />
                  ) : (
                    <>
                      <Podium entries={podiumEntries} />

                      {isJuaraUmum && juaraUmum && <JuaraUmumBanner team={juaraUmum} />}

                      <Card className="overflow-hidden border-0 bg-white shadow-xl shadow-gray-200/50 dark:bg-gray-800/50 dark:shadow-none">
                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white pb-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
                          <CardTitle className="flex items-center gap-3 text-xl font-bold">
                            <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
                              <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            {isEvoting
                              ? "Klasemen E-Voting"
                              : `${isJuaraUmum ? "Klasemen Utama" : "Klasemen Akhir"} - ${activeKategoriObj?.nama_kategori}`}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="p-0">
                          {isEvoting ? (
                            <EvotingTable
                              data={eVotingRekap}
                              nomorTampilMap={nomorTampilMap}
                            />
                          ) : (
                            <KategoriTable
                              data={kategoriRekap.klasemen}
                              aspeks={kategoriRekap.aspeks}
                              showPenalty={kategoriRekap.kurangi_penalty || isJuaraUmum}
                              isJuaraUmum={isJuaraUmum}
                              tipePenilaian={
                                kategoriRekap.tipe_penilaian ??
                                activeKategoriObj?.tipe_penilaian
                              }
                              jenisJuara={
                                kategoriRekap.jenis_juara ??
                                activeKategoriObj?.jenis_juara
                              }
                              namaKategori={activeKategoriObj?.nama_kategori}
                              nomorTampilMap={nomorTampilMap}
                              kejuaraanTemplate={event.kejuaraan_template}
                              limitJuara={
                                kategoriRekap.limit_juara ??
                                activeKategoriObj?.limit_juara
                              }
                            />
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  EVoting ranking table                                                 */
/* ---------------------------------------------------------------------- */

function EvotingTable({ data, nomorTampilMap }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
        <Vote className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p>Belum ada data E-Voting.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden w-full overflow-x-auto pb-1 md:block">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/50">
              <TableHead className="w-16 text-center font-bold text-gray-900 dark:text-gray-100">
                NO.
              </TableHead>
              <TableHead className="min-w-[200px] font-bold text-gray-900 dark:text-gray-100">
                NAMA SEKOLAH / TIM
              </TableHead>
              <TableHead className="whitespace-nowrap text-center font-bold text-gray-900 dark:text-gray-100">
                NO TAMPIL
              </TableHead>
              <TableHead className="text-center font-bold text-gray-900 dark:text-gray-100">
                JUMLAH POIN VOTE
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const rank = item.rank || index + 1;
              const info = getTeamInfo(item);
              const points = Math.floor(
                (Number(item.balance) || Number(item.points) || 0) /
                  (item.points !== undefined && !item.balance ? 1 : 1000),
              );
              const nomorTampil =
                item.nomor_tampil !== undefined && item.nomor_tampil !== null
                  ? item.nomor_tampil
                  : nomorTampilMap?.get(info.id || item.team_id);
              const displayNomor = nomorTampil ? String(nomorTampil).padStart(2, "0") : "-";

              return (
                <TableRow
                  key={info.id || item.team_id || index}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    index % 2 === 1 ? "bg-gray-50/40 dark:bg-gray-900/20" : ""
                  }`}
                >
                  <TableCell className="bg-gray-50/50 py-4 text-center dark:bg-gray-800/30">
                    <RankBadge index={index} rank={rank} />
                  </TableCell>
                  <TableCell className="font-bold text-gray-800 dark:text-gray-200">
                    <div className="flex items-center gap-3">
                      <TeamAvatar name={info.name} logo={info.logo} size={32} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{info.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{info.sekolah}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-base font-bold text-gray-700 dark:text-gray-300">
                    {displayNomor}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-lg font-black text-green-600 dark:text-green-400">
                      {points.toLocaleString("id-ID")} Poin
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-gray-100 p-2 dark:divide-gray-800 md:hidden">
        {data.map((item, index) => {
          const rank = item.rank || index + 1;
          const info = getTeamInfo(item);
          const points = Math.floor(
            (Number(item.balance) || Number(item.points) || 0) /
              (item.points !== undefined && !item.balance ? 1 : 1000),
          );
          const nomorTampil =
            item.nomor_tampil !== undefined && item.nomor_tampil !== null
              ? item.nomor_tampil
              : nomorTampilMap?.get(info.id || item.team_id);
          const displayNomor = nomorTampil ? String(nomorTampil).padStart(2, "0") : "-";

          return (
            <div
              key={info.id || item.team_id || index}
              className="flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-3">
                <RankBadge index={index} rank={rank} />
                <div className="flex items-center gap-2">
                  <TeamAvatar name={info.name} logo={info.logo} size={28} />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{info.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{info.sekolah}</p>
                    <p className="mt-0.5 font-mono text-[11px] font-semibold text-gray-400">No: {displayNomor}</p>
                  </div>
                </div>
              </div>
              <div className="ml-2 shrink-0 text-right">
                <p className="text-base font-black text-green-600 dark:text-green-400">
                  {points.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Poin</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------- */
/*  Kategori / Juara Umum table (desktop table + mobile accordion)        */
/* ---------------------------------------------------------------------- */

function KategoriTable({
  data,
  aspeks,
  showPenalty,
  isJuaraUmum,
  tipePenilaian,
  jenisJuara,
  namaKategori,
  nomorTampilMap,
  kejuaraanTemplate,
  limitJuara,
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
        <Trophy className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p>{isJuaraUmum ? "Hasil rekapitulasi belum tersedia." : "Data klasemen belum tersedia untuk kategori ini."}</p>
      </div>
    );
  }

  const parsedLimit = limitJuara ? parseInt(limitJuara, 10) : null;
  const isGlobal = jenisJuara === "juara_peringkat" || tipePenilaian === "global";

  return (
    <>
      {/* Desktop */}
      <div className="hidden w-full overflow-x-auto pb-1 md:block">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/50">
              <TableHead className="w-16 text-center font-bold text-gray-900 dark:text-gray-100">
                NO.
              </TableHead>
              {isJuaraUmum && (
                <TableHead className="font-bold text-gray-900 dark:text-gray-100 min-w-[200px]">
                  NAMA SEKOLAH / TIM
                </TableHead>
              )}
              <TableHead className="whitespace-nowrap text-center font-bold text-gray-900 dark:text-gray-100">
                NO TAMPIL
              </TableHead>
              {!isJuaraUmum && (
                <TableHead className="min-w-[200px] font-bold text-gray-900 dark:text-gray-100">
                  NAMA SEKOLAH / TIM
                </TableHead>
              )}
              {aspeks?.map((aspekName) => (
                <TableHead
                  key={aspekName}
                  className="whitespace-nowrap text-center font-bold text-gray-900 dark:text-gray-100"
                >
                  NILAI {aspekName.toUpperCase()}
                </TableHead>
              ))}
              {showPenalty && (
                <TableHead className="text-center font-bold text-red-600 dark:text-red-400">
                  PENALTY
                </TableHead>
              )}
              <TableHead className="text-center font-bold text-gray-900 dark:text-gray-100">
                {isJuaraUmum ? "JUMLAH" : "TOTAL NILAI"}
              </TableHead>
              {!isJuaraUmum && (
                <TableHead className="bg-gray-100/50 text-center font-bold text-gray-900 dark:bg-gray-800/50 dark:text-gray-100">
                  KEJUARAAN
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const rank = item.rank || index + 1;
              const info = getTeamInfo(item);
              const nomorTampil = nomorTampilMap.get(item.team_id);
              const displayNomor = nomorTampil ? String(nomorTampil).padStart(2, "0") : "-";
              const isWithinLimit = !parsedLimit || rank <= parsedLimit;
              const kejuaraan = isWithinLimit
                ? isGlobal
                  ? getKejuaraanTitle(rank, kejuaraanTemplate)
                  : `${namaKategori || "Kategori"} Terbaik ${rank}`
                : "-";
              const finalScore = item.nilai_akhir ?? item.total ?? 0;
              const penalty = item.penalty?.total_pengurangan > 0 ? item.penalty.total_pengurangan : 0;

              return (
                <TableRow
                  key={item.team_id}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    index % 2 === 1 ? "bg-gray-50/40 dark:bg-gray-900/20" : ""
                  } ${index < 3 ? "bg-gradient-to-r from-yellow-50/50 via-transparent to-transparent dark:from-yellow-900/10" : ""}`}
                >
                  <TableCell className="bg-gray-50/50 py-4 text-center dark:bg-gray-800/30">
                    <RankBadge index={index} rank={rank} />
                  </TableCell>
                  {isJuaraUmum && (
                    <TableCell>
                      <div className="flex items-center gap-3 py-1">
                        <TeamAvatar name={info.name} logo={info.logo} rank={index} />
                        <div className="flex min-w-[150px] flex-col">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{info.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{info.sekolah}</p>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-center font-mono text-base font-bold text-gray-700 dark:text-gray-300">
                    {displayNomor}
                  </TableCell>
                  {!isJuaraUmum && (
                    <TableCell className="font-bold text-gray-800 dark:text-gray-200">
                      <div className="flex items-center gap-3">
                        <TeamAvatar name={info.name} logo={info.logo} size={32} />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{info.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{info.sekolah}</span>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {aspeks?.map((aspekName) => (
                    <TableCell key={aspekName} className="text-center">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {item.scores?.[aspekName] || 0}
                      </span>
                    </TableCell>
                  ))}
                  {showPenalty && (
                    <TableCell className="text-center font-bold text-red-600 dark:text-red-400">
                      {penalty}
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    {isJuaraUmum ? (
                      <div className="inline-flex rounded-md bg-gray-900 px-3 py-1 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-gray-900">
                        {parseInt(finalScore, 10)}
                      </div>
                    ) : (
                      <span className="text-lg font-black text-gray-900 dark:text-white">
                        {item.nilai_akhir}
                      </span>
                    )}
                  </TableCell>
                  {!isJuaraUmum && (
                    <TableCell className="bg-gray-50/50 text-center dark:bg-gray-800/30">
                      <KejuaraanBadge>{kejuaraan}</KejuaraanBadge>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 p-4 md:hidden">
        <Accordion type="single" collapsible>
          {data.map((item, index) => {
            const rank = item.rank || index + 1;
            const info = getTeamInfo(item);
            const nomorTampil = nomorTampilMap.get(item.team_id);
            const displayNomor = nomorTampil ? String(nomorTampil).padStart(2, "0") : "-";
            const isWithinLimit = !parsedLimit || rank <= parsedLimit;
            const kejuaraan = isWithinLimit
              ? isGlobal
                ? getKejuaraanTitle(rank, kejuaraanTemplate)
                : `${namaKategori || "Kategori"} Terbaik ${rank}`
              : "-";
            const finalScore = item.nilai_akhir ?? item.total ?? 0;
            const penalty = item.penalty?.total_pengurangan > 0 ? item.penalty.total_pengurangan : 0;

            return (
              <AccordionItem
                key={item.team_id}
                value={item.team_id}
                className={`mb-3 rounded-xl border shadow-sm last:mb-0 ${
                  index < 3
                    ? "border-yellow-200 bg-yellow-50/40 dark:border-yellow-900/40 dark:bg-yellow-900/10"
                    : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-800/50"
                }`}
              >
                <AccordionTrigger className="p-3 text-left hover:no-underline">
                  <div className="flex w-full items-center gap-3">
                    <RankBadge index={index} rank={rank} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                        {truncateText(info.name)}
                      </p>
                      <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                        {truncateText(info.sekolah)}
                      </p>
                    </div>
                    <div className="ml-2 shrink-0 text-right">
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        {parseInt(finalScore, 10)}
                      </p>
                      {!isJuaraUmum && (
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400">{kejuaraan}</p>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t border-gray-100 p-4 dark:border-gray-700/50">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">No. Tampil</span>
                      <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                        {displayNomor}
                      </span>
                    </div>
                    <hr className="border-dashed" />
                    {aspeks?.map((aspekName) => (
                      <div key={aspekName} className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Nilai {aspekName}</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {item.scores?.[aspekName] || 0}
                        </span>
                      </div>
                    ))}
                    {showPenalty && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Penalty</span>
                        <span className="font-bold text-red-600 dark:text-red-400">{penalty}</span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </>
  );
}