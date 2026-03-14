import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  Bot,
  CheckCircle,
  DollarSign,
  Loader2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Task } from "../backend.d";
import {
  useAnalytics,
  useAvailableTasks,
  useClaimTask,
  useMyTasks,
  useSubmitTask,
} from "../hooks/useQueries";

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

function TaskCard({
  task,
  index,
  onClaim,
  isClaiming,
}: {
  task: Task;
  index: number;
  onClaim: (id: bigint) => void;
  isClaiming: boolean;
}) {
  return (
    <Card className="glass-card transition-all duration-300 hover:scale-[1.01] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {task.isAIWorker && (
                <Badge
                  variant="outline"
                  className="text-primary border-primary/30 text-xs"
                >
                  <Bot className="mr-1 h-3 w-3" />
                  AI Task
                </Badge>
              )}
              <DifficultyBadge difficulty={task.difficulty} />
            </div>
            <CardTitle className="text-base leading-tight">
              {task.title}
            </CardTitle>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-yellow-400 font-bold">
              ${task.rewardUSD.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">USD</p>
          </div>
        </div>
        <CardDescription className="text-xs">{task.category}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-4">
          {task.description}
        </p>
        <Button
          size="sm"
          onClick={() => onClaim(task.id)}
          disabled={isClaiming}
          className="w-full bg-primary text-primary-foreground hover:opacity-90"
          data-ocid={`task.claim_button.${index + 1}`}
        >
          {isClaiming ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Claiming...
            </>
          ) : (
            "Claim Task"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function SubmitTaskForm({ task }: { task: Task }) {
  const [result, setResult] = useState("");
  const [submitResult, setSubmitResult] = useState<string | null>(null);
  const submitTask = useSubmitTask();

  const handleSubmit = async () => {
    if (!result.trim()) {
      toast.error("Please enter your work result.");
      return;
    }
    try {
      const res = await submitTask.mutateAsync({ taskId: task.id, result });
      setSubmitResult(res);
      toast.success("Work submitted! AI is reviewing...");
    } catch {
      toast.error("Failed to submit. Please try again.");
    }
  };

  if (submitResult) {
    const isApproved =
      submitResult.toLowerCase().includes("approved") ||
      submitResult.toLowerCase().includes("success");
    return (
      <div
        className={`rounded-lg border p-4 ${isApproved ? "border-green-400/30 bg-green-400/5" : "border-red-400/30 bg-red-400/5"}`}
      >
        <div className="flex items-center gap-2 mb-2">
          {isApproved ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400" />
          )}
          <span
            className={`font-semibold ${isApproved ? "text-green-400" : "text-red-400"}`}
          >
            {isApproved ? "Approved!" : "Rejected"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{submitResult}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Textarea
        data-ocid="task.result.textarea"
        placeholder="Enter your completed work result here..."
        value={result}
        onChange={(e) => setResult(e.target.value)}
        className="bg-muted/30 border-border/50 min-h-24 resize-none"
        rows={4}
      />
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={submitTask.isPending}
        className="bg-primary text-primary-foreground hover:opacity-90"
        data-ocid="task.submit_button"
      >
        {submitTask.isPending ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Work"
        )}
      </Button>
    </div>
  );
}

export default function WorkerPortal() {
  const availableTasks = useAvailableTasks();
  const myTasks = useMyTasks();
  const analytics = useAnalytics();
  const claimTask = useClaimTask();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = async (taskId: bigint) => {
    setClaimingId(taskId.toString());
    try {
      const result = await claimTask.mutateAsync(taskId);
      toast.success(result || "Task claimed!");
    } catch {
      toast.error("Failed to claim task.");
    } finally {
      setClaimingId(null);
    }
  };

  const myTasksGrouped = {
    active: (myTasks.data ?? []).filter((t) => t.status === "claimed"),
    submitted: (myTasks.data ?? []).filter((t) => t.status === "submitted"),
    done: (myTasks.data ?? []).filter(
      (t) => t.status === "approved" || t.status === "rejected",
    ),
  };

  const totalEarned = (myTasks.data ?? [])
    .filter((t) => t.status === "approved")
    .reduce((sum, t) => sum + t.rewardUSD, 0);

  const completedCount = (myTasks.data ?? []).filter(
    (t) => t.status === "approved",
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="glass-card border-border/50 bg-transparent h-auto p-1">
          <TabsTrigger
            value="available"
            data-ocid="worker.available.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Available Tasks
          </TabsTrigger>
          <TabsTrigger
            value="mytasks"
            data-ocid="worker.my_tasks.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            My Tasks
            {myTasksGrouped.active.length > 0 && (
              <Badge className="ml-2 h-5 min-w-5 bg-primary/20 text-primary border-primary/30 text-xs">
                {myTasksGrouped.active.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="earnings"
            data-ocid="worker.earnings.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Earnings
          </TabsTrigger>
        </TabsList>

        {/* AVAILABLE TASKS */}
        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Available Tasks</h2>
            <span className="text-sm text-muted-foreground">
              {availableTasks.isLoading
                ? "Loading..."
                : `${(availableTasks.data ?? []).length} tasks available`}
            </span>
          </div>

          {availableTasks.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((_sk) => (
                <Skeleton key={_sk} className="h-52 rounded-lg" />
              ))}
            </div>
          ) : (availableTasks.data ?? []).length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              data-ocid="worker.available.empty_state"
            >
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                No tasks available right now
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                The AI is generating new tasks. Check back soon or ask an admin
                to generate tasks.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(availableTasks.data ?? []).map((task, i) => (
                <TaskCard
                  key={task.id.toString()}
                  task={task}
                  index={i}
                  onClaim={handleClaim}
                  isClaiming={claimingId === task.id.toString()}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* MY TASKS */}
        <TabsContent value="mytasks" className="space-y-6">
          <h2 className="font-display text-2xl font-bold">My Tasks</h2>

          {myTasks.isLoading ? (
            <div className="space-y-3">
              {["s1", "s2", "s3"].map((_sk) => (
                <Skeleton key={_sk} className="h-36 rounded-lg" />
              ))}
            </div>
          ) : (myTasks.data ?? []).length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              data-ocid="worker.my_tasks.empty_state"
            >
              <Award className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                No active tasks
              </h3>
              <p className="text-muted-foreground text-sm">
                Claim a task from the Available Tasks tab to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {myTasksGrouped.active.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-primary">
                    Active — Submit Your Work
                  </h3>
                  {myTasksGrouped.active.map((task) => (
                    <Card key={task.id.toString()} className="glass-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {task.title}
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                              {task.category} · ${task.rewardUSD.toFixed(2)}{" "}
                              reward
                            </CardDescription>
                          </div>
                          <StatusBadge status={task.status} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {task.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <SubmitTaskForm task={task} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {myTasksGrouped.submitted.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-blue-400">
                    Submitted — AI Reviewing
                  </h3>
                  {myTasksGrouped.submitted.map((task) => (
                    <Card
                      key={task.id.toString()}
                      className="glass-card border-blue-400/20"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {task.title}
                          </CardTitle>
                          <StatusBadge status={task.status} />
                        </div>
                        <CardDescription>
                          {task.category} · ${task.rewardUSD.toFixed(2)} reward
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {myTasksGrouped.done.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    Completed
                  </h3>
                  {myTasksGrouped.done.map((task) => (
                    <Card
                      key={task.id.toString()}
                      className={`glass-card ${task.status === "approved" ? "border-green-400/20" : "border-red-400/20"}`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {task.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {task.category}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.aiScore !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                AI Score: {task.aiScore.toString()}
                              </span>
                            )}
                            <StatusBadge status={task.status} />
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* EARNINGS */}
        <TabsContent value="earnings" className="space-y-6">
          <h2 className="font-display text-2xl font-bold">My Earnings</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Tasks Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-display text-4xl font-bold text-primary cyan-text-glow">
                  {completedCount}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Total Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-display text-4xl font-bold text-yellow-400">
                  ${totalEarned.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Platform Total Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-display text-4xl font-bold text-green-400">
                  ${(analytics.data?.totalEarningsPaid ?? 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {completedCount > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Completed Task History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(myTasks.data ?? [])
                  .filter((t) => t.status === "approved")
                  .map((task) => (
                    <div
                      key={task.id.toString()}
                      className="flex items-center justify-between rounded-md border border-green-400/20 bg-green-400/5 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.category}
                        </p>
                      </div>
                      <span className="text-yellow-400 font-semibold">
                        ${task.rewardUSD.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
