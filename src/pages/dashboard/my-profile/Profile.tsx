import React from "react";
import { Setting2, User, Camera, Trash } from "iconsax-react";
import Layout from "../../../layout/Layout";

export default function ProfilePage() {
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest shadow-inner flex-shrink-0">
                  EI
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 sm:px-4 py-2 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-lg hover:bg-black dark:hover:bg-white transition-colors flex items-center gap-2 shadow-sm">
                      <Camera size={14} color="currentColor" /> <span className="hidden xs:inline">Change Picture</span><span className="xs:hidden">Change</span>
                    </button>
                    <button className="px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <Trash size={14} color="currentColor" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-500">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Emeka Ibe"
                    className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    defaultValue="e.ibe@company.com"
                    className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">Job Title</label>
                  <input
                    type="text"
                    defaultValue="Finance Director"
                    disabled
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-500 dark:text-zinc-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">Department</label>
                  <input
                    type="text"
                    defaultValue="Finance"
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
                    <input type="password" placeholder="••••••••" className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all" />
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-xs font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all border border-gray-200 dark:border-zinc-700">
                  Update Password
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/80 flex justify-end">
              <button className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-black dark:hover:bg-white transition-all shadow-sm">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}