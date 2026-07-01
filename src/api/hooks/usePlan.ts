import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

// ── Types — mirrors models.PlanConfig from the Go backend ────────────────────

export interface PlanFeatures {
    multi_step_approvals: boolean;
    department_permissions: boolean;
    full_reporting_dashboard: boolean;
    audit_log_export: boolean;
    priority_support: boolean;
}

export interface PlanConfig {
    name: string;
    max_departments: number; // -1 = unlimited
    max_users: number; // -1 = unlimited
    monthly_price: number; // kobo
    yearly_price: number; // kobo, per month equivalent
    features: PlanFeatures;
}

export type PlansResponse = Record<"starter" | "business" | "enterprise", PlanConfig>;

export function usePlans() {
    return useQuery<PlansResponse>({
        queryKey: ["plans"],
        queryFn: async () => {
            const { data } = await api.get<PlansResponse>("/plans");
            return data;
        },
        staleTime: 1000 * 60 * 60, // plans rarely change — cache for an hour
    });
}