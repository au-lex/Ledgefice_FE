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

// Matches the Go MandateStatus enum — lowercase, unlike Nomba's capitalized
// "Active"/"Failed"/"Rejected" strings.
export type MandateStatus = "" | "pending" | "active" | "failed";

export interface MandateStatusResponse {
  mandate_status: MandateStatus;
  channel: string; // "" | "card" | "direct_debit" | "bank_transfer"
}

export interface InitiateMandateResponse {
  status: "pending";
  redirect_url: string; // send the customer here to authenticate with their bank
}

// ── Payloads ───────────────────────────────────────────────────────────────

export interface LookupAccountPayload {
  account_number: string;
  bank_code: string;
}

// Paystack resolves the account name itself during the bank redirect flow,
// so unlike Nomba's mandate API, we only need to hand it the bank details —
// account_name/phone_number aren't required by the backend anymore. Keep
// useLookupAccount() in the UI purely for the "is this you?" confirmation
// step before calling this.
export interface InitiateMandatePayload {
  account_number: string;
  bank_code: string;
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

// Only fetch once you actually have a mandate to poll (e.g. right after the
// customer returns from the bank redirect) — pass enabled accordingly. This
// polls OUR db, which only updates once Paystack's webhook lands — there's
// no live status endpoint on Paystack's side to hit directly, unlike Nomba.
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
    // handy for polling right after the customer returns from the bank redirect
    refetchInterval: (query) =>
      query.state.data?.mandate_status === "active" ||
      query.state.data?.mandate_status === "failed"
        ? false
        : 5000,
  });
}

export function useInitiateMandate() {
  const queryClient = useQueryClient();

  return useMutation<
    InitiateMandateResponse,
    AxiosError<APIError>,
    InitiateMandatePayload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<InitiateMandateResponse>(
        "/mandates",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mandateKeys.status() });
      toast.success("Redirecting you to your bank to authorize...");

    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to start mandate"));
    },
  });
}