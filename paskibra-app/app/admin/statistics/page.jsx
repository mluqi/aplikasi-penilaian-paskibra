"use client";

import { useState, useEffect } from "react";
import api from "@/service/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  BarChart,
  CheckCircle,
  Archive,
  Edit,
  Layers,
  Trophy,
  Globe,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const capitalize = (s) => {
  if (typeof s !== "string" || !s) return "Lainnya";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
};

export default function StatisticsPage() {
  const [stats, setStats] = useState({
    status: {},
    kategori: {},
    tingkat: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/event-stats");
        const { statusStats, kategoriStats, tingkatStats } = response.data;

        const processStats = (data, keyField) =>
          data.reduce((acc, item) => {
            acc[item[keyField]] = item.count;
            return acc;
          }, {});

        setStats({
          status: processStats(statusStats, "event_status"),
          kategori: processStats(kategoriStats, "event_kategori"),
          tingkat: processStats(tingkatStats, "event_tingkat"),
        });
      } catch (error) {
        toast.error("Gagal memuat data statistik.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Memuat statistik...</div>;
  }

  const totalEvents = Object.values(stats.status).reduce((a, b) => a + b, 0);

  return (
    <ProtectedRoute requiredAccess="view_statistics">
      <header className="flex h-16 shrink-0 items-center gap-2">
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
                <BreadcrumbPage>Statistik Event</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <h1 className="text-2xl font-semibold">Statistik Event</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Event" value={totalEvents} icon={BarChart} />
          <StatCard
            title="Published"
            value={stats.status.published || 0}
            icon={CheckCircle}
            color="text-green-500"
          />
          <StatCard
            title="Draft"
            value={stats.status.draft || 0}
            icon={Edit}
            color="text-yellow-500"
          />
          <StatCard
            title="Archived"
            value={stats.status.archived || 0}
            icon={Archive}
            color="text-red-500"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" /> Berdasarkan Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {Object.entries(stats.kategori).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {capitalize(key)}
                    </span>
                    <span className="font-medium">{value} Event</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" /> Berdasarkan Tingkat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {Object.entries(stats.tingkat).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {capitalize(key)}
                    </span>
                    <span className="font-medium">{value} Event</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  );
}
