import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    isAIWorker: boolean;
    status: string;
    title: string;
    submittedResult?: string;
    difficulty: string;
    createdAt: bigint;
    description: string;
    claimedBy?: Principal;
    rewardUSD: number;
    category: string;
    aiScore?: bigint;
}
export interface PayoutRecord {
    taskId: bigint;
    triggeredAt: bigint;
    worker: Principal;
    amount: number;
}
export interface Analytics {
    totalEarningsPaid: number;
    totalTasksApproved: bigint;
    activeWorkers: bigint;
    totalTasksCreated: bigint;
}
export interface Objective {
    description: string;
    category: string;
    targetTaskCount: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimTask(taskId: bigint): Promise<string>;
    generateTasks(): Promise<bigint>;
    getAllTasks(): Promise<Array<Task>>;
    getAnalytics(): Promise<Analytics>;
    getAvailableTasks(): Promise<Array<Task>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyTasks(): Promise<Array<Task>>;
    getObjectives(): Promise<Array<Objective>>;
    getPayoutHistory(): Promise<Array<PayoutRecord>>;
    getTask(taskId: bigint): Promise<Task | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkerStats(): Promise<Array<[Principal, bigint, number]>>;
    initializeDefaultObjectives(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setObjective(category: string, description: string, targetCount: bigint): Promise<string>;
    submitTask(taskId: bigint, result: string): Promise<string>;
    triggerPayout(taskId: bigint): Promise<string>;
}
