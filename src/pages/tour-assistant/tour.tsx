import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { onboardingSteps } from "./tour-steps";
import type { OnboardingStep } from "./tour-steps";

interface OnboardingTourProps {
  stepIndex: number;
  totalSteps: number;
  currentStep: OnboardingStep;
  next: () => void;
  back: () => void;
  skip: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8; // spotlight padding around target element

function useTargetRect(target: string, route?: string) {
  const [rect, setRect] = useState<Rect | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (route) navigate(route);
  }, [route, navigate]);

  useEffect(() => {
    let raf: number;

    const measure = () => {
      // Sidebar renders twice (mobile drawer + desktop aside), so the same
      // data-tour id can exist more than once — pick the one that's actually visible.
      const candidates = document.querySelectorAll(`[data-tour="${target}"]`);
      let el: Element | null = null;
      for (const candidate of Array.from(candidates)) {
        const r = candidate.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          el = candidate;
          break;
        }
      }

      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      } else {
        setRect(null);
      }
      raf = requestAnimationFrame(measure);
    };

    // Give route navigation a tick to render before first measure
    const timeout = setTimeout(() => {
      raf = requestAnimationFrame(measure);
    }, route ? 150 : 0);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, route]);

  return rect;
}

function tooltipPosition(rect: Rect, placement: OnboardingStep["placement"]) {
  const gap = 16;
  switch (placement) {
    case "top":
      return { top: rect.top - gap, left: rect.left + rect.width / 2, transform: "translate(-50%, -100%)" };
    case "left":
      return { top: rect.top + rect.height / 2, left: rect.left - gap, transform: "translate(-100%, -50%)" };
    case "right":
      return { top: rect.top + rect.height / 2, left: rect.left + rect.width + gap, transform: "translate(0, -50%)" };
    case "bottom":
    default:
      return { top: rect.top + rect.height + gap, left: rect.left + rect.width / 2, transform: "translate(-50%, 0)" };
  }
}

export function OnboardingTour({ stepIndex, totalSteps, currentStep, next, back, skip }: OnboardingTourProps) {
  const rect = useTargetRect(currentStep.target, currentStep.route);
  const isLast = stepIndex === totalSteps - 1;

  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    },
    [skip, next, back]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);

  const tipStyle = rect ? tooltipPosition(rect, currentStep.placement) : null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Onboarding tour">
      {/* Dimmed backdrop with a spotlight cutout via box-shadow trick */}
      {rect ? (
        <div
          className="absolute rounded-lg transition-all duration-300 ease-out pointer-events-none"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(9, 9, 11, 0.82)",
            outline: "2px solid rgba(251, 191, 36, 0.7)", // amber-400, "stamped" outline
            outlineOffset: "2px",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-zinc-950/85" />
      )}

      {/* Tooltip card */}
      <div
        className="absolute w-[320px] rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/50"
        style={
          tipStyle
            ? { top: tipStyle.top, left: tipStyle.left, transform: tipStyle.transform }
            : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
        }
      >
        {/* Stamp-style step marker */}
        <div className="mb-3 flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-amber-400/60 text-amber-400">
            <span className="text-xs font-bold tracking-wide">{stepIndex + 1}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-widest text-zinc-500">
              Step {stepIndex + 1} of {totalSteps}
            </span>
            <div className="mt-1 flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-4 rounded-full transition-colors ${
                    i <= stepIndex ? "bg-amber-400" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <h3 className="text-base font-semibold text-zinc-50">{currentStep.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{currentStep.body}</p>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={skip}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button
                onClick={back}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-300 transition-colors"
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { onboardingSteps };