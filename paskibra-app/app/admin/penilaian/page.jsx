"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Star, Frown, ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
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

const EventSelection = ({ events, onSelectEvent }) => (
  <>
    <h1 className="text-2xl font-semibold">Pilih Event untuk Dinilai</h1>
    {events && events.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.event_id}>
            <CardHeader>
              <CardTitle>{event.event_name}</CardTitle>
              <CardDescription>
                {format(new Date(event.event_tanggal), "d MMMM yyyy", {
                  locale: id,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {event.event_tempat}
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => onSelectEvent(event)}>
                <Star className="mr-2 h-4 w-4" /> Mulai Menilai
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    ) : (
      <div className="text-center text-muted-foreground py-10">
        <Frown className="mx-auto h-12 w-12 mb-4" />
        <p>Anda tidak ditugaskan pada event manapun saat ini.</p>
      </div>
    )}
  </>
);

export default function InputPenilaianPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchJuriEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Endpoint ini perlu dibuat di backend untuk mengambil event khusus juri
      const response = await api.get(`/events/juri`);
      setEvents(response.data.events);
    } catch (error) {
      toast.error("Gagal memuat daftar event Anda.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJuriEvents();
  }, [fetchJuriEvents]);

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
        {loading ? (
          <div>Memuat event...</div>
        ) : (
          <EventSelection events={events} onSelectEvent={handleSelectEvent} />
        )}
      </main>
    </ProtectedRoute>
  );
}
