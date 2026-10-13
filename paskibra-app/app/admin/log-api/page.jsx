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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function LogApiPage() {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("API");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [filters, setFilters] = useState({
    target: "",
    status: "",
    provider: "",
    startDate: "",
    endDate: "",
  });

  const fetchLogs = useCallback(
    async (page = 1, currentFilters, currentTab) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit: 15,
          type: currentTab,
          ...currentFilters,
        };

        Object.keys(params).forEach(
          (key) =>
            (params[key] === "" || params[key] === null) && delete params[key],
        );

        const response = await api.get("/logs/api-log", { params });

        const data = response.data;
        setLogs(data.data);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalItems: data.totalItems,
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Gagal mengambil data log API.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLogs(pagination.currentPage, filters, activeTab);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [pagination.currentPage, filters, activeTab, fetchLogs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleCopySource = (source) => {
    if (!source) {
      toast.info("Tidak ada payload untuk disalin.");
      return;
    }
    try {
      // Decode dari base64 dengan aman
      const decoded = decodeURIComponent(escape(atob(source)));
      navigator.clipboard.writeText(decoded).then(
        () => toast.success("Payload berhasil disalin ke clipboard."),
        () => toast.error("Gagal menyalin payload."),
      );
    } catch (e) {
      // Fallback jika encoding bermasalah
      navigator.clipboard.writeText(source).then(
        () => toast.success("Payload (Base64) disalin ke clipboard."),
        () => toast.error("Gagal menyalin payload."),
      );
    }
  };

  return (
    <ProtectedRoute requiredAccess="view_activity_log">
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
                <BreadcrumbPage>Log API</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Tab Navigation */}
        <div className="flex border-b border-border/50 mb-2">
          <button
            onClick={() => {
              setActiveTab("API");
              setFilters((prev) => ({ ...prev, status: "", provider: "" }));
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
              activeTab === "API"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Log API Request
          </button>
          <button
            onClick={() => {
              setActiveTab("WEBHOOK");
              setFilters((prev) => ({ ...prev, status: "", provider: "" }));
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
              activeTab === "WEBHOOK"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Log Webhook Callback
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            type="text"
            name="target"
            placeholder="Cari Target / Detail..."
            value={filters.target}
            onChange={handleFilterChange}
          />
          <Select
            name="provider"
            value={filters.provider}
            onValueChange={(value) =>
              handleFilterChange({
                target: {
                  name: "provider",
                  value: value === "all" ? "" : value,
                },
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Gateway" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Gateway</SelectItem>
              <SelectItem value="DOKU">DOKU</SelectItem>
              <SelectItem value="XENDIT">Xendit</SelectItem>
            </SelectContent>
          </Select>
          {activeTab === "API" ? (
            <Select
              name="status"
              value={filters.status}
              onValueChange={(value) =>
                handleFilterChange({
                  target: {
                    name: "status",
                    value: value === "all" ? "" : value,
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="API_SUCCESS">Sukses</SelectItem>
                <SelectItem value="API_ERROR">Gagal</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div />
          )}
          <Input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
          <Input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Target / Endpoint</TableHead>
                {activeTab === "WEBHOOK" && (
                  <>
                    <TableHead>Donation ID</TableHead>
                    <TableHead>Amount</TableHead>
                  </>
                )}
                <TableHead>Status</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead className="text-right">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={activeTab === "WEBHOOK" ? 8 : 6}
                    className="h-24 text-center"
                  >
                    Memuat data log...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={activeTab === "WEBHOOK" ? 8 : 6}
                    className="h-24 text-center text-red-500"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.log_record).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          log.provider === "DOKU"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold"
                            : log.provider === "XENDIT"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-semibold"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }
                      >
                        {log.provider || "DOKU"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {activeTab === "WEBHOOK"
                        ? log.target_endpoint || "api/webhook/doku"
                        : log.log_target === "doku_logs"
                          ? log.log_detail?.includes("qris") ||
                            log.log_detail?.includes("QRIS") ||
                            log.log_detail?.includes("generate_qris")
                            ? "/checkout/v1/payment/generate-qris"
                            : log.log_detail?.includes("check") ||
                                log.log_detail?.includes("Check") ||
                                log.log_detail?.includes("check_payment_status")
                              ? "/checkout/v1/payment/check-status"
                              : "/checkout/v1/payment"
                          : log.log_target}
                    </TableCell>
                    {activeTab === "WEBHOOK" && (
                      <>
                        <TableCell className="font-mono">
                          {log.donation_id || log.log_target}
                        </TableCell>
                        <TableCell>
                          {log.amount
                            ? new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(log.amount)
                            : "-"}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      {activeTab === "WEBHOOK" ? (
                        <Badge
                          variant={
                            log.payment_status === "PAID" ||
                            log.payment_status === "SUCCEEDED"
                              ? "success"
                              : log.payment_status === "FAILED" ||
                                  log.payment_status === "EXPIRED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {log.payment_status || "UNKNOWN"}
                        </Badge>
                      ) : (
                        <Badge
                          variant={
                            log.log_action === "API_ERROR"
                              ? "destructive"
                              : "success"
                          }
                        >
                          {log.log_action === "API_SUCCESS"
                            ? "Sukses"
                            : "Gagal"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{log.log_detail}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopySource(log.log_source)}
                        disabled={!log.log_source}
                        title="Salin JSON Payload"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Salin Payload</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={activeTab === "WEBHOOK" ? 8 : 6}
                    className="h-24 text-center"
                  >
                    Tidak ada data log {activeTab === "API" ? "API" : "Webhook"}
                    .
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && !error && logs.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              variant="outline"
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Halaman {pagination.currentPage} dari {pagination.totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              variant="outline"
            >
              Berikutnya
            </Button>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
