// src/api/hooks/useMandates.ts
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

export interface Bank {
  code: string;
  name: string;
}

export interface AccountLookupResult {
  account_number: string;
  account_name: string;
}

export type MandateStatus = "" | "pending" | "active" | "failed";

export interface MandateStatusResponse {
  mandate_id: string;
  mandate_status: string; // Nomba's raw capitalized string, e.g. "Active"
  rejection_comment?: string;
}

export interface CreateMandateResponse {
  mandate_id: string;
  status: "pending";
  description: string; // NIBSS token-payment instructions to show the customer
}

// ── Payloads ───────────────────────────────────────────────────────────────

export interface LookupAccountPayload {
  account_number: string;
  bank_code: string;
}

export interface CreateMandatePayload {
  account_number: string;
  bank_code: string;
  account_name: string; // resolved name from useLookupAccount, confirmed by the user
  phone_number: string; // required by Nomba's mandate API
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const mandateKeys = {
  all: ["mandates"] as const,
  banks: () => [...mandateKeys.all, "banks"] as const,
  status: () => [...mandateKeys.all, "status"] as const,
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

const getErrorMessage = (
  error: AxiosError<APIError> | any,
  defaultMessage = "An error occurred",
) => error?.response?.data?.message || error?.message || defaultMessage;

// ── HOOKS ──────────────────────────────────────────────────────────────────

export function useListBanks() {
  return useQuery<Bank[], AxiosError<APIError>>({
    queryKey: mandateKeys.banks(),
    queryFn: async () => {
      const { data } = await api.get<{ banks: Bank[] }>("/mandates/banks");
      return data.banks;
    },
    staleTime: 60 * 60 * 1000, // bank list barely changes, cache for an hour
  });
}

// Mutation, not a query — this is a one-off "resolve name for this account
// number" action fired on blur/submit, not something to cache/refetch by key.
export function useLookupAccount() {
  return useMutation<
    AccountLookupResult,
    AxiosError<APIError>,
    LookupAccountPayload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<AccountLookupResult>(
        "/mandates/lookup-account",
        payload,
      );
      return data;
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Account lookup failed"));
    },
  });
}

// Only fetch once you actually have a mandate to poll (e.g. right after
// creating one) — pass enabled accordingly.
export function useMandateStatus(enabled = true) {
  return useQuery<MandateStatusResponse, AxiosError<APIError>>({
    queryKey: mandateKeys.status(),
    queryFn: async () => {
      const { data } = await api.get<MandateStatusResponse>(
        "/mandates/status",
      );
      return data;
    },
    enabled,
    // handy for polling right after creation while it's still "pending"
    refetchInterval: (query) =>
      query.state.data?.mandate_status === "Active" ||
      query.state.data?.mandate_status === "Failed" ||
      query.state.data?.mandate_status === "Rejected"
        ? false
        : 5000,
  });
}

export function useCreateMandate() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateMandateResponse,
    AxiosError<APIError>,
    CreateMandatePayload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<CreateMandateResponse>(
        "/mandates",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mandateKeys.status() });
      toast.success("Mandate created — complete authentication with your bank");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create mandate"));
    },
  });
}