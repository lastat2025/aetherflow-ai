import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, ChevronRight, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface RoleSelectionProps {
  onRoleSelected: (role: UserRole) => void;
}

export default function RoleSelection({ onRoleSelected }: RoleSelectionProps) {
  const { actor } = useActor();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectRole = async (role: UserRole) => {
    if (!actor) return;
    setLoading(role);
    try {
      const principal = await actor.getCallerUserRole();
      if (principal === "guest") {
        // For demo: assign user role to self, admin requires special setup
        if (role === UserRole.user) {
          await actor.initializeDefaultObjectives();
        }
      }
      onRoleSelected(role);
      toast.success(
        `Welcome! You joined as ${role === UserRole.admin ? "Admin" : "Worker"}.`,
      );
    } catch {
      toast.error("Failed to set role. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full border border-primary/30 bg-primary/10 p-4 cyan-glow">
            <Zap className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Welcome to AetherFlow AI
        </h1>
        <p className="text-muted-foreground max-w-md">
          Select your role to enter the autonomous income generation ecosystem.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 max-w-2xl w-full">
        <Card
          className="glass-card cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          onClick={() => handleSelectRole(UserRole.user)}
          data-ocid="nav.worker_tab"
        >
          <CardHeader className="pb-3">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Join as Worker</CardTitle>
            <CardDescription>
              Claim tasks, complete work, and earn automated payouts. Both human
              and AI-assisted tasks available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="mb-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Browse available tasks
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Submit work for AI
                review
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Receive automatic
                payouts
              </li>
            </ul>
            <Button
              className="w-full bg-primary text-primary-foreground hover:opacity-90"
              disabled={loading === UserRole.user}
            >
              {loading === UserRole.user ? "Joining..." : "Enter Worker Portal"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card
          className="glass-card cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          onClick={() => handleSelectRole(UserRole.admin)}
          data-ocid="nav.admin_tab"
        >
          <CardHeader className="pb-3">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-border/50 bg-muted/50">
              <Shield className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Access Admin</CardTitle>
            <CardDescription>
              Manage objectives, monitor all tasks, review worker performance,
              and control payouts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="mb-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">✓</span> Generate AI
                tasks
              </li>
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">✓</span> Set income
                objectives
              </li>
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">✓</span> Manage payouts
              </li>
            </ul>
            <Button
              variant="outline"
              className="w-full border-border/50 hover:border-primary/50"
              disabled={loading === UserRole.admin}
            >
              {loading === UserRole.admin
                ? "Accessing..."
                : "Enter Admin Dashboard"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
