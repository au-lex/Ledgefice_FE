import React, { useState } from "react";
import {
  Sms,
  Warning2,
  ArrowRight,
  ArrowLeft,
  TickCircle,
} from "iconsax-react";
import Logo from "../../components/Logo";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setIsLoading(true);

    // TODO: wire up your forgot-password call here
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-300 font-sans">
      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-3 md:p-6 sm:p-10">
        <div className="w-full max-w-[26rem] bg-pri p-6 border rounded-md border-zinc-800">
          <Logo />

          {submitted ? (
            <>
              <div className="mb-8 mt-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                  <TickCircle
                    size={22}
                    color="currentColor"
                    className="text-emerald-500"
                  />
                </div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-zinc-100 tracking-tight">
                  Check your email
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1.5">
                  If an account exists for{" "}
                  <span className="text-gray-700 dark:text-zinc-300 font-medium">
                    {email}
                  </span>
                  , we've sent a link to reset your password.
                </p>
              </div>

              <a
                href="/login"
                className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-medium px-4 py-3 rounded-lg transition-all shadow-sm"
              >
                <ArrowLeft size={15} color="currentColor" />
                Back to Sign In
              </a>

              <p className="text-[11px] text-gray-400 dark:text-zinc-600 text-center mt-6">
                Didn't get the email?{" "}
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-gray-600 dark:text-zinc-400 font-medium hover:text-gray-900 dark:hover:text-zinc-200 transition-colors"
                >
                  Try a different address
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="mb-8 mt-4">
                <h2 className="text-xl font-medium text-gray-900 dark:text-zinc-100 tracking-tight">
                  Forgot your password?
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1.5">
                  Enter your email and we'll send you a link to reset it.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3.5 py-3 mb-5">
                  <Warning2
                    size={15}
                    color="currentColor"
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Sms
                      size={16}
                      color="currentColor"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      autoComplete="email"
                      className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-sm text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-medium px-4 py-3 rounded-lg transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 dark:border-zinc-900/40 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight size={15} color="currentColor" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-gray-400 dark:text-zinc-600 text-center mt-8">
                Remembered your password?{" "}
                <a
                  href="/login"
                  className="text-gray-600 dark:text-zinc-400 font-medium hover:text-gray-900 dark:hover:text-zinc-200 transition-colors"
                >
                  Back to Sign In
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}