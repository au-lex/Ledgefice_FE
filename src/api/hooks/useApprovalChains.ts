// src/api/hooks/useApprovalChains.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import api from "../lib/axios";
import type { APIError } from "../lib/types";

// ── Types ──────────────────────────────────────────────────────────────────

export interface DepartmentSummary {
  id: string;
  name: string;
  code: string;
}

export interface ApproverStep {
  id: string;
  created_at: string;
  updated_at: string;
  amount_tier_id: string;
  department_id: string;
  department: DepartmentSummary | null;
  step_order: number;
}

export interface AmountTier {
  id: string;
  created_at: string;
  updated_at: string;
  approval_chain_id: string;
  label: string;
  min_amount: number;
  max_amount: number | null;
  sort_order: number;
  steps: ApproverStep[];
}

export interface VoucherTypeSummary {
  id: string;
  name: string;
  description: string;
}

export interface ApprovalChain {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  voucher_type_id: string;
  voucher_type: VoucherTypeSummary | null;
  tiers: AmountTier[];
}

// ── Payloads ───────────────────────────────────────────────────────────────

export interface ApproverStepInput {
  department_id: string;
  step_order: number;
}

export interface AmountTierInput {
  label: string;
  min_amount: number;
  max_amount?: number | null;
  sort_order?: number;
  steps: ApproverStepInput[];
}

export interface CreateApprovalChainPayload {
  voucher_type_id: string;
  tiers: AmountTierInput[];
}

export type UpdateApprovalChainPayload = Omit<CreateApprovalChainPayload, "voucher_type_id"> & {
  voucher_type_id?: string;
};

// ── Query Keys ─────────────────────────────────────────────────────────────

export const approvalChainKeys = {
  all: ["approval-chains"] as const,
  list: () => [...approvalChainKeys.all, "list"] as const,
  detail: (id: string) => [...approvalChainKeys.all, id] as const,
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

const getErrorMessage = (
  error: AxiosError<APIError> | any,
  defaultMessage = "An error occurred",
) => error?.response?.data?.message || error?.message || defaultMessage;

// ── HOOKS ──────────────────────────────────────────────────────────────────

export function useListApprovalChains() {
  return useQuery<ApprovalChain[], AxiosError<APIError>>({
    queryKey: approvalChainKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<{ data: ApprovalChain[] }>("/approval-chains");
      return data.data;
    },
  });
}

export function useGetApprovalChain(id: string, enabled = true) {
  return useQuery<ApprovalChain, AxiosError<APIError>>({
    queryKey: approvalChainKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: ApprovalChain }>(`/approval-chains/${id}`);
      return data.data;
    },
    enabled: !!id && enabled,
  });
}

export function useCreateApprovalChain() {
  const queryClient = useQueryClient();

  return useMutation<
    { data: ApprovalChain },
    AxiosError<APIError>,
    CreateApprovalChainPayload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<{ data: ApprovalChain }>("/approval-chains", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: approvalChainKeys.list() });
      queryClient.setQueryData(approvalChainKeys.detail(data.data.id), data.data);
      toast.success("Approval chain created");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create approval chain"));
    },
  });
}

export function useUpdateApprovalChain() {
  const queryClient = useQueryClient();

  return useMutation<
    ApprovalChain,
    AxiosError<APIError>,
    { id: string; payload: UpdateApprovalChainPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<{ data: ApprovalChain }>(`/approval-chains/${id}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: approvalChainKeys.list() });
      queryClient.setQueryData(approvalChainKeys.detail(data.id), data);
      toast.success("Approval chain updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update approval chain"));
    },
  });
}

export function useDeleteApprovalChain() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, string>({
    mutationFn: async (id) => {
      await api.delete(`/approval-chains/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: approvalChainKeys.list() });
      queryClient.removeQueries({ queryKey: approvalChainKeys.detail(id) });
      toast.success("Approval chain deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete approval chain"));
    },
  });
}