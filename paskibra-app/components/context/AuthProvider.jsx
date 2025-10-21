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
  const router = useRouter();
  const pathname = usePathname();

  const startProcessingAuth = () => setIsProcessingAuth(true);
  const stopProcessingAuth = () => setIsProcessingAuth(false);

  const logout = useCallback(
    async ({ showToast = true } = {}) => {
      startProcessingAuth();
      try {
        const token = localStorage.getItem("token");
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          await api.post("/auth/logout");
        }
      } catch (error) {
        console.error(
          "Server logout failed, logging out client-side anyway.",
          error
        );
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        setIsAuthenticated(false);
        router.push("/auth/login");
        stopProcessingAuth();
        if (showToast) {
          toast.success("Logout berhasil.");
        }
      }
    },
    [router]
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = useCallback(async () => {
    startProcessingAuth();
    try {
      const token = localStorage.getItem("token");

      if (token) {
        const storedUser = localStorage.getItem("user");
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        // Hanya redirect jika berada di halaman yang dilindungi (misal: /admin)
        if (pathname.startsWith("/admin")) {
          await logout({ showToast: false });
        } else {
          // Jika di halaman publik, cukup set status tanpa redirect
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Authentication check failed", error);
      await logout({ showToast: false });
    } finally {
      stopProcessingAuth();
    }
  }, [logout, pathname]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    startProcessingAuth();
    try {
      const response = await api.post("/auth/login", {
        user_email: email,
        user_password: password,
      });

      const { token, user: userData, message } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
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
      stopProcessingAuth();
    }
  };

  const updateUserProfile = (newUserData) => {
    // Update state
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);

    // Update localStorage
    try {
      localStorage.setItem("user", JSON.stringify(updatedUser));
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
          "Registrasi berhasil! Mohon tunggu persetujuan admin."
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
      <Toaster />
    </AuthContext.Provider>
  );
};

export { AuthProvider };
