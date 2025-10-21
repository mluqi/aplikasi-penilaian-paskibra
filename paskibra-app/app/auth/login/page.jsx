"use client";

import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Auth from "@/components/auth/Auth";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function LoginPage() {
  const { user, loading, isProcessingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/admin/dashboard");
    }
  }, [user, loading, router]);

  if (isProcessingAuth || (!loading && user)) {
    return <Spinner />;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* Foreground Content */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-white/15 to-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <Auth />
        </div>
      </div>
    </div>
  );
}
