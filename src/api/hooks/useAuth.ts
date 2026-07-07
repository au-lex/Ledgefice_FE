// src/api/hooks/useAuth.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import api, { AUTH_TOKEN_KEY } from "../lib/axios";
import type { APIError } from "../lib/types";

// ── Types ──────────────────────────────────────────────────────────────────

export type UserStatus = "active" | "suspended" | "blocked";

export type PlanType = "starter" | "growth" | "business" | "enterprise" | string;

export interface PermissionMap {
  can_create?: boolean;
  can_approve?: boolean;
  can_dismiss_duplicates?: boolean;
  can_view_all?: boolean;
  can_view_all_vouchers?: boolean;
  can_view_reports?: boolean;
  can_view_voucher_types?: boolean;
  can_create_voucher_types?: boolean;
  can_edit_voucher_types?: boolean;
  can_delete_voucher_types?: boolean;
  can_manage_voucher_types?: boolean;
  can_view_billings?: boolean;
  can_create_billings?: boolean;
  can_edit_billings?: boolean;
  can_delete_billings?: boolean;
  can_manage_billings?: boolean;
  can_view_approval_chains?: boolean;
  can_create_approval_chains?: boolean;
  can_edit_approval_chains?: boolean;
  can_delete_approval_chains?: boolean;
  can_view_departments?: boolean;
  can_create_departments?: boolean;
  can_edit_departments?: boolean;
  can_delete_departments?: boolean;
  can_manage_users?: boolean;
  can_configure?: boolean;
  can_view_audit_logs?: boolean;
  can_export_audit_logs?: boolean;
  [key: string]: boolean | undefined;
}

export interface OrgFeatures {
  multi_step_approvals?: boolean;
  department_permissions?: boolean;
  full_reporting_dashboard?: boolean;
  audit_log_export?: boolean;
  priority_support?: boolean;
  [key: string]: boolean | undefined;
}

export interface OrgLimits {
  max_departments: number;
  max_users: number;
}

export interface Org {
  id: string;
  name: string;
  plan: PlanType;
  logo: string;
  limits: OrgLimits;
  features: OrgFeatures;
}

// Matches the actual login response — department is a string (name only)
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  department: string;
  status: UserStatus;
  avatar_url?: string;
  permissions: PermissionMap;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  org: Org;
}

// /auth/me returns the full department object
export interface MeUser {
  id: string;
  name: string;
  email: string;
  department: {
    id: string;
    name: string;
    code: string;
    icon_key: string;
    permissions: PermissionMap;
  } | null;
  status: UserStatus;
  avatar_url?: string;
  permissions: PermissionMap;
  org: Org;
}


export interface UpdateMeResponse {
  id: string;
  name: string;
  email: string;
  department: string;
  status: UserStatus;
  avatar_url?: string;
  permissions: PermissionMap;
}

// ── Payloads ───────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateMePayload {
  name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
  avatar?: File;
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

const getErrorMessage = (
  error: AxiosError<APIError> | any,
  defaultMessage = "An error occurred",
) => error?.response?.data?.message || error?.message || defaultMessage;

// ── HOOKS ──────────────────────────────────────────────────────────────────

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, AxiosError<APIError>, LoginPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<LoginResponse>("/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      // Seed the me cache with what we already have from login
      queryClient.setQueryData(authKeys.me(), {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        department: null, // full dept object comes from /auth/me
        status: data.user.status,
        avatar_url: data.user.avatar_url,
        permissions: data.user.permissions,
        org: data.org,
      } satisfies MeUser);
      toast.success("Welcome back!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Login failed"));
    },
  });
}

export function useMe(enabled = true) {
  return useQuery<MeUser, AxiosError<APIError>>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const { data } = await api.get<{ data: MeUser }>("/auth/me");
      return data.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

// Update the logged-in user's own name / email / password / avatar
export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation<UpdateMeResponse, AxiosError<APIError>, UpdateMePayload>({
    mutationFn: async ({ avatar, ...fields }) => {
      const form = new FormData();

      if (fields.name !== undefined) form.append("name", fields.name);
      if (fields.email !== undefined) form.append("email", fields.email);
      if (fields.current_password !== undefined) {
        form.append("current_password", fields.current_password);
      }
      if (fields.new_password !== undefined) {
        form.append("new_password", fields.new_password);
      }
      if (avatar) form.append("avatar", avatar);

      const { data } = await api.put<{ data: UpdateMeResponse }>(
        "/auth/me",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.data;
    },
    onSuccess: (data) => {

      queryClient.setQueryData<MeUser | undefined>(authKeys.me(), (old) => {
        if (!old) return old;
        return {
          ...old,
          name: data.name,
          email: data.email,
          status: data.status,
          avatar_url: data.avatar_url,
          permissions: data.permissions,
        };
      });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, void>({
    mutationFn: async () => {},
    onSuccess: () => {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      queryClient.clear();
      window.location.href = "/login";
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Logout failed"));
    },
  });
}