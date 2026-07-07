// src/api/hooks/useOnboarding.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import api from "../lib/axios";
import type { APIError } from "../lib/types";
import type { Org } from "./useAuth";

// ── Types ──────────────────────────────────────────────────────────────────

export interface OnboardingOwner {
  id: string;
  email: string;
}

export interface OnboardingResponse {
  checkout_link: any;
  message: string;
  org: Org;
  owner: OnboardingOwner;
}

export interface OrganizationDetails {
  id: string;
  name: string;
  logo_url: string;
  number_of_workers: number;
  plan: string;
  owner_id: string | null;
  limits: {
    max_departments: number;
    max_users: number;
  };
  features: {
    multi_step_approvals: boolean;
    department_permissions: boolean;
    full_reporting_dashboard: boolean;
    audit_log_export: boolean;
    priority_support: boolean;
  };
}

// ── Payloads ───────────────────────────────────────────────────────────────

export interface SetupWorkspacePayload {
  organization_name: string;
  email: string;
  password: string;
  number_of_workers?: number;
  plan?: string;
  logo?: File;
}

export interface UpdateOrganizationPayload {
  name?: string;
  number_of_workers?: number;
  logo?: File;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const getErrorMessage = (
  error: AxiosError<APIError> | any,
  defaultMessage = "An error occurred",
) => error?.response?.data?.message || error?.message || defaultMessage;

export const organizationKeys = {
  me: ["organization", "me"] as const,
};

// ── HOOKS ──────────────────────────────────────────────────────────────────

export function useSetupWorkspace() {
  return useMutation<OnboardingResponse, AxiosError<APIError>, SetupWorkspacePayload>({
    mutationFn: async ({ logo, ...fields }) => {
      const form = new FormData();

      form.append("organization_name", fields.organization_name);
      form.append("email", fields.email);
      form.append("password", fields.password);

      if (fields.number_of_workers !== undefined) {
        form.append("number_of_workers", String(fields.number_of_workers));
      }
      if (fields.plan) {
        form.append("plan", fields.plan);
      }
      if (logo) {
        form.append("logo", logo);
      }

      const { data } = await api.post<OnboardingResponse>(
        "/onboarding/setup",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Workspace created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create workspace"));
    },
  });
}

// Fetch the logged-in user's organization details
export function useOrganization() {
  return useQuery<OrganizationDetails, AxiosError<APIError>>({
    queryKey: organizationKeys.me,
    queryFn: async () => {
      const { data } = await api.get<{ data: OrganizationDetails }>("/organizations/me");
      return data.data;
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<OrganizationDetails, AxiosError<APIError>, UpdateOrganizationPayload>({
    mutationFn: async ({ logo, ...fields }) => {
      const form = new FormData();

      if (fields.name !== undefined) {
        form.append("name", fields.name);
      }
      if (fields.number_of_workers !== undefined) {
        form.append("number_of_workers", String(fields.number_of_workers));
      }
      if (logo) {
        form.append("logo", logo);
      }

      const { data } = await api.put<{ data: OrganizationDetails }>(
        "/organizations/me",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(organizationKeys.me, data);
      toast.success("Organization updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update organization"));
    },
  });
}