import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import Login from "./Login";
import Register from "./Register";
import { ThemeToggle } from "../layout/ThemeToggle";
import { ShieldCheck } from "lucide-react";

const Auth = () => {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";

  return (
    <div className="relative flex flex-col items-center gap-4 text-center">
      <div className="absolute top-0 right-0">
        <ThemeToggle />
      </div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <h1 className="flex">
          <span className="font-bold text-2xl text-primary text-center sm:text-left">
            Penjurian Paskibra
          </span>
        </h1>
      </div>
      <p className="text-lg text-muted-foreground max-w-sm">
        Silakan masuk dengan akun yang telah diberikan
      </p>
      <Tabs defaultValue={defaultTab} className="w-full max-w-sm sm:max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login />
        </TabsContent>
        <TabsContent value="register">
          <Register />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Auth;
