import React, { useState } from "react";
import {
  Lock1,
  Eye,
  EyeSlash,
  Warning2,
  ArrowRight,
  ArrowLeft,
  TickCircle,
} from "iconsax-react";
import Logo from "../../components/Logo";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || !confirmPassword.trim()) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    setIsLoading(true);

    // TODO: wire up your reset-password call here (token comes from route/query param)
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
                  Password reset
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1.5">
                  Your password has been updated successfully. You can now sign
                  in with your new password.
                </p>
              </div>

              <a
                href="/login"
                className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-medium px-4 py-3 rounded-lg transition-all shadow-sm"
              >
                <ArrowLeft size={15} color="currentColor" />
                Back to Sign In
              </a>
            </>
          ) : (
            <>
              <div className="mb-8 mt-4">
                <h2 className="text-xl font-medium text-gray-900 dark:text-zinc-100 tracking-tight">
                  Reset your password
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1.5">
                  Choose a new password for your account.
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
                {/* New Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock1
                      size={16}
                      color="currentColor"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-10 py-3 text-sm text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlash size={16} color="currentColor" />
                      ) : (
                        <Eye size={16} color="currentColor" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock1
                      size={16}
                      color="currentColor"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-10 py-3 text-sm text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeSlash size={16} color="currentColor" />
                      ) : (
                        <Eye size={16} color="currentColor" />
                      )}
                    </button>
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
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight size={15} color="currentColor" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}