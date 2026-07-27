import React, { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Building,
    Sms,
    Lock1,
    Eye,
    EyeSlash,
    Profile2User,
    GalleryAdd,
    CloseCircle,
    ArrowRight,
    Warning2,
    Whatsapp,
} from "iconsax-react";
import Logo from "../../components/Logo";
import { useSetupWorkspace } from "../../api/hooks/useOnboarding";
import { usePlans, type PlanConfig, type PlanFeatures } from "../../api/hooks/usePlan";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanOption = "starter" | "business" | "enterprise";

const PLAN_ORDER: PlanOption[] = ["starter", "business", "enterprise"];

const ENTERPRISE_WHATSAPP_NUMBER = "+2348158772715"; // TODO: replace with real number (international format, no +)
const ENTERPRISE_WHATSAPP_MESSAGE = "Hi, I'm interested in the Enterprise plan for VMS.";

function isPlanOption(value: string | null): value is PlanOption {
    return value === "starter" || value === "business" || value === "enterprise";
}

// ─── Pricing helpers ──────────────────────────────────────────────────────────

function formatPrice(kobo: number): string {
    if (kobo === 0) return "Custom pricing";
    const naira = kobo / 100;
    return `₦${naira.toLocaleString("en-NG")}/mo`;
}

const FEATURE_LABELS: Record<keyof PlanFeatures, string> = {
    multi_step_approvals: "multi-step approvals",
    department_permissions: "department permissions",
    full_reporting_dashboard: "full reporting",
    audit_log_export: "audit log export",
    priority_support: "priority support",
};

function buildBlurb(cfg: PlanConfig): string {
    const price = formatPrice(cfg.monthly_price);

    if (cfg.monthly_price === 0) {
        return `${price} — unlimited departments & users`;
    }

    const highlights = Object.entries(cfg.features)
        .filter(([, enabled]) => enabled)
        .map(([key]) => FEATURE_LABELS[key as keyof PlanFeatures]);

    if (highlights.length > 0) {
        return `${price} — ${highlights.slice(0, 2).join(", ")}`;
    }

    const deptLabel = cfg.max_departments === -1 ? "unlimited departments" : `up to ${cfg.max_departments} departments`;
    const userLabel = cfg.max_users === -1 ? "unlimited users" : `${cfg.max_users} users`;
    return `${price} — ${deptLabel}, ${userLabel}`;
}

function buildWhatsappLink(orgName: string, workers: string): string {
    const lines = [ENTERPRISE_WHATSAPP_MESSAGE];
    if (orgName.trim()) lines.push(`Organization: ${orgName.trim()}`);
    if (workers.trim()) lines.push(`Team size: ${workers.trim()}`);
    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/${ENTERPRISE_WHATSAPP_NUMBER}?text=${text}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
    const [searchParams] = useSearchParams();
    const incomingPlan = searchParams.get("plan");
    const incomingBilling = searchParams.get("billing"); // "monthly" | "yearly" — carried for future use

    const { data: plans, isLoading: plansLoading } = usePlans();

    const [organizationName, setOrganizationName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [numberOfWorkers, setNumberOfWorkers] = useState("");
    const [plan, setPlan] = useState<PlanOption>(
        isPlanOption(incomingPlan) ? incomingPlan : "starter"
    );

    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [error, setError] = useState<string | null>(null);

    const { mutate: setupWorkspace, isPending: loading } = useSetupWorkspace();

    const isEnterprise = plan === "enterprise";

    const planOptions = useMemo(() => {
        if (!plans) return [];
        return PLAN_ORDER.map((value) => ({
            value,
            label: plans[value].name,
            blurb: buildBlurb(plans[value]),
        }));
    }, [plans]);

    function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Logo must be an image file.");
            return;
        }

        setLogo(file);
        setLogoPreview(URL.createObjectURL(file));
    }

    function removeLogo() {
        setLogo(null);
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEnterprise) return; // enterprise routes to WhatsApp, never submits the form
        setError(null);

        if (!organizationName.trim() || !email.trim() || !password.trim() || !numberOfWorkers.trim()) {
            setError("Fill in all required fields to continue.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setupWorkspace(
            {
                organization_name: organizationName.trim(),
                email: email.trim(),
                password,
                number_of_workers: Number(numberOfWorkers),
                plan,
                logo: logo ?? undefined,
            },
            {
                onSuccess: (data) => {
                    if (data.checkout_link) {
                        window.location.href = data.checkout_link;
                    } else {
                        window.location.href = "/login";
                    }
                },
                onError: (err) => {
                    setError(
                        (err.response?.data as any)?.message ||
                        err.message ||
                        "Something went wrong. Try again."
                    );
                },
            }
        );
    }

    return (
        <div className="min-h-screen w-full bg-zinc-950 text-zinc-300 font-sans flex items-center justify-center px-3 py-12">
            <div className="w-full max-w-lg">

                {error && (
                    <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-3 mb-5">
                        <Warning2 size={15} color="currentColor" className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-pri border border-zinc-800 rounded-xl p-4 lg:p-7 space-y-5">
                    <Logo />

                    <div className="mb-7">
                        <h1 className="text-xl font-medium text-zinc-100 tracking-tight">Set up your workspace</h1>
                        {incomingPlan && (
                            <p className="text-xs text-zinc-500 mt-1.5">
                                You selected the <span className="text-zinc-300 font-medium capitalize">{incomingPlan}</span> plan
                                {incomingBilling === "yearly" ? " (billed yearly)" : ""} — you can change it below.
                            </p>
                        )}
                    </div>

                    {/* Logo (optional) */}
                    <fieldset disabled={isEnterprise} className={isEnterprise ? "opacity-40 pointer-events-none" : undefined}>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-2">
                                Organization Logo <span className="text-zinc-600">(optional)</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {logoPreview ? (
                                        <>
                                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={removeLogo}
                                                className="absolute -top-1.5 -right-1.5 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-400 hover:text-red-400 transition-colors"
                                            >
                                                <CloseCircle size={16} color="currentColor" />
                                            </button>
                                        </>
                                    ) : (
                                        <Building size={22} color="currentColor" className="text-zinc-700" />
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50 rounded-lg px-3.5 py-2 transition-all"
                                >
                                    <GalleryAdd size={14} color="currentColor" />
                                    {logo ? "Change image" : "Upload image"}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Organization Name */}
                        <div className="mt-5">
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Organization Name</label>
                            <div className="relative">
                                <Building size={16} color="currentColor" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    value={organizationName}
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                    placeholder="e.g. Bridgeworks Nigeria Ltd."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mt-5">
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Sms size={16} color="currentColor" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    autoComplete="email"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mt-5">
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock1 size={16} color="currentColor" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    autoComplete="new-password"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-10 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? <EyeSlash size={16} color="currentColor" /> : <Eye size={16} color="currentColor" />}
                                </button>
                            </div>
                        </div>

                        {/* Number of workers */}
                        <div className="mt-5">
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Number of Workers</label>
                            <div className="relative">
                                <Profile2User size={16} color="currentColor" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="number"
                                    min={1}
                                    value={numberOfWorkers}
                                    onChange={(e) => setNumberOfWorkers(e.target.value)}
                                    placeholder="e.g. 25"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Plan */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Plan</label>
                        {plansLoading ? (
                            <div className="space-y-2">
                                {PLAN_ORDER.map((p) => (
                                    <div key={p} className="h-14 rounded-lg border border-zinc-800 bg-zinc-900/40 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {planOptions.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className={`flex items-start gap-3 border rounded-lg px-3.5 py-3 cursor-pointer transition-all ${plan === opt.value
                                                ? "border-zinc-500 bg-zinc-800/50"
                                                : "border-zinc-800 hover:border-zinc-700"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="plan"
                                            value={opt.value}
                                            checked={plan === opt.value}
                                            onChange={() => setPlan(opt.value)}
                                            className="mt-0.5 accent-zinc-300"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-zinc-100">{opt.label}</p>
                                            <p className="text-xs text-zinc-500">{opt.blurb}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit — swapped for WhatsApp CTA on Enterprise */}
                    {isEnterprise ? (
                        <a
                            href={buildWhatsappLink(organizationName, numberOfWorkers)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-medium px-4 py-3 rounded-lg transition-all shadow-sm mt-2"
                        >
                            <Whatsapp size={16} color="currentColor" />
                            Chat with us on WhatsApp
                        </a>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading || plansLoading}
                            className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-medium px-4 py-3 rounded-lg transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                <>
                                    Complete Setup
                                    <ArrowRight size={15} color="currentColor" />
                                </>
                            )}
                        </button>
                    )}
                </form>

                <p className="text-[11px] text-zinc-600 text-center mt-6">
                    Need help? Contact support.
                </p>
            </div>
        </div>
    );
}