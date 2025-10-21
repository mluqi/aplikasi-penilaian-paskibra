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

// A simple loading spinner component
const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function LogAktivitasPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [filters, setFilters] = useState({
    target: "",
    action: "",
    owner: "",
    startDate: "",
    endDate: "",
  });

  const fetchLogs = useCallback(async (page = 1, currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 15,
        ...currentFilters,
      };

      // Hapus filter kosong
      Object.keys(params).forEach(
        (key) =>
          (params[key] === "" || params[key] === null) && delete params[key]
      );

      const response = await api.get("/logs/aktivitas", { params });

      const data = response.data;
      setLogs(data.data);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil data log.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce the fetch call when filters change
    const handler = setTimeout(() => {
      fetchLogs(pagination.currentPage, filters);
    }, 500);

    // Cleanup function to cancel the timeout if dependencies change
    return () => {
      clearTimeout(handler);
    };
  }, [pagination.currentPage, filters, fetchLogs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset ke halaman 1 saat filter berubah
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleCopySource = (source) => {
    if (!source) {
      toast.info("Tidak ada source untuk disalin.");
      return;
    }
    navigator.clipboard.writeText(source).then(
      () => toast.success("Source berhasil disalin ke clipboard."),
      () => toast.error("Gagal menyalin source.")
    );
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
                <BreadcrumbPage>Log Aktivitas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            type="text"
            name="target"
            placeholder="Filter ID Target..."
            value={filters.target}
            onChange={handleFilterChange}
          />
          <Input
            type="text"
            name="action"
            placeholder="Filter Aksi (CREATE, etc)..."
            value={filters.action}
            onChange={handleFilterChange}
          />
          <Input
            type="text"
            name="owner"
            placeholder="Filter ID Pelaku..."
            value={filters.owner}
            onChange={handleFilterChange}
          />
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

        {/* Table Section */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Target ID</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Memuat data log...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-red-500"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.log_record).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="font-mono">
                      {log.log_target}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.log_action.includes("FAILED")
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {log.log_action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.log_detail}</TableCell>
                    <TableCell className="font-mono">{log.log_owner}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopySource(log.log_source)}
                        disabled={!log.log_source}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Salin Source</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Tidak ada data log aktivitas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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
