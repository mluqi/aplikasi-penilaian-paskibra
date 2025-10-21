"use client";

import { useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import useAuth from "@/hooks/useAuth";

/**
 * Komponen untuk melindungi halaman berdasarkan status otentikasi dan peran pengguna.
 * @param {{ children: React.ReactNode, allowedRoles?: string[], requiredAccess?: string }} props
 * @returns
 */
const ProtectedRoute = ({ children, allowedRoles, requiredAccess }) => {
  const { user, isAuthenticated, isProcessingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isProcessingAuth) {
      return; // Tunggu sampai pengecekan otentikasi selesai
    }

    if (!isAuthenticated) {
      router.replace("/auth/login"); // Arahkan ke halaman login yang benar
      return;
    }

    // Jika `allowedRoles` ditentukan, periksa apakah peran pengguna diizinkan
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      // Tampilkan halaman 404 jika peran tidak diizinkan
      notFound();
      return;
    }

    // Jika `requiredAccess` ditentukan, periksa apakah pengguna memiliki izin tersebut
    if (requiredAccess && !user?.akses?.includes(requiredAccess)) {
      // Tampilkan halaman 404 jika tidak punya izin
      notFound();
      return;
    }
  }, [
    isAuthenticated,
    isProcessingAuth,
    user,
    router,
    allowedRoles,
    requiredAccess,
  ]);

  // Tampilkan loading spinner atau null selama otentikasi diproses
  if (
    isProcessingAuth ||
    !isAuthenticated ||
    (allowedRoles && !allowedRoles.includes(user?.role)) ||
    (requiredAccess && !user?.akses?.includes(requiredAccess))
  ) {
    return <div>Loading...</div>; // Atau komponen skeleton yang lebih baik
  }

  return children;
};

export default ProtectedRoute;
