import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TickCircle, CloseCircle, ArrowRight, Crown1 } from "iconsax-react";
import { usePlans, type PlanConfig } from "../../api/hooks/usePlan";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DisplayTier {
    id: "starter" | "business" | "enterprise";
    name: string;
    tagline: string;
    monthlyPrice: number; // naira
    yearlyPrice: number; // naira
    departmentLimit: string;
    highlighted?: boolean;
    features: { label: string; included: boolean }[];
}

// ─── Static copy that doesn't come from the API ──────────────────────────────

const TAGLINES: Record<DisplayTier["id"], string> = {
    starter: "For a single team finding its footing",
    business: "For organizations running multiple departments",
    enterprise: "For large, multi-site operations",
};

const HIGHLIGHTED: DisplayTier["id"] = "business";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
    return "₦" + n.toLocaleString("en-NG");
}

function buildFeatureList(cfg: PlanConfig, planId: DisplayTier["id"]): DisplayTier["features"] {
    const userLimit =
        cfg.max_users === -1 ? "Unlimited users" : `Up to ${cfg.max_users} users`;

    return [
        { label: userLimit, included: true },
        { label: "Custom voucher types", included: true },
        {
            label: cfg.features.multi_step_approvals ? "Multi-step approval chains" : "Single-step approvals",
            included: true,
        },
        { label: "Department-level permissions", included: cfg.features.department_permissions },
        {
            label: cfg.features.full_reporting_dashboard ? "Full spend & reporting dashboard" : "Basic spend reporting",
            included: true,
        },
        { label: "Audit log export", included: cfg.features.audit_log_export },
        {
            label: planId === "enterprise" ? "Priority support & dedicated rep" : "Priority support",
            included: cfg.features.priority_support,
        },
    ];
}

function toDisplayTiers(plans: Record<DisplayTier["id"], PlanConfig> | undefined): DisplayTier[] {
    if (!plans) return [];

    const order: DisplayTier["id"][] = ["starter", "business", "enterprise"];

    return order.map((id) => {
        const cfg = plans[id];
        return {
            id,
            name: cfg.name,
            tagline: TAGLINES[id],
            monthlyPrice: cfg.monthly_price / 100, // kobo -> naira
            yearlyPrice: cfg.yearly_price / 100,
            departmentLimit:
                cfg.max_departments === -1 ? "Unlimited departments" : `Up to ${cfg.max_departments} departments`,
            highlighted: id === HIGHLIGHTED,
            features: buildFeatureList(cfg, id),
        };
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BillingToggle({
    yearly,
    onChange,
}: {
    yearly: boolean;
    onChange: (yearly: boolean) => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800/60 rounded-full p-1">
            <button
                onClick={() => onChange(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    !yearly ? "bg-zinc-100 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
                }`}
            >
                Monthly
            </button>
            <button
                onClick={() => onChange(true)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    yearly ? "bg-zinc-100 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
                }`}
            >
                Yearly
                <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        yearly ? "bg-zinc-950 text-zinc-100" : "bg-zinc-800 text-zinc-400"
                    }`}
                >
                    -20%
                </span>
            </button>
        </div>
    );
}

function PricingCard({
    tier,
    yearly,
    onSelect,
}: {
    tier: DisplayTier;
    yearly: boolean;
    onSelect: (tierId: DisplayTier["id"]) => void;
}) {
    const isCustom = tier.monthlyPrice === 0;
    const price = yearly ? tier.yearlyPrice : tier.monthlyPrice;

    return (
        <div
            className={`relative flex flex-col rounded-2xl p-6 border transition-all ${
                tier.highlighted
                    ? "bg-zinc-800/60 border-zinc-700/70 shadow-xl shadow-black/30 lg:-translate-y-2"
                    : "bg-zinc-900/40 border-zinc-800/40"
            }`}
        >
            {tier.highlighted && (
                <div className="absolute -top-3.5 left-6 flex items-center gap-1.5 bg-zinc-100 text-zinc-950 text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    <Crown1 size={11} color="currentColor" variant="Bold" />
                    Most Popular
                </div>
            )}

            <h3 className="text-sm font-semibold text-zinc-100 mb-1">{tier.name}</h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed min-h-[32px]">{tier.tagline}</p>

            <div className="mb-1 flex items-baseline gap-1">
                {isCustom ? (
                    <span className="text-3xl font-medium text-zinc-50 tracking-tight">Custom</span>
                ) : (
                    <>
                        <span className="text-3xl font-medium text-zinc-50 tracking-tight">{formatPrice(price)}</span>
                        <span className="text-xs text-zinc-500">/ month</span>
                    </>
                )}
            </div>
            <p className="text-[11px] text-zinc-600 mb-6">
                {isCustom ? "Tailored to your scale" : yearly ? "Billed annually" : "Billed monthly"}
            </p>

            <p className="text-xs font-medium text-zinc-300 bg-zinc-950/50 border border-zinc-800/60 rounded-xl px-3 py-2 mb-6">
                {tier.departmentLimit}
            </p>

            <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5">
                        {f.included ? (
                            <TickCircle size={15} color="currentColor" className="text-zinc-300 flex-shrink-0 mt-0.5" />
                        ) : (
                            <CloseCircle size={15} color="currentColor" className="text-zinc-700 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-xs leading-relaxed ${f.included ? "text-zinc-300" : "text-zinc-600"}`}>
                            {f.label}
                        </span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onSelect(tier.id)}
                className={`flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all ${
                    tier.highlighted
                        ? "bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm"
                        : "bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-700/50 text-zinc-200"
                }`}
            >
                {isCustom ? "Talk to Sales" : "Get Started"}
                <ArrowRight size={15} color="currentColor" />
            </button>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingSection() {
    const [yearly, setYearly] = useState(false);
    const navigate = useNavigate();
    const { data: plans, isLoading, isError } = usePlans();

    const tiers = toDisplayTiers(plans as any);

    function handleSelect(tierId: DisplayTier["id"]) {
        if (tierId === "enterprise") {
            // Custom pricing — route to contact instead of onboarding/checkout.
            navigate("/contact");
            return;
        }
        navigate(`/onboarding?plan=${tierId}&billing=${yearly ? "yearly" : "monthly"}`);
    }

    return (
        <div id="pricing" className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
            <div className="text-center max-w-lg mx-auto mb-8">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-50 mb-3">
                    Pricing that scales with your departments
                </h2>
                <p className="text-sm text-zinc-500 leading-relaxed">
                    Every plan includes voucher types, approvals, and full audit logging — pick the size that fits.
                </p>
            </div>

            <div className="flex justify-center mb-12">
                <BillingToggle yearly={yearly} onChange={setYearly} />
            </div>

            {isLoading && (
                <p className="text-center text-xs text-zinc-500">Loading plans…</p>
            )}

            {isError && (
                <p className="text-center text-xs text-red-400">Couldn't load plans. Try refreshing.</p>
            )}

            {!isLoading && !isError && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                    {tiers.map((tier) => (
                        <PricingCard key={tier.id} tier={tier} yearly={yearly} onSelect={handleSelect} />
                    ))}
                </div>
            )}

            <p className="text-center text-[11px] text-zinc-600 mt-10">
                Reach out to get started on the right plan for your team.
            </p>
        </div>
    );
}