"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserCheck, UserX, Info, Loader2, MoreHorizontal } from "lucide-react";
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

export default function PendingUsersPage() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [userToReject, setUserToReject] = useState(null);

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/pending");
      setPendingUsers(response.data);
    } catch (error) {
      console.error("Gagal mengambil data pengguna:", error);
      toast.error("Gagal mengambil data pengguna yang menunggu persetujuan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleApprove = async (userId) => {
    setProcessingId(userId);
    try {
      await api.patch(`/users/approve/${userId}`);
      toast.success("Pengguna berhasil disetujui.");
      fetchPendingUsers(); // Refresh data
    } catch (error) {
      console.error("Gagal menyetujui pengguna:", error);
      toast.error(
        error.response?.data?.message || "Gagal menyetujui pengguna."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId) => {
    setProcessingId(userId);
    try {
      await api.delete(`/users/${userId}`);
      toast.success("Pendaftaran pengguna berhasil ditolak.");
      fetchPendingUsers(); // Refresh data
    } catch (error) {
      console.error("Gagal menolak pengguna:", error);
      toast.error(error.response?.data?.message || "Gagal menolak pengguna.");
    } finally {
      setProcessingId(null);
      setUserToReject(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredAccess="manage_users">
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
                <BreadcrumbPage>Persetujuan Pengguna</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Persetujuan Pengguna</h1>
        </div>
        {pendingUsers.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Informasi</AlertTitle>
            <AlertDescription>
              Tidak ada pengguna yang menunggu persetujuan saat ini.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              user.user_photo
                                ? `${process.env.NEXT_PUBLIC_API_URL}${user.user_photo}`
                                : ""
                            }
                            alt={user.user_name}
                          />
                          <AvatarFallback>
                            {user.user_name
                              ? user.user_name.charAt(0).toUpperCase()
                              : "PU"}
                          </AvatarFallback>
                        </Avatar>
                        {/* <Image
                          src={
                            user.user_photo
                              ? `${process.env.NEXT_PUBLIC_API_URL}${user.user_photo}`
                              : "/default-avatar.png"
                          }
                          alt={user.user_name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                        {user.user_name || (
                          <span className="text-gray-500 italic">
                            Nama tidak tersedia
                          </span>
                        )} */}
                      </div>
                    </TableCell>
                    <TableCell>{user.user_email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.user_role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={processingId === user.user_id}
                          >
                            <span className="sr-only">Buka menu</span>
                            {processingId === user.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleApprove(user.user_id)}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            <span>Setujui</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setUserToReject(user)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            <span>Tolak</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <AlertDialog
        open={!!userToReject}
        onOpenChange={(open) => !open && setUserToReject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menolak dan menghapus pendaftaran untuk pengguna{" "}
              <strong>{userToReject?.user_name}</strong>. Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleReject(userToReject.user_id)}
            >
              Ya, Tolak Pendaftaran
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
