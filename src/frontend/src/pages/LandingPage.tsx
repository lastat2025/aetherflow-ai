import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  CheckCircle,
  Cpu,
  Database,
  DollarSign,
  Loader2,
  Mail,
  PenLine,
  Search,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAnalytics } from "../hooks/useQueries";

const AGENTS = [
  {
    id: "content",
    name: "Content Agent",
    icon: PenLine,
    description:
      "Autonomously writes articles, product descriptions, social copy, and marketing content at scale.",
    accent: "#a78bfa",
    accentOklch: "0.7 0.22 295",
    category: "Content Writing",
    badge: "WRITING",
  },
  {
    id: "data",
    name: "Data Agent",
    icon: Database,
    description:
      "Scrapes, organizes, and structures web data into clean, actionable datasets for clients.",
    accent: "#60a5fa",
    accentOklch: "0.65 0.18 245",
    category: "Data Entry",
    badge: "SCRAPING",
  },
  {
    id: "research",
    name: "Research Agent",
    icon: Search,
    description:
      "Discovers market trends, competitor insights, and business opportunities on demand.",
    accent: "#4ade80",
    accentOklch: "0.72 0.2 142",
    category: "Research",
    badge: "DISCOVERY",
  },
  {
    id: "outreach",
    name: "Outreach Agent",
    icon: Mail,
    description:
      "Drafts and queues personalized outreach campaigns to potential clients and partners.",
    accent: "#fb923c",
    accentOklch: "0.75 0.18 55",
    category: "Social Media",
    badge: "OUTREACH",
  },
  {
    id: "manager",
    name: "Task Manager",
    icon: Brain,
    description:
      "Orchestrates all agents, prioritizes workflows, and ensures seamless task execution.",
    accent: "#00FFFF",
    accentOklch: "0.9 0.18 196",
    category: "Management",
    badge: "ORCHESTRATOR",
  },
];

const STEPS = [
  {
    num: "01",
    title: "AI Generates Tasks",
    desc: "The Task Manager Agent analyzes your objectives and spawns work across all specialized agents automatically.",
    icon: Cpu,
  },
  {
    num: "02",
    title: "Agents Execute",
    desc: "Each specialized agent picks up its assigned tasks, produces real output, and submits for review — no human needed.",
    icon: Zap,
  },
  {
    num: "03",
    title: "Earnings Paid Out",
    desc: "Approved work triggers automatic PayPal payouts. Money flows directly to your account, 24/7.",
    icon: DollarSign,
  },
];

function StatBar() {
  const analytics = useAnalytics(true);
  const data = analytics.data;

  const stats = [
    {
      label: "Tasks Created",
      value: data?.totalTasksCreated?.toString() ?? "—",
      icon: TrendingUp,
    },
    {
      label: "Tasks Approved",
      value: data?.totalTasksApproved?.toString() ?? "—",
      icon: CheckCircle,
    },
    {
      label: "Active Workers",
      value: data?.activeWorkers?.toString() ?? "—",
      icon: Users,
    },
    {
      label: "Total Paid Out",
      value: data ? `$${data.totalEarningsPaid.toFixed(2)}` : "—",
      icon: DollarSign,
    },
  ];

  return (
    <div className="border-t border-b border-primary/20 bg-primary/5 py-4">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
              <span className="font-mono text-xl font-bold text-primary cyan-text-glow">
                {analytics.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  value
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      {/* ---- NAV ---- */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/40">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              AetherFlow<span className="text-primary"> AI</span>
            </span>
            <Badge
              variant="outline"
              className="border-green-400/40 text-green-400 text-xs hidden sm:flex"
            >
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-400 inline-block ai-pulse" />
              LIVE
            </Badge>
          </div>
          <Button
            size="sm"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="bg-primary text-primary-foreground hover:opacity-90 cyan-glow"
            data-ocid="nav.dashboard_link"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>Launch Dashboard</>
            )}
          </Button>
        </div>
      </header>

      {/* ---- HERO ---- */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* animated grid */}
        <div
          className="pointer-events-none absolute inset-0 grid-bg opacity-100"
          style={{
            animationName: "grid-scroll",
            animationDuration: "8s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        />
        {/* glow orbs */}
        <div
          className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full blur-[120px] opacity-20"
          style={{ background: "oklch(0.9 0.18 196)" }}
        />
        <div
          className="pointer-events-none absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full blur-[100px] opacity-15"
          style={{ background: "oklch(0.7 0.22 295)" }}
        />

        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="outline"
              className="mb-6 border-primary/40 bg-primary/10 text-primary text-xs px-4 py-1.5 tracking-widest"
            >
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary inline-block ai-pulse" />
              FULLY AUTOMATED SYSTEM
            </Badge>
          </motion.div>

          <motion.h1
            className="font-display text-5xl font-black tracking-tight sm:text-7xl leading-none mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="block text-foreground">AetherFlow</span>
            <span className="block text-primary cyan-text-glow">AI</span>
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Fully Automated Income Generation.
            <br />
            <span className="text-foreground/80">
              5 AI agents. Zero manual work. Real PayPal payouts.
            </span>
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={() => login()}
              disabled={isLoggingIn}
              className="h-14 px-10 text-base font-bold bg-primary text-primary-foreground hover:opacity-90 cyan-glow"
              data-ocid="hero.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Launch Dashboard
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              Secured by Internet Identity · No passwords
            </span>
          </motion.div>
        </div>

        {/* scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="h-10 w-px bg-gradient-to-b from-primary/60 to-transparent" />
          <span className="text-xs text-muted-foreground tracking-widest">
            SCROLL
          </span>
        </motion.div>
      </section>

      {/* ---- STATS BAR ---- */}
      <StatBar />

      {/* ---- HOW IT WORKS ---- */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl font-bold mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Three steps from zero to automated income. No manual intervention
              required.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ num, title, desc, icon: Icon }, i) => (
              <motion.div
                key={num}
                className="relative glass-card rounded-2xl p-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="mb-4 font-mono text-5xl font-black text-primary/20 leading-none">
                  {num}
                </div>
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
                {i < 2 && (
                  <div className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 text-primary/40 text-2xl z-10">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- AGENTS ---- */}
      <section className="py-24 px-6 border-t border-border/30">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl font-bold mb-4">
              Meet the <span className="text-primary">Agents</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Five specialized AI agents running 24/7, each mastering a
              different domain of income generation.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {AGENTS.map(
              ({ id, name, icon: Icon, description, accent, badge }, i) => (
                <motion.div
                  key={id}
                  className="glass-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    borderColor: `${accent}30`,
                    // @ts-ignore
                    "--agent-accent": accent,
                  }}
                >
                  {/* glow on hover */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                    style={{ boxShadow: `inset 0 0 40px ${accent}18` }}
                  />

                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl border"
                    style={{
                      background: `${accent}18`,
                      borderColor: `${accent}40`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: accent }} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-sm font-bold">{name}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5 mb-2"
                      style={{
                        color: accent,
                        borderColor: `${accent}50`,
                        background: `${accent}10`,
                      }}
                    >
                      {badge}
                    </Badge>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>

                  <div
                    className="mt-auto flex items-center gap-1.5 text-xs font-mono"
                    style={{ color: accent }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full ai-pulse"
                      style={{ background: accent }}
                    />
                    ACTIVE
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="py-24 px-6 border-t border-border/30">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10 cyan-glow floating">
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">
            Ready to{" "}
            <span className="text-primary cyan-text-glow">Automate?</span>
          </h2>
          <p className="text-muted-foreground mb-10">
            Connect your account and let AetherFlow AI's agents start generating
            income for you — fully on autopilot.
          </p>
          <Button
            size="lg"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="h-14 px-12 text-base font-bold bg-primary text-primary-foreground hover:opacity-90 cyan-glow"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Launch Dashboard Now
              </>
            )}
          </Button>
        </motion.div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="border-t border-border/30 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AetherFlow AI. Built with ❤ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
