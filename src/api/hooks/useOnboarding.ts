// src/api/hooks/useOnboarding.ts
import { useMutation } from "@tanstack/react-query";
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
  message: string;
  org: Org;
  owner: OnboardingOwner;
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

// ── Helpers ────────────────────────────────────────────────────────────────

const getErrorMessage = (
  error: AxiosError<APIError> | any,
  defaultMessage = "An error occurred",
) => error?.response?.data?.message || error?.message || defaultMessage;

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