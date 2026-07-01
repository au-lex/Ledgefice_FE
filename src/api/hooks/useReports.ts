// src/api/hooks/useReports.ts
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "../lib/axios";
import type { APIError } from "../lib/types";

// ── Types ──────────────────────────────────────────────────────────────────

export type ReportRange = "7d" | "30d" | "90d" | "12m";

export interface ReportSummary {
  total_vouchers: number;
  total_spend: number;
  approved_value: number;
  rejected_value: number;
  approval_rate: number;
  avg_turnaround: string;
}

export interface SpendOverTimeRow {
  label: string;
  value: number;
  approved: number;
  rejected: number;
}

export interface SpendByDeptRow {
  name: string;
  value: number;
}

export interface VolumeByTypeRow {
  name: string;
  count: number;
  value: number;
}

// ── Filters ────────────────────────────────────────────────────────────────

export interface ReportRangeFilter {
  range?: ReportRange;
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const reportKeys = {
  all: ["reports"] as const,
  summary: (filters?: ReportRangeFilter) =>
    [...reportKeys.all, "summary", filters] as const,
  spendOverTime: (filters?: ReportRangeFilter) =>
    [...reportKeys.all, "spend-over-time", filters] as const,
  spendByDept: () => [...reportKeys.all, "spend-by-dept"] as const,
  volumeByType: (filters?: ReportRangeFilter) =>
    [...reportKeys.all, "volume-by-type", filters] as const,
} as const;

// ── HOOKS ──────────────────────────────────────────────────────────────────

export function useReportSummary(filters?: ReportRangeFilter) {
  return useQuery<ReportSummary, AxiosError<APIError>>({
    queryKey: reportKeys.summary(filters),
    queryFn: async () => {
      const { data } = await api.get<{ data: ReportSummary }>("/reports/summary", {
        params: filters,
      });
      return data.data;
    },
  });
}

export function useSpendOverTime(filters?: ReportRangeFilter) {
  return useQuery<SpendOverTimeRow[], AxiosError<APIError>>({
    queryKey: reportKeys.spendOverTime(filters),
    queryFn: async () => {
      const { data } = await api.get<{ data: SpendOverTimeRow[] }>("/reports/spend-over-time", {
        params: filters,
      });
      return data.data;
    },
  });
}

export function useSpendByDept() {
  return useQuery<SpendByDeptRow[], AxiosError<APIError>>({
    queryKey: reportKeys.spendByDept(),
    queryFn: async () => {
      const { data } = await api.get<{ data: SpendByDeptRow[] }>("/reports/spend-by-dept");
      return data.data;
    },
  });
}

export function useVolumeByType(filters?: ReportRangeFilter) {
  return useQuery<VolumeByTypeRow[], AxiosError<APIError>>({
    queryKey: reportKeys.volumeByType(filters),
    queryFn: async () => {
      const { data } = await api.get<{ data: VolumeByTypeRow[] }>("/reports/volume-by-type", {
        params: filters,
      });
      return data.data;
    },
  });
}