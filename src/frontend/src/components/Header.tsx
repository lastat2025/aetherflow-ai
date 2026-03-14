import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, User, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  role?: string;
  isAIRunning?: boolean;
}

export default function Header({ role, isAIRunning }: HeaderProps) {
  const { clear, identity, loginStatus } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();
  const truncatedPrincipal = principal
    ? `${principal.slice(0, 6)}...${principal.slice(-4)}`
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/40">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-base font-bold tracking-tight">
            AetherFlow<span className="text-primary"> AI</span>
          </span>
          {role && (
            <Badge
              variant="outline"
              className="border-primary/40 text-primary text-xs uppercase tracking-widest"
            >
              {role === "admin" ? "Admin" : "Worker"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAIRunning && (
            <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
              <span className="ai-pulse h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs text-primary font-mono tracking-wider">
                AI RUNNING
              </span>
            </div>
          )}

          {truncatedPrincipal && (
            <div className="hidden sm:flex items-center gap-2 rounded-md border border-border/50 bg-muted/50 px-3 py-1.5">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">
                {truncatedPrincipal}
              </span>
            </div>
          )}

          {loginStatus === "success" && (
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50"
              data-ocid="nav.admin_link"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign Out
            </Button>
          )}

          <div className="flex items-center gap-1 rounded-full border border-green-400/30 bg-green-400/10 px-2 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 ai-pulse" />
            <span className="text-xs text-green-400 font-mono">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
