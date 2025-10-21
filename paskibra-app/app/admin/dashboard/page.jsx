"use client";

import { useState, useEffect } from "react";
import api from "@/service/api";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, Calendar, UserCog, ArrowRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const StatCard = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const SkeletonCard = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 w-2/5 animate-pulse rounded-md bg-muted"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 w-1/4 animate-pulse rounded-md bg-muted"></div>
      <div className="mt-2 h-3 w-3/4 animate-pulse rounded-md bg-muted"></div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [coordinatorData, setCoordinatorData] = useState([]);
  const [coordinatorLoading, setCoordinatorLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (user?.role === "admin" || user?.role === "superadmin") {
        try {
          const response = await api.get("/dashboard/summary");
          setSummary(response.data.summary);
        } catch (error) {
          toast.error("Gagal memuat data ringkasan.");
        } finally {
          setAdminLoading(false);
        }
      } else {
        setAdminLoading(false);
      }
    };

    const fetchCoordinatorData = async () => {
      if (
        !user ||
        (user.role !== "koordinator_team" && user.role !== "koordinator_event")
      ) {
        setCoordinatorLoading(false);
        return;
      }

      const endpoint = user.role === "koordinator_team" ? "/teams" : "/events";
      try {
        const response = await api.get(endpoint);
        const allItems =
          user.role === "koordinator_team"
            ? response.data.teams
            : response.data.events;
        const myItems = allItems.filter(
          (item) => item.koordinator_id === user.id
        );
        setCoordinatorData(myItems);
      } catch (error) {
        toast.error(
          `Gagal memuat data ${
            user.role === "koordinator_team" ? "tim" : "event"
          } Anda.`
        );
      } finally {
        setCoordinatorLoading(false);
      }
    };

    if (user) {
      fetchSummary();
      fetchCoordinatorData();
    }
  }, [user]);

  const isCoordinator =
    user?.role === "koordinator_team" || user?.role === "koordinator_event";

  return (
    <ProtectedRoute requiredAccess="view_dashboard">
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
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">
            Selamat Datang, {user?.user_name || "Pengguna"}!
          </h1>
        </div>

        {(user?.role === "admin" || user?.role === "superadmin") && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              summary && (
                <>
                  <StatCard
                    title="Total Pengguna"
                    value={summary.users}
                    description="Semua role termasuk admin, juri, dan koordinator"
                    icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
                  />
                  <StatCard
                    title="Total Tim"
                    value={summary.teams}
                    description="Jumlah tim yang terdaftar di sistem"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                  />
                  <StatCard
                    title="Total Event"
                    value={summary.events}
                    description="Jumlah event yang telah atau akan diselenggarakan"
                    icon={
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    }
                  />
                </>
              )
            )}
          </div>
        )}

        {isCoordinator && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {user.role === "koordinator_team" ? "Tim Anda" : "Event Anda"}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {coordinatorLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : coordinatorData.length > 0 ? (
                coordinatorData.map((item) => (
                  <Card
                    key={
                      user.role === "koordinator_team"
                        ? item.team_id
                        : item.event_id
                    }
                  >
                    <CardHeader>
                      <CardTitle className="text-base">
                        {user.role === "koordinator_team"
                          ? item.team_name
                          : item.event_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {user.role === "koordinator_team"
                          ? item.team_sekolah_instansi
                          : item.event_tempat}
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/admin/${
                            user.role === "koordinator_team"
                              ? "teams"
                              : "events"
                          }/${
                            user.role === "koordinator_team"
                              ? item.team_id
                              : item.event_id
                          }`}
                        >
                          Kelola <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="md:col-span-2 lg:col-span-3">
                  <CardContent className="p-6 text-center">
                    <p className="mb-4">
                      Anda belum memiliki{" "}
                      {user.role === "koordinator_team" ? "tim" : "event"}.
                    </p>
                    <Button asChild>
                      <Link
                        href={`/admin/${
                          user.role === "koordinator_team" ? "teams" : "events"
                        }`}
                      >
                        Tambah{" "}
                        {user.role === "koordinator_team" ? "Tim" : "Event"}{" "}
                        Baru
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {user?.role === "juri" && (
          <Card>
            <CardHeader>
              <CardTitle>Selamat Datang, Juri!</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Silakan pilih menu 'Input Penilaian' atau 'Manajemen Event'
                untuk memulai.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </ProtectedRoute>
  );
}
