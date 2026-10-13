"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import api from "@/service/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Star,
  Frown,
  ArrowLeft,
  Lock,
  ShieldCheck,
  ArrowRight,
  Search,
  MapPin,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
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

export default function InputPenilaianPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fetchJuriEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const endpoint =
        user.role === "asisten_juri" ? "/events" : "/events/juri";
      const response = await api.get(endpoint);
      let eventsList = response.data.events;
      if (user.role === "asisten_juri") {
        eventsList = eventsList.filter((e) =>
          e.Event_asistens?.some((a) => a.asisten_id === user.id),
        );
      }
      setEvents(eventsList);
    } catch (error) {
      toast.error("Gagal memuat daftar event Anda.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJuriEvents();
  }, [fetchJuriEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchMatch =
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.event_tempat &&
          event.event_tempat.toLowerCase().includes(searchQuery.toLowerCase()));
      return searchMatch;
    });
  }, [events, searchQuery]);

  const handleSelectEvent = (event) => {
    router.push(`/admin/penilaian/${event.event_id}`);
  };

  return (
    <ProtectedRoute requiredAccess="input_assessment">
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
                <BreadcrumbPage>Input Penilaian</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pilih Event</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pilih event yang sedang berlangsung untuk mulai memberikan
              penilaian.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-900 shadow-sm rounded-xl"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[340px] rounded-xl bg-muted/50 animate-pulse border"
              />
            ))
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card
                key={event.event_id}
                className="group overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border-border/50"
              >
                <div className="relative h-56 w-full bg-muted/50 border-b border-border/50">
                  <Image
                    src={
                      event.event_poster
                        ? `${process.env.NEXT_PUBLIC_API_URL}${event.event_poster}`
                        : "/default-poster.png"
                    }
                    alt={`Poster ${event.event_name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) =>
                      (e.currentTarget.src = "/default-poster.png")
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none" />

                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <Badge
                      variant={
                        event.event_status === "published"
                          ? "default"
                          : event.event_status === "draft"
                            ? "secondary"
                            : "destructive"
                      }
                      className="shadow-sm capitalize font-medium px-2.5"
                    >
                      {event.event_status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex-1">
                  <h3 className="font-bold text-[17px] leading-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors text-foreground">
                    {event.event_name}
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 opacity-70 shrink-0 text-primary" />
                      <span className="truncate">
                        {format(new Date(event.event_tanggal), "d MMMM yyyy", {
                          locale: id,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 opacity-70 shrink-0 text-primary" />
                      <span className="truncate">{event.event_tempat}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Button
                    className="w-full shadow-sm group-hover:bg-primary/90 transition-colors"
                    onClick={() => handleSelectEvent(event)}
                  >
                    Mulai Penilaian
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-muted/20 border-dashed">
              <Frown className="h-14 w-14 mb-4 text-muted-foreground/40" />
              <p className="text-xl font-semibold text-foreground">
                Event Tidak Ditemukan
              </p>
              <p className="text-muted-foreground mt-2 max-w-md">
                Tidak ada event yang ditugaskan kepada Anda atau cocok dengan
                kata pencarian.
              </p>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
