// src/api/hooks/useAdmin.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import api from "../lib/axios";
import type { APIError } from "../lib/types";
import type { PlanType } from "./useSubscription";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: AdminUser;
}

export interface Organization {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  logo_url: string;
  number_of_workers: number;
  plan: PlanType;
  owner_id: string | null;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan: PlanType;
  amount: number;
  currency: string;
  order_reference: string;
  status: "pending" | "paid" | "failed";
  paid_at: string | null;
  renews_at: string | null;
  dunning_stage: string;
  cancelled_at: string | null;
}

export interface OrganizationDetail {
  organization: Organization;
  subscriptions: OrganizationSubscription[];
  user_count: number;
}

export interface ListOrganizationsResponse {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
}

// ── Payloads ───────────────────────────────────────────────────────────────

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface ListOrganizationsParams {
  page?: number;
  limit?: number;
}

export interface UpdateOrganizationPayload {
  name?: string;
  logo_url?: string;
  number_of_workers?: number;
  plan?: PlanType;
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const adminKeys = {
  all: ["admin"] as const,
  organizations: () => [...adminKeys.all, "organizations"] as const,
  organizationList: (params: ListOrganizationsParams) =>
    [...adminKeys.organizations(), "list", params] as const,
  organizationDetail: (id: string) =>
    [...adminKeys.organizations(), id] as const,
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

const getErrorMessage = (
  error: AxiosError<APIError> | any,
  defaultMessage = "An error occurred",
) => error?.response?.data?.message || error?.message || defaultMessage;

// ── HOOKS ──────────────────────────────────────────────────────────────────

// Admin login — token/admin should be persisted by the caller (e.g. into
// whatever auth store gates the /admin/* routes) since this hook only
// performs the request.
export function useAdminLogin() {
  return useMutation<AdminLoginResponse, AxiosError<APIError>, AdminLoginPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AdminLoginResponse>(
        "/admin/auth/login",
        payload,
      );
      return data;
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Invalid email or password"));
    },
  });
}

export function useListOrganizations(params: ListOrganizationsParams = {}) {
  const { page = 1, limit = 20 } = params;

  return useQuery<ListOrganizationsResponse, AxiosError<APIError>>({
    queryKey: adminKeys.organizationList({ page, limit }),
    queryFn: async () => {
      const { data } = await api.get<ListOrganizationsResponse>(
        "/admin/organizations",
        { params: { page, limit } },
      );
      return data;
    },
    placeholderData: keepPreviousData, // avoid flicker/empty state when paging
  });
}

export function useGetOrganization(id: string, enabled = true) {
  return useQuery<OrganizationDetail, AxiosError<APIError>>({
    queryKey: adminKeys.organizationDetail(id),
    queryFn: async () => {
      const { data } = await api.get<OrganizationDetail>(
        `/admin/organizations/${id}`,
      );
      return data;
    },
    enabled: !!id && enabled,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<
    { organization: Organization },
    AxiosError<APIError>,
    { id: string; payload: UpdateOrganizationPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<{ organization: Organization }>(
        `/admin/organizations/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.organizations() });
      queryClient.setQueryData<OrganizationDetail | undefined>(
        adminKeys.organizationDetail(id),
        (prev) =>
          prev ? { ...prev, organization: data.organization } : prev,
      );
      toast.success("Organization updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update organization"));
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/organizations/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.organizations() });
      queryClient.removeQueries({ queryKey: adminKeys.organizationDetail(id) });
      toast.success("Organization deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete organization"));
    },
  });
}

// Force-runs the renewal/dunning cron immediately — admin/debug only.
export function useRunRenewalsNow() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError<APIError>, void>({
    mutationFn: async () => {
      const { data } = await api.post<{ message: string }>(
        "/admin/renewals/run",
      );
      return data;
    },
    onSuccess: (data) => {
      // subscription statuses/dunning stages may have shifted
      queryClient.invalidateQueries({ queryKey: adminKeys.organizations() });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Renewal run failed"));
    },
  });
}