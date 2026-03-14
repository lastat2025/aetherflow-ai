import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { UserRole } from "./backend.d";
import Header from "./components/Header";
import RoleSelection from "./components/RoleSelection";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUserRole } from "./hooks/useQueries";
import AdminDashboard from "./pages/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import WorkerPortal from "./pages/WorkerPortal";

export default function App() {
  const { loginStatus, isInitializing } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success";
  const [isAIRunning, setIsAIRunning] = useState(false);
  const [localRole, setLocalRole] = useState<UserRole | null>(null);

  const roleQuery = useUserRole();
  const backendRole = roleQuery.data;
  const effectiveRole = localRole ?? backendRole;

  useEffect(() => {
    if (!isLoggedIn) setLocalRole(null);
  }, [isLoggedIn]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LandingPage />
        <Toaster richColors theme="dark" />
      </>
    );
  }

  const needsRoleSelection =
    !effectiveRole ||
    effectiveRole === UserRole.guest ||
    effectiveRole === ("guest" as UserRole);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        role={effectiveRole === UserRole.admin ? "admin" : "user"}
        isAIRunning={isAIRunning}
      />
      <main className="flex-1">
        {roleQuery.isLoading && !localRole ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : needsRoleSelection ? (
          <RoleSelection onRoleSelected={(role) => setLocalRole(role)} />
        ) : effectiveRole === UserRole.admin ? (
          <AdminDashboard onAIRunning={setIsAIRunning} />
        ) : (
          <WorkerPortal />
        )}
      </main>
      <footer className="border-t border-border/30 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
      <Toaster richColors theme="dark" />
    </div>
  );
}
