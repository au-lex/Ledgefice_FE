// src/api/hooks/useUsers.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import api from "../lib/axios";
import type { APIError } from "../lib/types";
import type { UserStatus } from "./useAuth";

// ── Types ──────────────────────────────────────────────────────────────────

export interface UserDepartment {
  id: string;
  name: string;
  code: string;
  icon_key: string;
}

export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  name: string;
  email: string;
  department_id: string | null;
  department: UserDepartment | null;
  status: UserStatus;
  last_login_at: string | null;
}

export interface UserMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface UserListResponse {
  data: User[];
  meta: UserMeta;
}

// ── Payloads ───────────────────────────────────────────────────────────────

export interface CreateUserPayload {
  name: string;
  email: string;
  department_id: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  department_id?: string;
  password?: string;
}

export interface SetUserStatusPayload {
  status: UserStatus;
}

// ── Filters ────────────────────────────────────────────────────────────────

export interface UserListFilters {
  status?: UserStatus | "";
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const userKeys = {
  all: ["users"] as const,
  list: (filters?: UserListFilters) =>
    [...userKeys.all, "list", filters] as const,
  detail: (id: string) => [...userKeys.all, id] as const,
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

const getErrorMessage = (
  error: AxiosError<APIError> | any,
  defaultMessage = "An error occurred",
) => error?.response?.data?.message || error?.message || defaultMessage;

// ── HOOKS ──────────────────────────────────────────────────────────────────

export function useListUsers(filters?: UserListFilters) {
  return useQuery<UserListResponse, AxiosError<APIError>>({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get<UserListResponse>("/users", {
        params: filters,
      });
      return data;
    },
  });
}

export function useGetUser(id: string, enabled = true) {
  return useQuery<User, AxiosError<APIError>>({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: User }>(`/users/${id}`);
      return data.data;
    },
    enabled: !!id && enabled,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; user: Pick<User, "id" | "name" | "email" | "status"> & { department: string } },
    AxiosError<APIError>,
    CreateUserPayload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post("/users", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      toast.success(data.message || "User created");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create user"));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    AxiosError<APIError>,
    { id: string; payload: UpdateUserPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<{ data: User }>(`/users/${id}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      queryClient.setQueryData(userKeys.detail(data.id), data);
      toast.success("User updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update user"));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, string>({
    mutationFn: async (id) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      toast.success("User deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete user"));
    },
  });
}

export function useSetUserStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; status: UserStatus },
    AxiosError<APIError>,
    { id: string; payload: SetUserStatusPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.patch<{ data: { id: string; status: UserStatus } }>(
        `/users/${id}/status`,
        payload,
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      toast.success(`User ${data.status}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update user status"));
    },
  });
}