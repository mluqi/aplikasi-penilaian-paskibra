import React from "react";
/**
 * Layout untuk halaman-halaman otentikasi (misalnya login, register).
 * Menyediakan latar belakang dan penempatan konten yang konsisten.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* Foreground Content */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
