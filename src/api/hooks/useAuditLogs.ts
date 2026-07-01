// src/api/hooks/useAuditLogs.ts
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "../lib/axios";
import type { APIError } from "../lib/types";

// ── Types ──────────────────────────────────────────────────────────────────

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "AUTH_SUCCESS"
  | "AUTH_FAILURE";

export type AuditModule =
  | "Users"
  | "Vouchers"
  | "Departments"
  | "Workflows"
  | "System";

export interface AuditActor {
  id: string;
  name: string;
  email: string;
}

export interface AuditLog {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string | null;
  actor_id: string | null;
  actor: AuditActor | null;
  actor_name: string;
  actor_email: string;
  action: AuditAction;
  module: AuditModule;
  resource_id: string;
  description: string;
  ip_address: string;
  user_agent: string;
}

export interface AuditLogMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  meta: AuditLogMeta;
}

// ── Filters ────────────────────────────────────────────────────────────────

export interface AuditLogFilters {
  module?: AuditModule | "";
  action?: AuditAction | "";
  search?: string;
  page?: number;
  limit?: number;
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const auditKeys = {
  all: ["audit-logs"] as const,
  list: (filters?: AuditLogFilters) =>
    [...auditKeys.all, "list", filters] as const,
} as const;

// ── HOOKS ──────────────────────────────────────────────────────────────────

export function useListAuditLogs(filters?: AuditLogFilters) {
  return useQuery<AuditLogListResponse, AxiosError<APIError>>({
    queryKey: auditKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get<AuditLogListResponse>("/audit-logs", {
        params: filters,
      });
      return data;
    },
  });
}