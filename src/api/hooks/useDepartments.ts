// src/api/hooks/useDepartments.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import api from "../lib/axios";
import type { APIError } from "../lib/types";
import type { PermissionMap } from "./useAuth";

// ── Types ──────────────────────────────────────────────────────────────────

export interface DepartmentUser {
  id: string;
  name: string;
  email: string;
  status: string;
}

export interface Department {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  name: string;
  code: string;
  icon_key: string;
  permissions: PermissionMap;
  users?: DepartmentUser[];
}

export interface DepartmentWithStats extends Department {
  active_vouchers: number;
  total_spend: number;
  head_count: number;
}

// ── Payloads ───────────────────────────────────────────────────────────────

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  icon_key?: string;
  permissions?: PermissionMap;
}

export interface UpdateDepartmentPayload {
  name?: string;
  code?: string;
  icon_key?: string;
  permissions?: PermissionMap;
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const departmentKeys = {
  all: ["departments"] as const,
  list: () => [...departmentKeys.all, "list"] as const,
  detail: (id: string) => [...departmentKeys.all, id] as const,
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

const getErrorMessage = (
  error: AxiosError<APIError> | any,
  defaultMessage = "An error occurred",
) => error?.response?.data?.message || error?.message || defaultMessage;

// ── HOOKS ──────────────────────────────────────────────────────────────────

export function useListDepartments() {
  return useQuery<DepartmentWithStats[], AxiosError<APIError>>({
    queryKey: departmentKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<{ data: DepartmentWithStats[] }>("/departments");
      return data.data;
    },
  });
}

export function useGetDepartment(id: string, enabled = true) {
  return useQuery<Department, AxiosError<APIError>>({
    queryKey: departmentKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Department }>(`/departments/${id}`);
      return data.data;
    },
    enabled: !!id && enabled,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation<
    { data: Department },
    AxiosError<APIError>,
    CreateDepartmentPayload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<{ data: Department }>("/departments", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
      queryClient.setQueryData(departmentKeys.detail(data.data.id), data.data);
      toast.success("Department created");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create department"));
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation<
    Department,
    AxiosError<APIError>,
    { id: string; payload: UpdateDepartmentPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<{ data: Department }>(`/departments/${id}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
      queryClient.setQueryData(departmentKeys.detail(data.id), data);
      toast.success("Department updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update department"));
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, string>({
    mutationFn: async (id) => {
      await api.delete(`/departments/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
      queryClient.removeQueries({ queryKey: departmentKeys.detail(id) });
      toast.success("Department deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete department"));
    },
  });
}