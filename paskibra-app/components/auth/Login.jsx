"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { CardFooter } from "@/components/ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Loader2, ArrowRightCircle } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const Login = () => {
  const { login, isProcessingAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Mohon isi semua kolom");
      return;
    }

    await login(email, password);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Selamat Datang Kembali
        </CardTitle>
        <CardDescription>
          Masukkan email dan password Anda untuk masuk ke dasbor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@anda.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessingAuth}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isProcessingAuth}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isProcessingAuth}>
            {isProcessingAuth ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-1 group hover:text-primary transition-colors cursor-pointer">
          <Link href="/">kembali ke landing page</Link>
          <ArrowRightCircle className="h-4 w-4 group-hover:text-primary transition-colors" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default Login;
