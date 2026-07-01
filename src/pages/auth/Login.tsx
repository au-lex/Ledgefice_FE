import React, { useState } from "react";
import {
  Sms,
  Lock1,
  Eye,
  EyeSlash,
  Warning2,
  ArrowRight,
} from "iconsax-react";
import Logo from "../../components/Logo";
import { useLogin } from "../../api/hooks/useAuth";

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          // navigate to dashboard — swap for your router call
          window.location.href = "/dashboard";
        },
      },
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-300 font-sans">
      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-3 md:p-6 sm:p-10">
        <div className="w-full max-w-[26rem] bg-pri p-6 border rounded-md border-zinc-800">
          <Logo />

          <div className="mb-8 mt-4">
            <h2 className="text-xl font-medium text-gray-900 dark:text-zinc-100 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1.5">
              Sign in with the credentials provided by your administrator.
            </p>
          </div>

          {login.error && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3.5 py-3 mb-5">
              <Warning2
                size={15}
                color="currentColor"
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                {login.error.message}
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400">
                  Password
                </label>
                <a
                  href="#forgot-password"
                  className="text-[11px] font-medium text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
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
                  autoComplete="current-password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-medium px-4 py-3 rounded-lg transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {login.isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 dark:border-zinc-900/40 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={15} color="currentColor" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-gray-400 dark:text-zinc-600 text-center mt-8">
            Need access? Contact your department head or system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}