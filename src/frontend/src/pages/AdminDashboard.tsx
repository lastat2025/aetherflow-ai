import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Brain,
  CheckCircle,
  Database,
  DollarSign,
  Filter,
  Mail,
  PenLine,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PayPalButton from "../components/PayPalButton";
import {
  useAllTasks,
  useAnalytics,
  useGenerateTasks,
  useObjectives,
  usePayoutHistory,
  useSetObjective,
  useTriggerPayout,
  useWorkerStats,
} from "../hooks/useQueries";

const CATEGORIES = [
  "Content Writing",
  "Research",
  "Data Entry",
  "Social Media",
  "Web Scraping",
  "Translation",
];

const AGENTS = [
  {
    id: "content",
    name: "Content Agent",
    icon: PenLine,
    accent: "#a78bfa",
    desc: "Writes articles, product copy, social posts, and marketing content at scale.",
    categories: ["Content Writing", "Translation"],
  },
  {
    id: "data",
    name: "Data Agent",
    icon: Database,
    accent: "#60a5fa",
    desc: "Scrapes, organizes, and structures web data into clean, actionable datasets.",
    categories: ["Data Entry", "Web Scraping"],
  },
  {
    id: "research",
    name: "Research Agent",
    icon: Search,
    accent: "#4ade80",
    desc: "Discovers market trends, competitor insights, and business opportunities.",
    categories: ["Research"],
  },
  {
    id: "outreach",
    name: "Outreach Agent",
    icon: Mail,
    accent: "#fb923c",
    desc: "Drafts and queues personalized outreach campaigns to clients and partners.",
    categories: ["Social Media"],
  },
  {
    id: "manager",
    name: "Task Manager",
    icon: Brain,
    accent: "#00FFFF",
    desc: "Orchestrates all agents, prioritizes workflows, and ensures task execution.",
    categories: [],
  },
];

function StatusBadge({ status }: { status: string }) {
  const cls =
    {
      available: "status-available",
      claimed: "status-claimed",
      submitted: "status-submitted",
      approved: "status-approved",
      rejected: "status-rejected",
    }[status] ?? "";
  return (
    <Badge
      variant="outline"
      className={`${cls} text-xs border uppercase tracking-wide`}
    >
      {status}
    </Badge>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cls =
    {
      Easy: "difficulty-easy",
      Medium: "difficulty-medium",
      Hard: "difficulty-hard",
    }[difficulty] ?? "";
  return (
    <Badge variant="outline" className={`${cls} text-xs border`}>
      {difficulty}
    </Badge>
  );
}

export default function AdminDashboard({
  onAIRunning,
}: { onAIRunning?: (v: boolean) => void }) {
  const analytics = useAnalytics(true);
  const allTasks = useAllTasks();
  const objectives = useObjectives();
  const workerStats = useWorkerStats();
  const payoutHistory = usePayoutHistory();
  const generateTasks = useGenerateTasks();
  const setObjective = useSetObjective();
  const triggerPayout = useTriggerPayout();

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [triggeredPayouts, setTriggeredPayouts] = useState<
    Record<string, number>
  >({});
  const [objCategory, setObjCategory] = useState("");
  const [objDescription, setObjDescription] = useState("");
  const [objTargetCount, setObjTargetCount] = useState("10");

  const handleGenerateTasks = async () => {
    onAIRunning?.(true);
    try {
      const count = await generateTasks.mutateAsync();
      toast.success(`AI generated ${count.toString()} new tasks!`);
    } catch {
      toast.error("Failed to generate tasks.");
    } finally {
      onAIRunning?.(false);
    }
  };

  const handleSetObjective = async () => {
    if (!objCategory || !objDescription || !objTargetCount) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      const result = await setObjective.mutateAsync({
        category: objCategory,
        description: objDescription,
        targetCount: BigInt(objTargetCount),
      });
      toast.success(result || "Objective saved!");
      setObjDescription("");
      setObjTargetCount("10");
    } catch {
      toast.error("Failed to save objective.");
    }
  };

  const handleTriggerPayout = async (taskId: bigint, amount: number) => {
    try {
      const result = await triggerPayout.mutateAsync(taskId);
      toast.success(result || "Payout triggered!");
      setTriggeredPayouts((prev) => ({ ...prev, [taskId.toString()]: amount }));
    } catch {
      toast.error("Failed to trigger payout.");
    }
  };

  const filteredTasks = (allTasks.data ?? []).filter((t) => {
    const statusOk = statusFilter === "all" || t.status === statusFilter;
    const catOk = categoryFilter === "all" || t.category === categoryFilter;
    return statusOk && catOk;
  });

  const paidTaskIds = new Set(
    (payoutHistory.data ?? []).map((p) => p.taskId.toString()),
  );

  // Compute per-agent stats from tasks
  const tasks = allTasks.data ?? [];
  const agentStats = AGENTS.map((agent) => {
    const agentTasks =
      agent.categories.length > 0
        ? tasks.filter((t) => agent.categories.includes(t.category))
        : tasks;
    const completed = agentTasks.filter((t) => t.status === "approved").length;
    const earnings = agentTasks
      .filter((t) => t.status === "approved")
      .reduce((s, t) => s + t.rewardUSD, 0);
    const active = agentTasks.filter(
      (t) => t.status === "claimed" || t.status === "submitted",
    ).length;
    return { ...agent, completed, earnings, active, total: agentTasks.length };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass-card border-border/50 bg-transparent h-auto flex-wrap gap-1 p-1">
          <TabsTrigger
            value="overview"
            data-ocid="admin.overview_tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="agents"
            data-ocid="admin.agents_tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Agents
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            data-ocid="admin.tasks_tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All Tasks
          </TabsTrigger>
          <TabsTrigger
            value="workers"
            data-ocid="admin.workers_tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Workers
          </TabsTrigger>
          <TabsTrigger
            value="payouts"
            data-ocid="admin.payouts_tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Payouts
          </TabsTrigger>
        </TabsList>

        {/* ====== OVERVIEW ====== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">System Overview</h2>
            <Button
              onClick={handleGenerateTasks}
              disabled={generateTasks.isPending}
              className="bg-primary text-primary-foreground hover:opacity-90 cyan-glow"
              data-ocid="admin.generate_tasks.button"
            >
              {generateTasks.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Tasks
                </>
              )}
            </Button>
          </div>

          {analytics.isLoading ? (
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              data-ocid="analytics.loading_state"
            >
              {["a", "b", "c", "d"].map((_sk) => (
                <Skeleton key={_sk} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : analytics.isError ? (
            <div
              className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive"
              data-ocid="analytics.error_state"
            >
              Failed to load analytics. Please refresh.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Tasks Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-3xl font-bold text-primary cyan-text-glow">
                    {analytics.data?.totalTasksCreated?.toString() ?? "0"}
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Tasks Approved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-3xl font-bold text-green-400">
                    {analytics.data?.totalTasksApproved?.toString() ?? "0"}
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Total Paid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-3xl font-bold text-yellow-400">
                    ${(analytics.data?.totalEarningsPaid ?? 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" /> Active Workers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-3xl font-bold text-blue-400">
                    {analytics.data?.activeWorkers?.toString() ?? "0"}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Recent Task Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.slice(0, 8).map((task) => (
                  <div
                    key={task.id.toString()}
                    className="flex items-center justify-between rounded-md border border-border/30 bg-muted/20 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      {task.isAIWorker && (
                        <Bot className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-sm font-medium truncate max-w-xs">
                        {task.title}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {task.category}
                      </span>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-6">
                    No tasks yet. Click "Generate Tasks" to start the AI.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Objectives */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Set Objective
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="obj-category"
                    className="text-sm text-muted-foreground"
                  >
                    Category
                  </label>
                  <Select value={objCategory} onValueChange={setObjCategory}>
                    <SelectTrigger
                      id="obj-category"
                      data-ocid="objective.category.select"
                      className="bg-muted/30 border-border/50"
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="obj-desc"
                    className="text-sm text-muted-foreground"
                  >
                    Description
                  </label>
                  <Textarea
                    id="obj-desc"
                    data-ocid="objective.description.input"
                    placeholder="Describe the objective..."
                    value={objDescription}
                    onChange={(e) => setObjDescription(e.target.value)}
                    className="bg-muted/30 border-border/50 resize-none"
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="obj-count"
                    className="text-sm text-muted-foreground"
                  >
                    Target Task Count
                  </label>
                  <Input
                    id="obj-count"
                    data-ocid="objective.count.input"
                    type="number"
                    min="1"
                    value={objTargetCount}
                    onChange={(e) => setObjTargetCount(e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
                <Button
                  onClick={handleSetObjective}
                  disabled={setObjective.isPending}
                  className="w-full bg-primary text-primary-foreground hover:opacity-90"
                  data-ocid="objective.save_button"
                >
                  {setObjective.isPending ? "Saving..." : "Save Objective"}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Current Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                {objectives.isLoading ? (
                  <div className="space-y-2">
                    {["s1", "s2", "s3"].map((_sk) => (
                      <Skeleton key={_sk} className="h-16" />
                    ))}
                  </div>
                ) : (objectives.data ?? []).length === 0 ? (
                  <p
                    className="text-center text-muted-foreground py-6"
                    data-ocid="objectives.empty_state"
                  >
                    No objectives set yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(objectives.data ?? []).map((obj) => (
                      <div
                        key={obj.category}
                        className="rounded-lg border border-border/40 bg-muted/20 p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant="outline"
                            className="text-primary border-primary/30 text-xs"
                          >
                            {obj.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Target: {obj.targetTaskCount.toString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {obj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ====== AGENTS ====== */}
        <TabsContent value="agents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">AI Agent Fleet</h2>
            <Button
              onClick={handleGenerateTasks}
              disabled={generateTasks.isPending}
              className="bg-primary text-primary-foreground hover:opacity-90 cyan-glow"
              data-ocid="agents.run_button"
            >
              {generateTasks.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Running Agents...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run All Agents
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {agentStats.map((agent) => {
              const Icon = agent.icon;
              const isActive = agent.active > 0 || generateTasks.isPending;
              return (
                <Card
                  key={agent.id}
                  className="glass-card flex flex-col relative overflow-hidden"
                  style={{ borderColor: `${agent.accent}35` }}
                >
                  {/* glow bar at top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${agent.accent}, transparent)`,
                    }}
                  />

                  <CardHeader className="pb-3">
                    <div
                      className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border"
                      style={{
                        background: `${agent.accent}18`,
                        borderColor: `${agent.accent}40`,
                      }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: agent.accent }}
                      />
                    </div>
                    <CardTitle className="font-display text-base">
                      {agent.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {agent.desc}
                    </p>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-3 flex-1">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-lg bg-muted/30 p-2">
                        <div
                          className="font-mono text-lg font-bold"
                          style={{ color: agent.accent }}
                        >
                          {agent.completed}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Completed
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2">
                        <div className="font-mono text-lg font-bold text-yellow-400">
                          ${agent.earnings.toFixed(0)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Earned
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div
                        className="flex items-center gap-1.5 text-xs font-mono"
                        style={{
                          color: isActive
                            ? agent.accent
                            : "oklch(0.55 0.04 258)",
                        }}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isActive ? "ai-pulse" : ""}`}
                          style={{
                            background: isActive
                              ? agent.accent
                              : "oklch(0.4 0.04 258)",
                          }}
                        />
                        {isActive ? "ACTIVE" : "IDLE"}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {agent.total} jobs
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Live feed */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400 ai-pulse" />
                Agent Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                {tasks.slice(0, 12).map((task) => {
                  const agent =
                    AGENTS.find((a) => a.categories.includes(task.category)) ??
                    AGENTS[4];
                  return (
                    <div
                      key={task.id.toString()}
                      className="flex items-center gap-3 rounded-md border border-border/20 bg-muted/10 px-3 py-2 text-sm"
                    >
                      <div
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ background: agent.accent }}
                      />
                      <span className="text-xs text-muted-foreground w-28 flex-shrink-0">
                        {agent.name}
                      </span>
                      <span className="flex-1 truncate">{task.title}</span>
                      <StatusBadge status={task.status} />
                    </div>
                  );
                })}
                {tasks.length === 0 && (
                  <p
                    className="text-center text-muted-foreground py-6"
                    data-ocid="agents.activity.empty_state"
                  >
                    No agent activity yet. Click "Run All Agents" to start.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== ALL TASKS ====== */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold">All Tasks</h2>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className="w-36 bg-muted/30 border-border/50"
                  data-ocid="tasks.filter.tab"
                >
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {[
                    "available",
                    "claimed",
                    "submitted",
                    "approved",
                    "rejected",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Card className="glass-card overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <Table data-ocid="tasks.table">
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Title
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Difficulty
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Reward
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground">AI</TableHead>
                    <TableHead className="text-muted-foreground">
                      Score
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTasks.isLoading ? (
                    ["s1", "s2", "s3", "s4", "s5"].map((_sk) => (
                      <TableRow key={_sk} className="border-border/30">
                        {["c1", "c2", "c3", "c4", "c5", "c6", "c7"].map(
                          (_sc) => (
                            <TableCell key={_sc}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ),
                        )}
                      </TableRow>
                    ))
                  ) : filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-10"
                        data-ocid="tasks.empty_state"
                      >
                        No tasks found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task, i) => (
                      <TableRow
                        key={task.id.toString()}
                        className="border-border/30 hover:bg-muted/20"
                        data-ocid={`tasks.row.item.${i + 1}`}
                      >
                        <TableCell className="font-medium max-w-xs">
                          <span className="truncate block">{task.title}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {task.category}
                        </TableCell>
                        <TableCell>
                          <DifficultyBadge difficulty={task.difficulty} />
                        </TableCell>
                        <TableCell className="text-yellow-400 font-semibold font-mono">
                          ${task.rewardUSD.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={task.status} />
                        </TableCell>
                        <TableCell>
                          {task.isAIWorker ? (
                            <Bot className="h-4 w-4 text-primary" />
                          ) : null}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm font-mono">
                          {task.aiScore !== undefined
                            ? task.aiScore.toString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ====== WORKERS ====== */}
        <TabsContent value="workers" className="space-y-4">
          <h2 className="font-display text-2xl font-bold">
            Worker Performance
          </h2>
          <Card className="glass-card overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <Table data-ocid="workers.table">
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Worker (Principal)
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Tasks Completed
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Total Earned
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workerStats.isLoading ? (
                    ["s1", "s2", "s3"].map((_sk) => (
                      <TableRow key={_sk} className="border-border/30">
                        {["c1", "c2", "c3"].map((_sc) => (
                          <TableCell key={_sc}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (workerStats.data ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-10"
                        data-ocid="workers.empty_state"
                      >
                        No worker data yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (workerStats.data ?? []).map(
                      ([principal, completed, earned], i) => {
                        const p = principal.toString();
                        const short = `${p.slice(0, 8)}...${p.slice(-6)}`;
                        return (
                          <TableRow
                            key={p}
                            className="border-border/30 hover:bg-muted/20"
                            data-ocid={`workers.row.item.${i + 1}`}
                          >
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {short}
                            </TableCell>
                            <TableCell className="text-primary font-semibold font-mono">
                              {completed.toString()}
                            </TableCell>
                            <TableCell className="text-yellow-400 font-semibold font-mono">
                              ${earned.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ====== PAYOUTS ====== */}
        <TabsContent value="payouts" className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Payout Management</h2>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Approved Tasks — Pending Payout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks
                .filter(
                  (t) =>
                    t.status === "approved" &&
                    !paidTaskIds.has(t.id.toString()),
                )
                .map((task, i) => (
                  <div
                    key={task.id.toString()}
                    className="rounded-lg border border-green-400/20 bg-green-400/5 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.category} · {task.difficulty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold font-mono">
                          ${task.rewardUSD.toFixed(2)}
                        </p>
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                    {task.rewardUSD < 5 ? (
                      <p className="text-xs text-muted-foreground">
                        Minimum payout is $5.00. Reward is below threshold.
                      </p>
                    ) : triggeredPayouts[task.id.toString()] ? (
                      <PayPalButton
                        amount={triggeredPayouts[task.id.toString()]}
                        taskId={task.id}
                      />
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleTriggerPayout(task.id, task.rewardUSD)
                        }
                        disabled={triggerPayout.isPending}
                        className="bg-green-500/20 text-green-400 border border-green-400/40 hover:bg-green-400/20"
                        data-ocid={`payout.trigger_button.${i + 1}`}
                      >
                        <DollarSign className="mr-1.5 h-3.5 w-3.5" />
                        Trigger Payout
                      </Button>
                    )}
                  </div>
                ))}
              {tasks.filter(
                (t) =>
                  t.status === "approved" && !paidTaskIds.has(t.id.toString()),
              ).length === 0 && (
                <p
                  className="text-center text-muted-foreground py-6"
                  data-ocid="payouts.empty_state"
                >
                  No pending payouts.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Payout History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto scrollbar-thin">
                <Table data-ocid="payouts.table">
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Task ID
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Worker
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Amount
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutHistory.isLoading ? (
                      ["s1", "s2", "s3"].map((_sk) => (
                        <TableRow key={_sk} className="border-border/30">
                          {["c1", "c2", "c3", "c4"].map((_sc) => (
                            <TableCell key={_sc}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (payoutHistory.data ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-10"
                        >
                          No payouts recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (payoutHistory.data ?? []).map((payout) => {
                        const w = payout.worker.toString();
                        const date = new Date(Number(payout.triggeredAt) / 1e6);
                        return (
                          <TableRow
                            key={payout.taskId.toString()}
                            className="border-border/30 hover:bg-muted/20"
                          >
                            <TableCell className="font-mono text-xs">
                              #{payout.taskId.toString()}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {`${w.slice(0, 8)}...${w.slice(-4)}`}
                            </TableCell>
                            <TableCell className="text-yellow-400 font-semibold font-mono">
                              ${payout.amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {date.toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
