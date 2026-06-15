import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PageSkeleton } from "@/components/loaders/PageSkeleton";
import { permissions } from "@/constants/permissions";
import { LoginPage } from "@/modules/auth/LoginPage";

const AppShell = lazy(() =>
  import("@/layouts/AppShell").then((module) => ({ default: module.AppShell })),
);
const ForgotPasswordPage = lazy(() =>
  import("@/modules/auth/ForgotPasswordPage").then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("@/modules/auth/ResetPasswordPage").then((module) => ({
    default: module.ResetPasswordPage,
  })),
);
const SessionExpiredPage = lazy(() =>
  import("@/modules/auth/SessionExpiredPage").then((module) => ({
    default: module.SessionExpiredPage,
  })),
);
const ChangePasswordPage = lazy(() =>
  import("@/modules/auth/ChangePasswordPage").then((module) => ({
    default: module.ChangePasswordPage,
  })),
);
const DashboardPage = lazy(() =>
  import("@/modules/dashboard/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const EmployeesPage = lazy(() =>
  import("@/modules/employees/EmployeesPage").then((module) => ({
    default: module.EmployeesPage,
  })),
);
const EmployeeProfilePage = lazy(() =>
  import("@/modules/employees/EmployeeProfilePage").then((module) => ({
    default: module.EmployeeProfilePage,
  })),
);
const AttendancePage = lazy(() =>
  import("@/modules/attendance/AttendancePage").then((module) => ({
    default: module.AttendancePage,
  })),
);
const LeavesPage = lazy(() =>
  import("@/modules/leaves/LeavesPage").then((module) => ({
    default: module.LeavesPage,
  })),
);
const RecruitmentPage = lazy(() =>
  import("@/modules/recruitment/RecruitmentPage").then((module) => ({
    default: module.RecruitmentPage,
  })),
);
const InterviewsPage = lazy(() =>
  import("@/modules/interviews/InterviewsPage").then((module) => ({
    default: module.InterviewsPage,
  })),
);
const OnboardingPage = lazy(() =>
  import("@/modules/onboarding/OnboardingPage").then((module) => ({
    default: module.OnboardingPage,
  })),
);
const PreOnboardingPage = lazy(() =>
  import("@/modules/pre-onboarding/PreOnboardingPage").then((module) => ({
    default: module.PreOnboardingPage,
  })),
);
const PreOnboardingPortalPage = lazy(() =>
  import("@/modules/pre-onboarding/PreOnboardingPortalPage").then((module) => ({
    default: module.PreOnboardingPortalPage,
  })),
);
const FnFSettlementPage = lazy(() =>
  import("@/modules/fnf-settlement/FnFSettlementPage").then((module) => ({
    default: module.FnFSettlementPage,
  })),
);
const FnFSettlementDetailPage = lazy(() =>
  import("@/modules/fnf-settlement/FnFSettlementDetailPage").then((module) => ({
    default: module.FnFSettlementDetailPage,
  })),
);
const TasksPage = lazy(() =>
  import("@/modules/tasks/TasksPage").then((module) => ({
    default: module.TasksPage,
  })),
);
const MailersAndDocsPage = lazy(() =>
  import("@/modules/mailers-and-docs/MailersAndDocsPage").then((module) => ({
    default: module.MailersAndDocsPage,
  })),
);
const RolesPage = lazy(() =>
  import("@/modules/roles/RolesPage").then((module) => ({
    default: module.RolesPage,
  })),
);
const PermissionsPage = lazy(() =>
  import("@/modules/permissions/PermissionsPage").then((module) => ({
    default: module.PermissionsPage,
  })),
);
const NotificationsPage = lazy(() =>
  import("@/modules/notifications/NotificationsPage").then((module) => ({
    default: module.NotificationsPage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/modules/settings/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);
const ActivityLogsPage = lazy(() =>
  import("@/modules/activity-logs/ActivityLogsPage").then((module) => ({
    default: module.ActivityLogsPage,
  })),
);
const AuditLogsPage = lazy(() =>
  import("@/modules/audit-logs/AuditLogsPage").then((module) => ({
    default: module.AuditLogsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("@/modules/profile/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);

function lazyElement(element: ReactNode) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
    </ErrorBoundary>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/onboarding/:token", element: lazyElement(<PreOnboardingPortalPage />) },
  { path: "/forgot-password", element: lazyElement(<ForgotPasswordPage />) },
  { path: "/reset-password", element: lazyElement(<ResetPasswordPage />) },
  { path: "/session-expired", element: lazyElement(<SessionExpiredPage />) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: lazyElement(<AppShell />),
        children: [
          {
            path: "/change-password",
            element: lazyElement(<ChangePasswordPage />),
          },
          { path: "/dashboard", element: lazyElement(<DashboardPage />) },
          {
            element: (
              <ProtectedRoute
                permissions={[
                  permissions.employeeRead,
                  permissions.employeeWrite,
                  permissions.employeeUserManage,
                ]}
              />
            ),
            children: [
              {
                path: "/employees",
                element: lazyElement(<EmployeesPage />),
              },
              {
                path: "/employees/:id",
                element: lazyElement(<EmployeeProfilePage />),
              },
              {
                path: "/employee-directory",
                element: <Navigate to="/employees" replace />,
              },
              {
                path: "/user-management",
                element: <Navigate to="/employees" replace />,
              },
            ],
          },
          {
            element: (
              <ProtectedRoute
                permissions={[
                  permissions.tasksReadSelf,
                  permissions.tasksReadTeam,
                  permissions.tasksReadDepartment,
                  permissions.tasksReadAll,
                ]}
              />
            ),
            children: [{ path: "/tasks", element: lazyElement(<TasksPage />) }],
          },
          {
            path: "/people",
            element: <Navigate to="/employees" replace />,
          },
          {
            path: "/people/*",
            element: <Navigate to="/employees" replace />,
          },
          {
            path: "/attendance",
            element: lazyElement(<AttendancePage />),
          },
          {
            element: (
              <ProtectedRoute
                permissions={[
                  permissions.leaveRead,
                  permissions.leaveWrite,
                  permissions.leaveApprove,
                ]}
              />
            ),
            children: [{ path: "/leaves", element: lazyElement(<LeavesPage />) }],
          },
          {
            element: <ProtectedRoute permissions={[permissions.employeeWrite]} />,
            children: [
              { path: "/onboarding", element: lazyElement(<OnboardingPage />) },
            ],
          },
          {
            element: (
              <ProtectedRoute
                permissions={[
                  permissions.fnfRead,
                  permissions.fnfWrite,
                  permissions.fnfApprove,
                  permissions.fnfManage,
                ]}
              />
            ),
            children: [
              {
                path: "/fnf-settlement",
                element: lazyElement(<FnFSettlementPage />),
              },
              {
                path: "/fnf-settlement/:id",
                element: lazyElement(<FnFSettlementDetailPage />),
              },
            ],
          },
          {
            element: (
              <ProtectedRoute
                permissions={[permissions.jobRead, permissions.applicationRead]}
              />
            ),
            children: [
              {
                path: "/recruitment",
                element: lazyElement(<RecruitmentPage />),
              },
            ],
          },
          {
            element: (
              <ProtectedRoute permissions={[permissions.interviewManage]} />
            ),
            children: [
              { path: "/interviews", element: lazyElement(<InterviewsPage />) },
            ],
          },
          {
            element: (
              <ProtectedRoute
                permissions={[
                  permissions.preOnboardingRead,
                  permissions.preOnboardingVerify,
                ]}
              />
            ),
            children: [
              {
                path: "/pre-onboarding",
                element: lazyElement(<PreOnboardingPage />),
              },
            ],
          },
          {
            element: (
              <ProtectedRoute permissions={[permissions.employeeWrite]} />
            ),
            children: [
              { path: "/onboarding", element: lazyElement(<OnboardingPage />) },
            ],
          },
          {
            element: <ProtectedRoute permissions={[permissions.jobWrite]} />,
            children: [
              {
                path: "/mailers-and-docs",
                element: lazyElement(<MailersAndDocsPage />),
              },
              { path: "/offer-letters", element: lazyElement(<Navigate to="/mailers-and-docs" replace />) },
              { path: "/templates", element: lazyElement(<Navigate to="/mailers-and-docs" replace />) },
            ],
          },
          {
            element: <ProtectedRoute permissions={[permissions.rbacManage]} />,
            children: [
              { path: "/roles", element: lazyElement(<RolesPage />) },
              {
                path: "/permissions",
                element: lazyElement(<PermissionsPage />),
              },
              { path: "/settings", element: lazyElement(<SettingsPage />) },
              {
                path: "/activity-logs",
                element: lazyElement(<ActivityLogsPage />),
              },
              { path: "/audit-logs", element: lazyElement(<AuditLogsPage />) },
            ],
          },
          {
            path: "/notifications",
            element: lazyElement(<NotificationsPage />),
          },
          { path: "/profile", element: lazyElement(<ProfilePage />) },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
