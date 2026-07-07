import React, { useRef, useState } from "react";
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
} from "iconsax-react";
import Logo from "../../components/Logo";
import { useSetupWorkspace } from "../../api/hooks/useOnboarding";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanOption = "starter" | "business" | "enterprise";

const PLAN_OPTIONS: { value: PlanOption; label: string; blurb: string }[] = [
    { value: "starter", label: "Starter", blurb: "Free — up to 3 departments, 15 users" },
    { value: "business", label: "Business", blurb: "₦45,000/mo — multi-step approvals, full reporting" },
    { value: "enterprise", label: "Enterprise", blurb: "Custom pricing — unlimited departments & users" },
];

function isPlanOption(value: string | null): value is PlanOption {
    return value === "starter" || value === "business" || value === "enterprise";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
    const [searchParams] = useSearchParams();
    const incomingPlan = searchParams.get("plan");
    const incomingBilling = searchParams.get("billing"); // "monthly" | "yearly" — carried for future use

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
                    <div>
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
                    <div>
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
                    <div>
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
                    <div>
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

                    {/* Plan */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Plan</label>
                        <div className="space-y-2">
                            {PLAN_OPTIONS.map((opt) => (
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
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
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
                </form>

                <p className="text-[11px] text-zinc-600 text-center mt-6">
                    Need help? Contact support.
                </p>
            </div>
        </div>
    );
}