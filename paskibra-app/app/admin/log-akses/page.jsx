"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/service/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

export default function LogAksesPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [filters, setFilters] = useState({
    user: "",
    ip: "",
    status: "", // 'Berhasil', 'Gagal', or '' for all
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

      const response = await api.get("/logs/akses", { params });

      const data = response.data;
      setLogs(data.data);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal mengambil data log akses."
      );
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

  return (
    <ProtectedRoute requiredAccess="view_access_log">
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
                <BreadcrumbPage>Log Akses</BreadcrumbPage>
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
            name="user"
            placeholder="Filter User ID/Email..."
            value={filters.user}
            onChange={handleFilterChange}
          />
          <Input
            type="text"
            name="ip"
            placeholder="Filter IP Address..."
            value={filters.ip}
            onChange={handleFilterChange}
          />
          <Select
            name="status"
            value={filters.status}
            onValueChange={(value) =>
              // Jika user memilih 'all', set filter ke string kosong.
              handleFilterChange({
                target: { name: "status", value: value === "all" ? "" : value },
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Berhasil">Berhasil</SelectItem>
              <SelectItem value="Gagal">Gagal</SelectItem>
            </SelectContent>
          </Select>
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
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Alamat IP</TableHead>
                <TableHead>Browser</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Memuat data log...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-red-500"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.akses_record).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="font-mono">
                      {log.akses_user}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.akses_status === "Gagal"
                            ? "destructive"
                            : "success"
                        }
                      >
                        {log.akses_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{log.akses_ip}</TableCell>
                    <TableCell className="text-xs">
                      {log.akses_browser}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada data log akses.
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
