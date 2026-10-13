"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs";
import Login from "./Login";
import Register from "./Register";
import { ThemeToggle } from "../layout/ThemeToggle";
import { ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "login");
  }, [searchParams]);

  return (
    <div className="flex flex-col w-full mx-auto relative">
      <div className="absolute -top-4 right-0 sm:-top-6">
        <ThemeToggle />
      </div>
      {/* Mobile Branding (Only visible on small screens) */}
      <div className="flex md:hidden items-center justify-center gap-3 mb-8">
        <div className="bg-red-100 dark:bg-red-500/10 p-2.5 rounded-xl">
          <ShieldCheck className="h-8 w-8 text-red-600 dark:text-red-500" />
        </div>
        <span className="font-bold text-2xl text-foreground tracking-tight">
          KomandoApp
        </span>
      </div>

      <div className="text-center md:text-left mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          Selamat Datang!
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Silakan masuk atau buat akun baru untuk melanjutkan.
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full h-full grid-cols-2 p-1 bg-muted/50 rounded-xl mb-6">
          <TabsTrigger
            value="login"
            className="rounded-lg py-2.5 font-medium cursor-pointer"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="rounded-lg py-2.5 font-medium cursor-pointer"
          >
            Register
          </TabsTrigger>
        </TabsList>

        <div className="relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {activeTab === "login" ? <Login /> : <Register />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
};

export default Auth;
