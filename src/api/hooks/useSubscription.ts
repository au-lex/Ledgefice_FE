// src/api/hooks/useSubscription.ts
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import api from "../lib/axios";
import type { APIError } from "../lib/types";

// ── Types ──────────────────────────────────────────────────────────────────

export type PlanType = "starter" | "business" | "enterprise";

export interface PlanFeatures {
  multi_step_approvals: boolean;
  department_permissions: boolean;
  full_reporting_dashboard: boolean;
  audit_log_export: boolean;
  priority_support: boolean;
}

export interface PlanConfig {
  name: string;
  max_departments: number; // -1 = unlimited
  max_users: number; // -1 = unlimited
  monthly_price: number; // kobo
  yearly_price: number; // kobo, per month equivalent
  features: PlanFeatures;
}

export interface PlanOption {
  plan: PlanType;
  config: PlanConfig;
  is_current: boolean;
}

export type SubscriptionStatus = "pending" | "paid" | "failed";

export interface SubscriptionSummary {
  id: string;
  status: SubscriptionStatus;
  order_reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  renews_at: string | null;
  dunning_stage: string;
  cancelled_at: string | null;
}

export interface MyPlanResponse {
  current_plan: PlanType;
  plans: PlanOption[];
  subscription?: SubscriptionSummary;
}

export interface UpgradePayload {
  plan: PlanType;
  billing_cycle: "monthly" | "yearly";
}

export interface UpgradeResponse {
  checkout_link: string;
  order_reference: string;
}

export interface SubscriptionHistoryItem {
  id: string;
  plan: PlanType;
  amount: number;
  currency: string;
  order_reference: string;
  status: SubscriptionStatus;
  paid_at: string | null;
  renews_at: string | null;
  dunning_stage: string;
  cancelled_at: string | null;
  created_at: string;
}

export interface SubscriptionHistoryResponse {
  history: SubscriptionHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface SubscriptionHistoryParams {
  page?: number;
  limit?: number;
}

export interface TokenizedCard {
  card_pan: string;
  card_type: string;
  token_key: string;
}

export interface MyLiveTokenResponse {
  has_token: boolean;
  cards?: TokenizedCard[];
  message?: string;
}

export interface MyTokenResponse {
  has_token: boolean;
  subscription_id?: string;
  token_key?: string;
  card_type?: string;
  card_pan?: string;
  message?: string;
}

export interface DeleteTokenResponse {
  message: string;
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const subscriptionKeys = {
  all: ["subscription"] as const,
  myPlan: () => [...subscriptionKeys.all, "my-plan"] as const,
  myHistory: (params: SubscriptionHistoryParams) =>
    [...subscriptionKeys.all, "my-history", params] as const,
  myLiveToken: () => [...subscriptionKeys.all, "my-live-token"] as const,
  myToken: () => [...subscriptionKeys.all, "my-token"] as const,
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

const getErrorMessage = (
  error: AxiosError<APIError> | any,
  defaultMessage = "An error occurred",
) => error?.response?.data?.message || error?.message || defaultMessage;

// ── HOOKS ──────────────────────────────────────────────────────────────────

export function useMyPlan() {
  return useQuery<MyPlanResponse, AxiosError<APIError>>({
    queryKey: subscriptionKeys.myPlan(),
    queryFn: async () => {
      const { data } = await api.get<MyPlanResponse>("/subscriptions/me/plan");
      return data;
    },
  });
}

export function useUpgradePlan() {
  const queryClient = useQueryClient();

  return useMutation<UpgradeResponse, AxiosError<APIError>, UpgradePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<UpgradeResponse>(
        "/subscriptions/me/upgrade",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.myPlan() });
      toast.success("Redirecting to checkout...");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to start upgrade"));
    },
  });
}

export function useMyHistory(params: SubscriptionHistoryParams = {}) {
  const { page = 1, limit = 20 } = params;

  return useQuery<SubscriptionHistoryResponse, AxiosError<APIError>>({
    queryKey: subscriptionKeys.myHistory({ page, limit }),
    queryFn: async () => {
      const { data } = await api.get<SubscriptionHistoryResponse>(
        "/subscriptions/me/history",
        { params: { page, limit } },
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });
}




export function useMyToken() {
  return useQuery<MyTokenResponse, AxiosError<APIError>>({
    queryKey: subscriptionKeys.myToken(),
    queryFn: async () => {
      const { data } = await api.get<MyTokenResponse>("/subscriptions/me/token");
      return data;
    },
  });
}



export function useDeleteMyToken() {
  const queryClient = useQueryClient();

  return useMutation<DeleteTokenResponse, AxiosError<APIError>, void>({
    mutationFn: async () => {
      const { data } = await api.delete<DeleteTokenResponse>(
        "/subscriptions/me/token",
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.myLiveToken() });
      toast.success("Card removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to remove card"));
    },
  });
}