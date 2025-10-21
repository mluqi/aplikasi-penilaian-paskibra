"use client";

import { useState, useEffect, useCallback } from "react";
import useAuth from "@/hooks/useAuth";
import api from "@/service/api";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function RoleAccessPage() {
  const { user } = useAuth(); // Cukup gunakan user untuk trigger useEffect
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [access, setAccess] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Tunggu sampai user terotentikasi
      setIsLoading(true);
      try {
        const response = await api.get("/role-access");
        setRoles(response.data.roles);
        setMenus(response.data.menus);
        setAccess(response.data.access);
      } catch (error) {
        toast.error("Gagal memuat data hak akses.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleCheckboxChange = (roleId, menuId) => {
    setAccess((prevAccess) => {
      const currentAccess = { ...prevAccess };
      const roleAccess = currentAccess[roleId]
        ? [...currentAccess[roleId]]
        : [];
      const menuIndex = roleAccess.indexOf(menuId);

      if (menuIndex > -1) {
        // Jika sudah ada, hapus
        roleAccess.splice(menuIndex, 1);
      } else {
        // Jika belum ada, tambahkan
        roleAccess.push(menuId);
      }
      currentAccess[roleId] = roleAccess;
      return currentAccess;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post("/role-access", { access });
      toast.success("Hak akses berhasil diperbarui.");
    } catch (error) {
      toast.error("Gagal menyimpan perubahan.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredAccess="manage_role_access">
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
                <BreadcrumbPage>Hak Akses</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">
                      Menu
                    </TableHead>
                    {roles.map((role) => (
                      <TableHead key={role.role_id} className="text-center">
                        {role.role_name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.map((menu) => (
                    <TableRow key={menu.menu_id}>
                      <TableCell className="font-medium sticky left-0 bg-background z-10">
                        {menu.menu_name}
                      </TableCell>
                      {roles.map((role) => (
                        <TableCell key={role.role_id} className="text-center">
                          <Checkbox
                            checked={
                              access[role.role_id]?.includes(menu.menu_id) ||
                              false
                            }
                            onCheckedChange={() =>
                              handleCheckboxChange(role.role_id, menu.menu_id)
                            }
                            disabled={user?.role !== "superadmin"}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end p-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan Perubahan
            </Button>
          </CardFooter>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
