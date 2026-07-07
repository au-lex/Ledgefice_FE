import { useEffect, useRef, useState } from "react";
import { Buildings, Camera, Trash, Lock } from "iconsax-react";
import toast from "react-hot-toast";
import Layout from "../../../layout/Layout";
import {
  useOrganization,
  useUpdateOrganization,
  useChangePassword,
} from "../../../api/hooks/useOnboarding";

export default function OrganisationSettingsPage() {
  const { data: org, isLoading } = useOrganization();
  const updateOrg = useUpdateOrganization();
  const changePassword = useChangePassword();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [numberOfWorkers, setNumberOfWorkers] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (org) {
      setName(org.name);
      setNumberOfWorkers(String(org.number_of_workers ?? ""));
    }
  }, [org?.name, org?.number_of_workers]);

  const handlePickLogo = () => fileInputRef.current?.click();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Image must be 1MB or smaller");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleClearLogoSelection = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    const payload: { name?: string; number_of_workers?: number; logo?: File } = {};

    if (name.trim() && name.trim() !== org?.name) payload.name = name.trim();

    const parsedWorkers = Number(numberOfWorkers);
    if (
      numberOfWorkers.trim() !== "" &&
      !Number.isNaN(parsedWorkers) &&
      parsedWorkers !== org?.number_of_workers
    ) {
      payload.number_of_workers = parsedWorkers;
    }

    if (logoFile) payload.logo = logoFile;

    if (!payload.name && payload.number_of_workers === undefined && !payload.logo) {
      toast.error("No changes to save");
      return;
    }

    updateOrg.mutate(payload, {
      onSuccess: () => {
        setLogoFile(null);
        setLogoPreview(null);
      },
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    changePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  const logoUrl = logoPreview || org?.logo_url;
  const initials = (org?.name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50
       bg-zinc-950 text-gray-900 text-zinc-300 
        pb-16 selection:bg-gray-200 selection:text-gray-900 
        selection:bg-zinc-800 selection:text-zinc-100">

        {/* Top Nav */}
        <div className="border-b border-gray-200 border-zinc-800/80 bg-white/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between  mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 bg-zinc-900 rounded-lg border border-gray-200 border-zinc-800/80 shadow-sm text-gray-600 text-zinc-400">
                <Buildings size={18} color="currentColor" />
              </div>
              <h1 className="text-sm font-medium text-gray-900 text-zinc-100">
                Organisation Settings
              </h1>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          <div className="bg-white bg-zinc-900/40 border border-gray-200 border-zinc-800/50 rounded-xl overflow-hidden shadow-sm">

            <div className="p-5 sm:p-8 border-b border-gray-200 border-zinc-800/80 bg-gray-50 bg-zinc-900">
              <h2 className="text-lg font-semibold text-gray-900 text-zinc-100">Organisation Profile</h2>
              <p className="text-xs text-zinc-500 mt-1">Manage your organisation's information.</p>
            </div>

            <div className="p-5 sm:p-8 space-y-8">

              {/* Logo Section */}
              <div className="flex items-center gap-4 sm:gap-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 bg-zinc-800 border border-gray-200 border-zinc-700 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-400 text-zinc-500 uppercase tracking-widest shadow-inner flex-shrink-0 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt={org?.name || "Logo"} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handlePickLogo}
                      className="px-3 sm:px-4 py-2 bg-gray-900 bg-zinc-100 text-white text-zinc-900 text-xs font-medium rounded-lg hover:bg-black hover:bg-white transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Camera size={14} color="currentColor" /> <span className="hidden xs:inline">Change Logo</span><span className="xs:hidden">Change</span>
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleClearLogoSelection}
                        className="px-3 py-2 border border-gray-200 border-zinc-700 bg-white bg-zinc-900 text-red-600 text-red-400 text-xs font-medium rounded-lg hover:bg-red-50 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash size={14} color="currentColor" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500">JPG, PNG or WEBP. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 text-zinc-400 mb-1.5">Organisation Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 text-zinc-400 mb-1.5">Number of Workers</label>
                  <input
                    type="number"
                    min={0}
                    value={numberOfWorkers}
                    onChange={(e) => setNumberOfWorkers(e.target.value)}
                    className="w-full bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 text-zinc-400 mb-1.5">Plan</label>
                  <input
                    type="text"
                    value={org?.plan ? org.plan.charAt(0).toUpperCase() + org.plan.slice(1) : ""}
                    disabled
                    className="w-full bg-gray-50 bg-zinc-900 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 text-zinc-400 mb-1.5">Max Departments / Users</label>
                  <input
                    type="text"
                    value={
                      org
                        ? `${org.limits.max_departments === -1 ? "Unlimited" : org.limits.max_departments} / ${org.limits.max_users === -1 ? "Unlimited" : org.limits.max_users
                        }`
                        : ""
                    }
                    disabled
                    className="w-full bg-gray-50 bg-zinc-900 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 border-zinc-800 bg-gray-50 bg-zinc-900/80 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={updateOrg.isPending || isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-900 bg-zinc-100 text-white text-zinc-900 text-sm font-medium hover:bg-black hover:bg-white transition-all shadow-sm disabled:opacity-50"
              >
                {updateOrg.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white bg-zinc-900/40 border border-gray-200 border-zinc-800/50 rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 sm:p-8 border-b border-gray-200 border-zinc-800/80 bg-gray-50 bg-zinc-900 flex items-center gap-3">
              <div className="p-2 bg-gray-100 bg-zinc-900 rounded-lg border border-gray-200 border-zinc-800/80 shadow-sm text-gray-600 text-zinc-400">
                <Lock size={16} color="currentColor" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 text-zinc-100">Password</h2>
                <p className="text-xs text-zinc-500 mt-1">Update the password used to sign in.</p>
              </div>
            </div>

            <div className="p-5 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-700 text-zinc-400 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 text-zinc-400 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 text-zinc-400 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 transition-all"
                  />
                </div>
              </div>
              <p className="text-[10px] text-zinc-500">Must be at least 8 characters.</p>
            </div>

            <div className="p-4 border-t border-gray-200 border-zinc-800 bg-gray-50 bg-zinc-900/80 flex justify-end">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changePassword.isPending}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-900 bg-zinc-100 text-white text-zinc-900 text-sm font-medium hover:bg-black hover:bg-white transition-all shadow-sm disabled:opacity-50"
              >
                {changePassword.isPending ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}