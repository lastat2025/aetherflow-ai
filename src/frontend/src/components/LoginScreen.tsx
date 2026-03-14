import { Button } from "@/components/ui/button";
import { Cpu, Loader2, Shield, TrendingUp, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, isLoggingIn, isLoginError } = useInternetIdentity();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(oklch(0.88 0.16 195) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.88 0.16 195) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
        <div className="mb-8 flex justify-center">
          <img
            src="/assets/generated/aetherflow-logo-transparent.dim_300x80.png"
            alt="AetherFlow AI"
            className="h-16 w-auto"
          />
        </div>

        <h1 className="font-display text-4xl font-bold text-center mb-3 leading-tight">
          Automate.
          <br />
          <span className="text-primary cyan-text-glow">Analyze. Earn.</span>
        </h1>
        <p className="text-muted-foreground text-center mb-10 max-w-sm">
          The autonomous income generation ecosystem powered by AI. Tasks
          created, reviewed, and paid — automatically.
        </p>

        <div className="grid grid-cols-3 gap-3 w-full mb-10">
          {[
            { icon: Cpu, label: "AI Task Generation" },
            { icon: Shield, label: "Auto-Approval" },
            { icon: TrendingUp, label: "Automated Payouts" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass-card rounded-xl p-4 text-center">
              <Icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <Button
          size="lg"
          onClick={() => login()}
          disabled={isLoggingIn}
          className="w-full max-w-xs bg-primary text-primary-foreground text-base font-semibold hover:opacity-90 cyan-glow h-12"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Connect & Enter
            </>
          )}
        </Button>

        {isLoginError && (
          <p className="mt-3 text-sm text-destructive">
            Login failed. Please try again.
          </p>
        )}

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Secured by Internet Identity. No passwords required.
        </p>
      </div>
    </div>
  );
}
