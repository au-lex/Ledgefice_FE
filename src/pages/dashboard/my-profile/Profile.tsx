import { useEffect, useRef, useState } from "react";
import { User, Camera, Trash } from "iconsax-react";
import toast from "react-hot-toast";
import Layout from "../../../layout/Layout";
import { useMe, useUpdateMe } from "../../../api/hooks/useAuth";

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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-300 font-sans pb-16 selection:bg-gray-200 selection:text-gray-900 dark:selection:bg-zinc-800 dark:selection:text-zinc-100">

        {/* Top Nav */}
        <div className="border-b border-gray-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between m">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800/80 shadow-sm text-gray-600 dark:text-zinc-400">
                <User size={18} color="currentColor" />
              </div>
              <h1 className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                Profile Settings
              </h1>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8 ">
          <div className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/50 rounded-xl overflow-hidden shadow-sm">

            <div className="p-5 sm:p-8 border-b border-gray-200 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">My Profile</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Manage your personal information and password.</p>
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest shadow-inner flex-shrink-0 overflow-hidden">
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
                      className="px-3 sm:px-4 py-2 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-lg hover:bg-black dark:hover:bg-white transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Camera size={14} color="currentColor" /> <span className="hidden xs:inline">Change Picture</span><span className="xs:hidden">Change</span>
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleClearAvatarSelection}
                        className="px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash size={14} color="currentColor" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-500">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">Job Title</label>
                  <input
                    type="text"
                    value=""
                    placeholder="—"
                    disabled
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-500 dark:text-zinc-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">Department</label>
                  <input
                    type="text"
                    value={deptName}
                    disabled
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-500 dark:text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Change Password */}
              <div className="pt-6 border-t border-gray-200 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">Change Password</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-2xl">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={updateMe.isPending}
                  className="mt-4 px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-xs font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all border border-gray-200 dark:border-zinc-700 disabled:opacity-50"
                >
                  {updateMe.isPending ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/80 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={updateMe.isPending || isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-black dark:hover:bg-white transition-all shadow-sm disabled:opacity-50"
              >
                {updateMe.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}