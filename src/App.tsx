import * as React from "react";
import {
  createBrowserRouter,

  RouterProvider,
} from "react-router-dom";

import "./App.css";

import RootLayout from "../src/layout/RootLayout";

import LandingPage from "./pages/landing-page/landing";




import ComingSoon from "./components/ComingSoon";
import VouchersPage from "./pages/dashboard/voucher-mgt/Voucher";
import ReportsPage from "./pages/dashboard/reports/Reports";
import DepartmentsPage from "./pages/dashboard/department-mgt/Department";
import ApprovalChainsPage from "./pages/dashboard/ApproveChain/ApproveChain";
import ApprovalInboxPage from "./pages/dashboard/approvals/Approval";
import UsersRolesPage from "./pages/dashboard/users-mgt/UserMgt";
import AuditLogPage from "./pages/dashboard/audit/AuditMgt";
import AllVouchersPage from "./pages/dashboard/all-vouchers/AllVouchers";
import BillingPage from "./pages/dashboard/billings/Billings";
import SettingsPage from "./pages/dashboard/settings/SettingsPage";
import VoucherTypesPage from "./pages/dashboard/voucher-types/VoucherTypes";
import LoginPage from "./pages/auth/Login";
import OnboardingPage from "./pages/auth/Onboarding";
import ProfilePage from "./pages/dashboard/my-profile/Profile";
import PaymentStatusPage from "./pages/payment/VerifyPayment";
import ForgotPasswordPage from "./pages/auth/ForgotPsw";
import ResetPasswordPage from "./pages/auth/ResetPsw";
import OnboardingTestPage from "./pages/tour-assistant/test";



const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <LandingPage /> },

      { path: "/login", element: <LoginPage /> },
      { path: "/onboarding", element: <OnboardingPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage/> },

      { path: "/payment/:status", element: <PaymentStatusPage /> },


      { path: "/voucher", element: <VouchersPage /> },
      { path: "/reports", element: <ReportsPage /> },
      { path: "/departments", element: <DepartmentsPage /> },
      { path: "/approval-chains", element: <ApprovalChainsPage /> },
      { path: "/approvals", element: <ApprovalInboxPage /> },
      { path: "/departments", element: <DepartmentsPage /> },
      { path: "/users", element: <UsersRolesPage /> },
      { path: "/audit-logs", element: <AuditLogPage /> },
      { path: "/all-vouchers", element: <AllVouchersPage /> },
      { path: "/voucher-types", element: <VoucherTypesPage /> },
      { path: "/billings", element: <BillingPage /> },



      { path: "/settings", element: <SettingsPage /> },
      { path: "/profile", element: <ProfilePage /> },

      { path: "/test", element: <OnboardingTestPage />} , 

      { path: "*", element: <ComingSoon /> },
    ],
  },
]);

export default function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}