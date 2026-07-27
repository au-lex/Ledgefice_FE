import { useCallback, useEffect, useMemo, useState } from "react";
import { getVisibleSteps } from "./tour-steps";
import type { UserPermissions } from "../../layout/Sidebar";

const STORAGE_KEY = "ledgefice_onboarding_v1";

type OnboardingStatus = "not_started" | "in_progress" | "completed" | "skipped";

interface StoredState {
  status: OnboardingStatus;
  stepIndex: number;
}

function readStored(): StoredState {
  if (typeof window === "undefined") {
    return { status: "not_started", stepIndex: 0 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { status: "not_started", stepIndex: 0 };
    return JSON.parse(raw) as StoredState;
  } catch {
    return { status: "not_started", stepIndex: 0 };
  }
}

function writeStored(state: StoredState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode etc) — tour just won't persist, non-fatal
  }
}

/**
 * Drives the onboarding tour. Mount this once at the dashboard shell level
 * (Layout.tsx), passing the logged-in user's permissions so steps the user
 * can't act on (e.g. Departments for someone without can_view_departments)
 * are skipped automatically.
 *
 * Usage:
 *   const onboarding = useOnboarding(user.permissions);
 *   {onboarding.isActive && <OnboardingTour {...onboarding} />}
 */
export function useOnboarding(permissions?: UserPermissions) {
  const [status, setStatus] = useState<OnboardingStatus>("not_started");
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => getVisibleSteps(permissions), [permissions]);

  useEffect(() => {
    const stored = readStored();
    setStatus(stored.status);
    setStepIndex(stored.stepIndex);
  }, []);

  const persist = useCallback(
    (next: Partial<StoredState>) => {
      setStatus((prevStatus) => {
        const merged: StoredState = {
          status: next.status ?? prevStatus,
          stepIndex: next.stepIndex ?? stepIndex,
        };
        writeStored(merged);
        return merged.status;
      });
      if (next.stepIndex !== undefined) setStepIndex(next.stepIndex);
    },
    [stepIndex]
  );

  const start = useCallback(() => {
    persist({ status: "in_progress", stepIndex: 0 });
  }, [persist]);

  const next = useCallback(() => {
    const isLast = stepIndex >= steps.length - 1;
    if (isLast) {
      persist({ status: "completed" });
    } else {
      persist({ status: "in_progress", stepIndex: stepIndex + 1 });
    }
  }, [persist, stepIndex, steps.length]);

  const back = useCallback(() => {
    if (stepIndex === 0) return;
    persist({ status: "in_progress", stepIndex: stepIndex - 1 });
  }, [persist, stepIndex]);

  const skip = useCallback(() => {
    persist({ status: "skipped" });
  }, [persist]);

  const restart = useCallback(() => {
    persist({ status: "in_progress", stepIndex: 0 });
  }, [persist]);

  return {
    status,
    stepIndex,
    currentStep: steps[stepIndex],
    totalSteps: steps.length,
    isActive: status === "in_progress" && steps.length > 0,
    isFirstVisit: status === "not_started",
    start,
    next,
    back,
    skip,
    restart,
  };
}