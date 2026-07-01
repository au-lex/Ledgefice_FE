// src/api/hooks/useVoucherTypes.ts
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

export type FieldType = "text" | "number" | "date" | "file";

export interface CustomField {
  id: string;
  created_at: string;
  updated_at: string;
  voucher_type_id: string;
  label: string;
  type: FieldType;
  sort_order: number;
}

export interface VoucherType {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  name: string;
  description: string;
  fields: CustomField[];
}

// ── Payloads ───────────────────────────────────────────────────────────────

export interface CustomFieldInput {
  label: string;
  type: FieldType;
  sort_order?: number;
}

export interface CreateVoucherTypePayload {
  name: string;
  description?: string;
  fields?: CustomFieldInput[];
}

export interface UpdateVoucherTypePayload {
  name?: string;
  description?: string;
  fields?: CustomFieldInput[];
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const voucherTypeKeys = {
  all: ["voucher-types"] as const,
  list: () => [...voucherTypeKeys.all, "list"] as const,
  detail: (id: string) => [...voucherTypeKeys.all, id] as const,
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

const getErrorMessage = (
  error: AxiosError<APIError> | any,
  defaultMessage = "An error occurred",
) => error?.response?.data?.message || error?.message || defaultMessage;

// ── HOOKS ──────────────────────────────────────────────────────────────────

export function useListVoucherTypes() {
  return useQuery<VoucherType[], AxiosError<APIError>>({
    queryKey: voucherTypeKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<{ data: VoucherType[] }>("/voucher-types");
      return data.data;
    },
  });
}

export function useGetVoucherType(id: string, enabled = true) {
  return useQuery<VoucherType, AxiosError<APIError>>({
    queryKey: voucherTypeKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: VoucherType }>(`/voucher-types/${id}`);
      return data.data;
    },
    enabled: !!id && enabled,
  });
}

export function useCreateVoucherType() {
  const queryClient = useQueryClient();

  return useMutation<
    { data: VoucherType },
    AxiosError<APIError>,
    CreateVoucherTypePayload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<{ data: VoucherType }>("/voucher-types", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: voucherTypeKeys.list() });
      queryClient.setQueryData(voucherTypeKeys.detail(data.data.id), data.data);
      toast.success("Voucher type created");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create voucher type"));
    },
  });
}

export function useUpdateVoucherType() {
  const queryClient = useQueryClient();

  return useMutation<
    VoucherType,
    AxiosError<APIError>,
    { id: string; payload: UpdateVoucherTypePayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<{ data: VoucherType }>(`/voucher-types/${id}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: voucherTypeKeys.list() });
      queryClient.setQueryData(voucherTypeKeys.detail(data.id), data);
      toast.success("Voucher type updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update voucher type"));
    },
  });
}

export function useDeleteVoucherType() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, string>({
    mutationFn: async (id) => {
      await api.delete(`/voucher-types/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: voucherTypeKeys.list() });
      queryClient.removeQueries({ queryKey: voucherTypeKeys.detail(id) });
      toast.success("Voucher type deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete voucher type"));
    },
  });
}