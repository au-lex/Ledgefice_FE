import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import api from "../lib/axios";
import type { APIError } from "../lib/types";
import type { CustomField, VoucherType } from "./useVoucherTypes";
import type { UserDepartment, User } from "./useUsers";

// ── Types ──────────────────────────────────────────────────────────────────

export type VoucherStatus = "draft" | "pending" | "approved" | "rejected";
export type VoucherSort = "newest" | "oldest";
export type ApprovalAction = "approved" | "rejected" | "pending";

export interface VoucherFieldValue {
  id: string;
  created_at: string;
  voucher_id: string;
  custom_field_id: string;
  field: CustomField | null;
  value: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  created_at: string;
  voucher_id: string;
  actor_id: string | null;
  actor: Pick<User, "id" | "name" | "email"> | null;
  department_id: string;
  department: UserDepartment | null;
  action: ApprovalAction;
  comment: string;
  acted_at: string | null;
}

export interface ApproverStep {
  id: string;
  amount_tier_id: string;
  department_id: string;
  department: UserDepartment | null;
  step_order: number;
}

export interface AmountTier {
  id: string;
  approval_chain_id: string;
  label: string;
  min_amount: number;
  max_amount: number | null;
  sort_order: number;
  steps: ApproverStep[];
}

export interface DuplicateFlag {
  id: string;
  voucher_id: string;
  is_duplicate: boolean;
  reason: string;
  match_ref: string;
  dismissed_at: string | null;
  dismissed_by: string | null;
}

export interface Voucher {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  code: string;
  status: VoucherStatus;
  tier: number;
  department_id: string;
  department: UserDepartment | null;
  voucher_type_id: string;
  voucher_type: VoucherType | null;
  raised_by_id: string;
  raised_by: Pick<User, "id" | "name" | "email"> | null;
  amount_tier_id: string | null;
  amount_tier: AmountTier | null;
  current_approver_dept_id: string | null;
  current_approver_dept: UserDepartment | null;
  field_values?: VoucherFieldValue[];
  approval_history?: ApprovalHistoryEntry[];
  duplicate_flag?: DuplicateFlag | null;
}

export interface VoucherMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface VoucherListResponse {
  data: Voucher[];
  meta: VoucherMeta;
}

// ── Payloads ───────────────────────────────────────────────────────────────

export interface FieldValueInput {
  custom_field_id: string;
  value: string;
}

export interface CreateVoucherPayload {
  voucher_type_id: string;
  field_values: FieldValueInput[];
}

export interface ApproveVoucherPayload {
  comment?: string;
}

export interface RejectVoucherPayload {
  reason?: string;
}

// ── Filters ────────────────────────────────────────────────────────────────

export interface VoucherListFilters {
  status?: VoucherStatus | "";
  type?: string;
  department?: string;
  search?: string;
  sort?: VoucherSort;
  page?: number;
  limit?: number;
}

export interface MyVoucherFilters {
  status?: VoucherStatus | "";
  sort?: VoucherSort;
  page?: number;
  limit?: number;
}

export interface SubmittedVoucherFilters {
  sort?: VoucherSort;
  page?: number;
  limit?: number;
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const voucherKeys = {
  all: ["vouchers"] as const,
  list: (filters?: VoucherListFilters) =>
    [...voucherKeys.all, "list", filters] as const,
  submitted: (filters?: SubmittedVoucherFilters) =>
    [...voucherKeys.all, "submitted", filters] as const,
  mine: (filters?: MyVoucherFilters) =>
    [...voucherKeys.all, "mine", filters] as const,
  detail: (id: string) => [...voucherKeys.all, id] as const,
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

const getErrorMessage = (
  error: AxiosError<APIError> | any,
  defaultMessage = "An error occurred",
) => error?.response?.data?.message || error?.message || defaultMessage;

// ── HOOKS ──────────────────────────────────────────────────────────────────

export function useListVouchers(filters?: VoucherListFilters) {
  return useQuery<VoucherListResponse, AxiosError<APIError>>({
    queryKey: voucherKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get<VoucherListResponse>("/vouchers", {
        params: filters,
      });
      return data;
    },
  });
}

export function useListSubmittedVouchers(filters?: SubmittedVoucherFilters) {
  return useQuery<VoucherListResponse, AxiosError<APIError>>({
    queryKey: voucherKeys.submitted(filters),
    queryFn: async () => {
      const { data } = await api.get<VoucherListResponse>("/vouchers/submitted", {
        params: filters,
      });
      return data;
    },
  });
}

export function useListMyVouchers(filters?: MyVoucherFilters) {
  return useQuery<VoucherListResponse, AxiosError<APIError>>({
    queryKey: voucherKeys.mine(filters),
    queryFn: async () => {
      const { data } = await api.get<VoucherListResponse>("/vouchers/my", {
        params: filters,
      });
      return data;
    },
  });
}

export function useGetVoucher(id: string, enabled = true) {
  return useQuery<Voucher, AxiosError<APIError>>({
    queryKey: voucherKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Voucher }>(`/vouchers/${id}`);
      return data.data;
    },
    enabled: !!id && enabled,
  });
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation<{ data: Voucher }, AxiosError<APIError>, CreateVoucherPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<{ data: Voucher }>("/vouchers", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.list() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.mine() });
      queryClient.setQueryData(voucherKeys.detail(data.data.id), data.data);
      toast.success("Voucher created");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create voucher"));
    },
  });
}

export function useSubmitVoucher() {
  const queryClient = useQueryClient();

  return useMutation<Voucher, AxiosError<APIError>, string>({
    mutationFn: async (id) => {
      const { data } = await api.post<{ data: Voucher }>(`/vouchers/${id}/submit`);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.list() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.mine() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.submitted() });
      queryClient.setQueryData(voucherKeys.detail(data.id), data);
      toast.success("Voucher submitted for approval");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to submit voucher"));
    },
  });
}

export function useApproveVoucher() {
  const queryClient = useQueryClient();

  return useMutation<
    Voucher,
    AxiosError<APIError>,
    { id: string; payload?: ApproveVoucherPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.post<{ data: Voucher }>(`/vouchers/${id}/approve`, payload ?? {});
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.list() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.submitted() });
      queryClient.setQueryData(voucherKeys.detail(data.id), data);
      toast.success("Voucher approved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to approve voucher"));
    },
  });
}

export function useRejectVoucher() {
  const queryClient = useQueryClient();

  return useMutation<
    Voucher,
    AxiosError<APIError>,
    { id: string; payload?: RejectVoucherPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.post<{ data: Voucher }>(`/vouchers/${id}/reject`, payload ?? {});
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.list() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.submitted() });
      queryClient.setQueryData(voucherKeys.detail(data.id), data);
      toast.success("Voucher rejected");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to reject voucher"));
    },
  });
}

export function useDismissDuplicate() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError<APIError>, string>({
    mutationFn: async (id) => {
      const { data } = await api.delete<{ message: string }>(
        `/vouchers/${id}/duplicate-flag`,
      );
      return data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.list() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.submitted() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(id) });
      toast.success(data.message || "Duplicate flag dismissed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to dismiss duplicate flag"));
    },
  });
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, string>({
    mutationFn: async (id) => {
      await api.delete(`/vouchers/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.list() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.mine() });
      queryClient.removeQueries({ queryKey: voucherKeys.detail(id) });
      toast.success("Voucher deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete voucher"));
    },
  });
}