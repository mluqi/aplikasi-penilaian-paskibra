"use client";
import { createContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/service/api";
import { Toaster, toast } from "sonner";

export const AuthContext = createContext(undefined);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isProcessingAuth, setIsProcessingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const startProcessingAuth = () => setIsProcessingAuth(true);
  const stopProcessingAuth = () => setIsProcessingAuth(false);

  const logout = useCallback(
    async ({ showToast = true, expired = false, showSpinner = true } = {}) => {
      if (showSpinner) setIsLoggingOut(true);
      startProcessingAuth();
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token && !expired) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          await api.post("/auth/logout");
        }
      } catch (error) {
        console.error(
          "Server logout failed, logging out client-side anyway.",
          error,
        );
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        setIsAuthenticated(false);
        setIsLoggingOut(false);
        stopProcessingAuth();

        if (expired) {
          setIsSessionExpired(true);
        } else {
          router.push("/auth/login");
          if (showToast) {
            toast.success("Logout berhasil.");
          }
        }
      }
    },
    [router],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = useCallback(async () => {
    startProcessingAuth();
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token) {
        const storedUser =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        // Hanya redirect jika berada di halaman yang dilindungi (misal: /admin)
        if (pathname.startsWith("/admin")) {
          await logout({ showToast: false, showSpinner: false });
        } else {
          // Jika di halaman publik, cukup set status tanpa redirect
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Authentication check failed", error);
      await logout({ showToast: false, showSpinner: false });
    } finally {
      stopProcessingAuth();
    }
  }, [logout, pathname]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Interceptor Axios untuk mendeteksi 401 Unauthorized (Token Kadaluarsa)
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout({ expired: true, showSpinner: false });
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [logout]);

  const login = async (email, password, rememberMe = false) => {
    setIsLoggingIn(true);
    startProcessingAuth();
    try {
      const response = await api.post("/auth/login", {
        user_email: email,
        user_password: password,
      });

      const { token, user: userData, message } = response.data;

      const storage = rememberMe ? localStorage : sessionStorage;

      // Bersihkan storage yang berlawanan agar tidak ada duplikasi sesi
      if (rememberMe) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);
      setIsAuthenticated(true);
      toast.success(message || "Login berhasil!");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Login gagal", error);
      const errorMessage =
        error.response?.data?.message ||
        "Tidak dapat login. Silakan coba lagi.";
      toast.error(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoggingIn(false);
      stopProcessingAuth();
    }
  };

  const updateUserProfile = (newUserData) => {
    // Update state
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);

    // Update localStorage
    try {
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to update user in localStorage", error);
    }
  };

  const register = async (formData) => {
    startProcessingAuth();
    try {
      const response = await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(
        response.data.message ||
          "Registrasi berhasil! Mohon tunggu persetujuan admin.",
      );
      // Opsional: Anda bisa mereset form atau mengarahkan pengguna kembali ke tab login di sini.
    } catch (error) {
      console.error("Registrasi gagal", error);
      const errorMessage =
        error.response?.data?.message ||
        "Tidak dapat mendaftar. Silakan coba lagi.";
      toast.error(errorMessage);
    } finally {
      stopProcessingAuth();
    }
  };

  const contextValue = {
    user,
    isAuthenticated,
    isProcessingAuth,
    login,
    logout,
    register, // Tambahkan fungsi register ke context
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}

      {/* Overlay Loading Logout */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-background p-6 rounded-2xl shadow-2xl flex flex-col items-center border border-border animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-foreground font-medium">Sedang keluar...</p>
          </div>
        </div>
      )}

      {/* Overlay Loading Login */}
      {isLoggingIn && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-background p-6 rounded-2xl shadow-2xl flex flex-col items-center border border-border animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-foreground font-medium">Sedang masuk...</p>
          </div>
        </div>
      )}

      {/* Komponen Modal Session Expired */}
      {isSessionExpired && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-background p-8 rounded-2xl shadow-2xl max-w-sm w-full flex flex-col items-center text-center border border-border animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Sesi Berakhir
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Sesi login Anda telah berakhir demi keamanan. Silakan login
              kembali untuk melanjutkan aktivitas Anda.
            </p>
            <button
              onClick={() => {
                setIsSessionExpired(false);
                router.push("/auth/login");
              }}
              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
            >
              Login Kembali
            </button>
          </div>
        </div>
      )}

      <Toaster />
    </AuthContext.Provider>
  );
};

export { AuthProvider };
