import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AdminLayout({ children }) {
  // This layout now serves as the main layout for all authenticated users.
  // It provides the sidebar and protects all nested routes.
  // Consider renaming the '(admin)' folder to '(app)' or '(private)' for clarity.
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
