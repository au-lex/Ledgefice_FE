import { useEffect, useRef, useState } from "react";
import { User, Camera, Trash, TickCircle, CloseCircle, ShieldTick } from "iconsax-react";
import toast from "react-hot-toast";
import Layout from "../../../layout/Layout";
import { useMe, useUpdateMe } from "../../../api/hooks/useAuth";

function formatPermissionLabel(key: string) {
  return key
    .replace(/^can_/, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const PERMISSION_CATEGORIES: { label: string; match: (key: string) => boolean }[] = [
  { label: "Vouchers", match: (k) => k.includes("voucher") || k === "can_create" || k === "can_approve" || k === "can_dismiss_duplicates" },
  { label: "Approval Chains", match: (k) => k.includes("approval_chain") },
  { label: "Billing", match: (k) => k.includes("billing") },
  { label: "Departments", match: (k) => k.includes("department") },
  { label: "Reports & Audit", match: (k) => k.includes("report") || k.includes("audit") },
  { label: "Administration", match: (k) => k.includes("manage_users") || k.includes("configure") },
];

function categorizePermissions(entries: [string, boolean][]) {
  const groups = new Map<string, [string, boolean][]>();
  const other: [string, boolean][] = [];

  for (const entry of entries) {
    const category = PERMISSION_CATEGORIES.find((c) => c.match(entry[0]));
    if (category) {
      if (!groups.has(category.label)) groups.set(category.label, []);
      groups.get(category.label)!.push(entry);
    } else {
      other.push(entry);
    }
  }

  if (other.length > 0) groups.set("General", other);

  // Preserve category declaration order, General last
  const ordered: [string, [string, boolean][]][] = [];
  for (const cat of PERMISSION_CATEGORIES) {
    if (groups.has(cat.label)) ordered.push([cat.label, groups.get(cat.label)!]);
  }
  if (groups.has("General")) ordered.push(["General", groups.get("General")!]);

  return ordered;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const { data: user, isLoading } = useMe();
  const updateMe = useUpdateMe();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Seed local form state once the user loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user?.name, user?.email]);

  const handlePickAvatar = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Image must be 1MB or smaller");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleClearAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveProfile = () => {
    const payload: { name?: string; email?: string; avatar?: File } = {};

    if (name.trim() && name.trim() !== user?.name) payload.name = name.trim();
    if (email.trim() && email.trim() !== user?.email) payload.email = email.trim();
    if (avatarFile) payload.avatar = avatarFile;

    if (!payload.name && !payload.email && !payload.avatar) {
      toast.error("No changes to save");
      return;
    }

    updateMe.mutate(payload, {
      onSuccess: () => {
        setAvatarFile(null);
        setAvatarPreview(null);
      },
    });
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) {
      toast.error("Enter your current and new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    updateMe.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
        },
      },
    );
  };

  const avatarUrl = avatarPreview || user?.avatar_url;
  const deptName = user?.department?.name ?? "—";
  const deptCode = user?.department?.code;
  const orgName = user?.org?.name ?? "—";
  const orgPlan = user?.org?.plan;
  const orgPlanLabel =
    typeof orgPlan === "string" && orgPlan.length > 0
      ? orgPlan.charAt(0).toUpperCase() + orgPlan.slice(1)
      : undefined;

  const permissionEntries = Object.entries(user?.permissions ?? {}).filter(
    (entry): entry is [string, boolean] => typeof entry[1] === "boolean",
  );
  const grantedCount = permissionEntries.filter(([, v]) => v).length;
  const permissionGroups = categorizePermissions(permissionEntries);

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans pb-16 selection:bg-zinc-800 selection:text-zinc-100">

        {/* Top Nav */}
        <div className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800/80 shadow-sm text-zinc-400">
                <User size={18} color="currentColor" />
              </div>
              <h1 className="text-sm font-medium text-zinc-100">
                Profile Settings
              </h1>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">

            <div className="p-5 sm:p-8 border-b border-zinc-800/80 bg-zinc-900/90">
              <h2 className="text-lg font-semibold text-zinc-100">My Profile</h2>
              <p className="text-xs text-zinc-500 mt-1">Manage your personal information and password.</p>
            </div>

            <div className="p-5 sm:p-8 space-y-8">

              {/* Avatar Section */}
              <div className="flex items-center gap-4 sm:gap-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl sm:text-2xl font-bold text-zinc-500 uppercase tracking-widest shadow-inner flex-shrink-0 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user?.name || "Avatar"} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.name || "")
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handlePickAvatar}
                      className="px-3 sm:px-4 py-2 bg-zinc-100 text-zinc-900 text-xs font-medium rounded-lg hover:bg-white transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Camera size={14} color="currentColor" /> 
                      <span className="hidden sm:inline">Change Picture</span>
                      <span className="sm:hidden">Change</span>
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleClearAvatarSelection}
                        className="px-3 py-2 border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash size={14} color="currentColor" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600 transition-colors font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600 transition-colors font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Department</label>
                  <input
                    type="text"
                    value={deptCode ? `${deptName} (${deptCode})` : deptName}
                    disabled
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Organization</label>
                  <input
                    type="text"
                    value={orgPlanLabel ? `${orgName} — ${orgPlanLabel} plan` : orgName}
                    disabled
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={updateMe.isPending || isLoading}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-all shadow-sm disabled:opacity-50"
                >
                  {updateMe.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {/* Change Password */}
              <div className="pt-6 border-t border-zinc-800/80">
                <h3 className="text-sm font-semibold text-zinc-100 mb-4">Change Password</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-2xl">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600 transition-colors placeholder-zinc-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600 transition-colors placeholder-zinc-600 font-medium"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={updateMe.isPending}
                  className="mt-4 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-100 text-xs font-medium hover:bg-zinc-700 transition-all border border-zinc-700 disabled:opacity-50"
                >
                  {updateMe.isPending ? "Updating..." : "Update Password"}
                </button>
              </div>

              {/* Permissions */}
              <div className="pt-6 border-t border-zinc-800/80">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <ShieldTick size={16} color="currentColor" className="text-zinc-500" />
                    <h3 className="text-sm font-semibold text-zinc-100">
                      Your Permissions
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-500">
                    {grantedCount} of {permissionEntries.length} enabled
                  </span>
                </div>

                {permissionEntries.length === 0 ? (
                  <p className="text-xs text-zinc-500">
                    No permission data available.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {permissionGroups.map(([groupLabel, entries]) => (
                      <div
                        key={groupLabel}
                        className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80">
                          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                            {groupLabel}
                          </h4>
                        </div>
                        <div className="divide-y divide-zinc-800/80">
                          {entries.map(([key, granted]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-zinc-800/40 transition-colors"
                            >
                              <span
                                className={`text-xs ${granted
                                  ? "text-zinc-200"
                                  : "text-zinc-600"
                                  }`}
                              >
                                {formatPermissionLabel(key)}
                              </span>
                              {granted ? (
                                <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                                  <TickCircle size={13} color="currentColor" />
                                  Enabled
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-600">
                                  <CloseCircle size={13} color="currentColor" />
                                  Off
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-zinc-500 mt-4">
                  Permissions are set by your administrator and can't be changed here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}