"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const Login = () => {
  const { login, isProcessingAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Tarik riwayat email jika sebelumnya Remember Me dicentang
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const isRemembered = localStorage.getItem("rememberMe") === "true";
    if (savedEmail && isRemembered) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Mohon isi semua kolom");
      return;
    }

    // Simpan history email ke browser jika dicentang, hapus jika tidak
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberMe");
    }

    await login(email, password, rememberMe);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-full mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="font-semibold text-gray-700 dark:text-gray-300"
          >
            Alamat Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessingAuth}
              className="pl-11 h-12 bg-muted/30 focus-visible:bg-background rounded-xl border-border/50 text-base"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="font-semibold text-gray-700 dark:text-gray-300"
            >
              Password
            </Label>
            {/* <Link
              href="#"
              className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400"
            >
              Lupa password?
            </Link> */}
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isProcessingAuth}
              className="pl-11 pr-10 h-12 bg-muted/30 focus-visible:bg-background rounded-xl border-border/50 text-base"
              required
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 h-4 w-4 cursor-pointer"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isProcessingAuth}
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm font-normal cursor-pointer text-gray-600 dark:text-gray-400"
            >
              Ingat saya (Remember Me)
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5"
          disabled={isProcessingAuth}
        >
          {isProcessingAuth ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memproses...
            </>
          ) : (
            "Masuk ke Dashboard"
          )}
        </Button>
      </form>

      <div className="mt-6 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default Login;
