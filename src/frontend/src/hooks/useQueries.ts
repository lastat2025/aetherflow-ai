import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Analytics,
  Objective,
  PayoutRecord,
  Task,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useAnalytics(autoRefresh = false) {
  const { actor, isFetching } = useActor();
  return useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor)
        return {
          totalEarningsPaid: 0,
          totalTasksApproved: 0n,
          activeWorkers: 0n,
          totalTasksCreated: 0n,
        };
      return actor.getAnalytics();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: autoRefresh ? 30000 : false,
  });
}

export function useAllTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["allTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAvailableTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["availableTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableTasks();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 20000,
  });
}

export function useMyTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["myTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTasks();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useObjectives() {
  const { actor, isFetching } = useActor();
  return useQuery<Objective[]>({
    queryKey: ["objectives"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getObjectives();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWorkerStats() {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<[import("@icp-sdk/core/principal").Principal, bigint, number]>
  >({
    queryKey: ["workerStats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkerStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePayoutHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<PayoutRecord[]>({
    queryKey: ["payoutHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPayoutHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateTasks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.generateTasks();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      queryClient.invalidateQueries({ queryKey: ["availableTasks"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useSetObjective() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      category,
      description,
      targetCount,
    }: { category: string; description: string; targetCount: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setObjective(category, description, targetCount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
    },
  });
}

export function useClaimTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.claimTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableTasks"] });
      queryClient.invalidateQueries({ queryKey: ["myTasks"] });
    },
  });
}

export function useSubmitTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      result,
    }: { taskId: bigint; result: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitTask(taskId, result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTasks"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useTriggerPayout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.triggerPayout(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payoutHistory"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });
}

export function useInitializeObjectives() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.initializeDefaultObjectives();
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: {
      user: import("@icp-sdk/core/principal").Principal;
      role: import("../backend.d").UserRole;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRole"] });
    },
  });
}
