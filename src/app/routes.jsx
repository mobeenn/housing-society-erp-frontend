import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";

// Settings pages
import SocietyProfilePage from "@/features/settings/SocietyProfilePage";
import NumberingRulesPage from "@/features/settings/NumberingRulesPage";
import MasterDataPage from "@/features/settings/MasterDataPage";
import AuditLogPage from "@/features/settings/AuditLogPage";

// User & Role Management pages
import UsersListPage from "@/features/users-roles/UsersListPage";
import UserFormPage from "@/features/users-roles/UserFormPage";
import RolesListPage from "@/features/users-roles/RolesListPage";
import RolePermissionsPage from "@/features/users-roles/RolePermissionsPage";
import AccessControlPage from "@/features/users-roles/AccessControlPage";

// Members pages
import MembersListPage from "@/features/members/MembersListPage";
import MemberFormPage from "@/features/members/MemberFormPage";
import Member360Page from "@/features/members/Member360Page";
import PlotsListPage from "@/features/properties/PlotsListPage";
import PlotFormPage from "@/features/properties/PlotFormPage";
import PlotDetailPage from "@/features/properties/PlotDetailPage";
import BookingsListPage from "@/features/bookings/BookingsListPage";
import NewBookingPage from "@/features/bookings/NewBookingPage";
import BookingDetailPage from "@/features/bookings/BookingDetailPage";
import PaymentsListPage from "@/features/payments/PaymentsListPage";
import RecordPaymentPage from "@/features/payments/RecordPaymentPage";
import PaymentDetailPage from "@/features/payments/PaymentDetailPage";
import MemberStatementPage from "@/features/payments/MemberStatementPage";
import RefundsPage from "@/features/payments/RefundsPage";
import ReportsPage from "@/features/finance-reports/ReportsPage";
import InvoicesListPage from "@/features/invoices/InvoicesListPage";
import RecoveryPage from "@/features/recovery/RecoveryPage";
import RecoveryPortalPage from "@/features/recovery/RecoveryPortalPage";
import RecoveryAdminPage from "@/features/recovery/RecoveryAdminPage";
import OverdueInstallmentsPage from "@/features/recovery/overdue/OverdueInstallmentsPage";
import NoticeBoardPage from "@/features/notices/NoticeBoardPage";
import NoticeFormPage from "@/features/notices/NoticeFormPage";
import ExpensesListPage from "@/features/expenses/ExpensesListPage";
import ExpenseFormPage from "@/features/expenses/ExpenseFormPage";
import TransfersListPage from "@/features/transfers/TransfersListPage";
import TransferRequestPage from "@/features/transfers/TransferRequestPage";
import TransferDetailPage from "@/features/transfers/TransferDetailPage";
import PossessionListPage from "@/features/possession/PossessionListPage";
import PossessionApplicationPage from "@/features/possession/PossessionApplicationPage";
import PossessionDetailPage from "@/features/possession/PossessionDetailPage";
import ConstructionListPage from "@/features/construction/ConstructionListPage";
import ConstructionApplicationPage from "@/features/construction/ConstructionApplicationPage";
import ConstructionDetailPage from "@/features/construction/ConstructionDetailPage";
import NocsListPage from "@/features/nocs/NocsListPage";
import NocApplicationPage from "@/features/nocs/NocApplicationPage";
import NocDetailPage from "@/features/nocs/NocDetailPage";
import ComplaintsBoardPage from "@/features/complaints/ComplaintsBoardPage";
import ComplaintFormPage from "@/features/complaints/ComplaintFormPage";
import ComplaintDetailPage from "@/features/complaints/ComplaintDetailPage";

// Maintenance pages
import WorkOrdersListPage from "@/features/maintenance/WorkOrdersListPage";
import WorkOrderFormPage from "@/features/maintenance/WorkOrderFormPage";
import WorkOrderDetailPage from "@/features/maintenance/WorkOrderDetailPage";
import AssetsPage from "@/features/maintenance/AssetsPage";

// Procurement pages
import VendorsPage from "@/features/procurement/VendorsPage";

// Security pages
import GuardRosterPage from "@/features/security/guards/GuardRosterPage";
import VehicleRegistryPage from "@/features/security/vehicles/VehicleRegistryPage";
import GateEntryPage from "@/features/security/visitors/GateEntryPage";
import ActiveVisitorsPage from "@/features/security/visitors/ActiveVisitorsPage";
import VisitorHistoryPage from "@/features/security/visitors/VisitorHistoryPage";
import PassesPage from "@/features/security/visitors/PassesPage";

// HR & Staff Management pages
import EmployeesPage from "@/features/hr/EmployeesPage";
import AttendancePage from "@/features/hr/AttendancePage";
import LeaveRequestsPage from "@/features/hr/LeaveRequestsPage";
import PayrollLayout from "@/features/hr-payroll/PayrollLayout";
import PayrollPage from "@/features/hr-payroll/PayrollPage";
import LoansPage from "@/features/hr-payroll/LoansPage";
import PayrollReportsPage from "@/features/hr-payroll/PayrollReportsPage";
import HRSetupPage from "@/features/hr-payroll/HRSetupPage";

// Phase 15 lifecycle and front-desk pages
import PlotMergePage from "@/features/plot-merge/PlotMergePage";
import BuybackPage from "@/features/buyback/BuybackPage";
import RegistryPage from "@/features/registry/RegistryPage";
import AppointmentsLayout from "@/features/appointments/AppointmentsLayout";
import AppointmentsTodayPage from "@/features/appointments/TodayPage";
import AppointmentsLogsPage from "@/features/appointments/LogsPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute requiredModule="dashboards" requiredAction="view">
            <DashboardPage />
          </ProtectedRoute>
        ),
      },

      // Administration / Settings Routes
      {
        path: "settings/profile",
        element: (
          <ProtectedRoute requiredModule="settings" requiredAction="view">
            <SocietyProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/numbering-rules",
        element: (
          <ProtectedRoute requiredModule="settings" requiredAction="view">
            <NumberingRulesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/master-data",
        element: (
          <ProtectedRoute requiredModule="settings" requiredAction="view">
            <MasterDataPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/audit-logs",
        element: (
          <ProtectedRoute requiredModule="audit" requiredAction="view">
            <AuditLogPage />
          </ProtectedRoute>
        ),
      },

      // Members Routes
      {
        path: "members",
        element: (
          <ProtectedRoute requiredModule="members" requiredAction="view">
            <MembersListPage />
          </ProtectedRoute>
        ),
      },

      // Properties Routes
      {
        path: "plots",
        element: (
          <ProtectedRoute requiredModule="plots" requiredAction="view">
            <PlotsListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "plots/new",
        element: (
          <ProtectedRoute requiredModule="plots" requiredAction="create">
            <PlotFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "plots/:id",
        element: (
          <ProtectedRoute requiredModule="plots" requiredAction="view">
            <PlotDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "plots/:id/edit",
        element: (
          <ProtectedRoute requiredModule="plots" requiredAction="edit">
            <PlotFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookings",
        element: (
          <ProtectedRoute requiredModule="bookings" requiredAction="view">
            <BookingsListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookings/new",
        element: (
          <ProtectedRoute requiredModule="bookings" requiredAction="create">
            <NewBookingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookings/:id",
        element: (
          <ProtectedRoute requiredModule="bookings" requiredAction="view">
            <BookingDetailPage />
          </ProtectedRoute>
        ),
      },
      // Irreversible lifecycle and front-desk routes
      {
        path: "plot-merge",
        element: (
          <ProtectedRoute requiredModule="plot-merge" requiredAction="view">
            <PlotMergePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "buyback",
        element: (
          <ProtectedRoute requiredModule="buyback" requiredAction="view">
            <BuybackPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "registry",
        element: (
          <ProtectedRoute requiredModule="registry" requiredAction="view">
            <RegistryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "appointments",
        element: (
          <ProtectedRoute requiredModule="appointments" requiredAction="view">
            <AppointmentsLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/appointments/today" replace /> },
          { path: "today", element: <AppointmentsTodayPage /> },
          { path: "logs", element: <AppointmentsLogsPage /> },
        ],
      },
      {
        path: "payments",
        element: (
          <ProtectedRoute requiredModule="payments" requiredAction="view">
            <PaymentsListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payments/new",
        element: (
          <ProtectedRoute requiredModule="payments" requiredAction="create">
            <RecordPaymentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payments/:id",
        element: (
          <ProtectedRoute requiredModule="payments" requiredAction="view">
            <PaymentDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "members/:id/statement",
        element: (
          <ProtectedRoute requiredModule="payments" requiredAction="view">
            <MemberStatementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "refunds",
        element: (
          <ProtectedRoute requiredModule="refunds" requiredAction="view">
            <RefundsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute requiredModule="reports" requiredAction="view">
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "invoices",
        element: (
          <ProtectedRoute requiredModule="invoices" requiredAction="view">
            <InvoicesListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "invoicing",
        element: (
          <ProtectedRoute requiredModule="invoices" requiredAction="view">
            <Navigate to="/invoices" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: "recovery",
        element: (
          <ProtectedRoute requiredModule="recovery" requiredAction="view">
            <RecoveryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "recovery/admin",
        element: (
          <ProtectedRoute requiredModule="recovery" requiredAction="create">
            <RecoveryAdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "recovery/portal",
        element: (
          <ProtectedRoute requiredModule="recovery" requiredAction="view">
            <RecoveryPortalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "recovery/overdue",
        element: (
          <ProtectedRoute requiredModule="recovery" requiredAction="view">
            <OverdueInstallmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "recovery/overdue-installments",
        element: (
          <ProtectedRoute requiredModule="recovery" requiredAction="view">
            <Navigate to="/recovery/overdue" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: "notices",
        element: (
          <ProtectedRoute requiredModule="notices" requiredAction="view">
            <NoticeBoardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "notices/new",
        element: (
          <ProtectedRoute requiredModule="notices" requiredAction="create">
            <NoticeFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "expenses",
        element: (
          <ProtectedRoute requiredModule="expenses" requiredAction="view">
            <ExpensesListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "expenses/new",
        element: (
          <ProtectedRoute requiredModule="expenses" requiredAction="create">
            <ExpenseFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "transfers",
        element: (
          <ProtectedRoute requiredModule="transfers" requiredAction="view">
            <TransfersListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "transfers/new",
        element: (
          <ProtectedRoute requiredModule="transfers" requiredAction="create">
            <TransferRequestPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "transfers/:id",
        element: (
          <ProtectedRoute requiredModule="transfers" requiredAction="view">
            <TransferDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "nocs",
        element: (
          <ProtectedRoute requiredModule="nocs" requiredAction="view">
            <NocsListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "nocs/new",
        element: (
          <ProtectedRoute requiredModule="nocs" requiredAction="create">
            <NocApplicationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "nocs/:id",
        element: (
          <ProtectedRoute requiredModule="nocs" requiredAction="view">
            <NocDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "possession",
        element: (
          <ProtectedRoute requiredModule="possession" requiredAction="view">
            <PossessionListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "possession/new",
        element: (
          <ProtectedRoute requiredModule="possession" requiredAction="create">
            <PossessionApplicationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "possession/:id",
        element: (
          <ProtectedRoute requiredModule="possession" requiredAction="view">
            <PossessionDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "construction",
        element: (
          <ProtectedRoute requiredModule="construction" requiredAction="view">
            <ConstructionListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "construction/new",
        element: (
          <ProtectedRoute requiredModule="construction" requiredAction="create">
            <ConstructionApplicationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "construction/:id",
        element: (
          <ProtectedRoute requiredModule="construction" requiredAction="view">
            <ConstructionDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "complaints",
        element: (
          <ProtectedRoute requiredModule="complaints" requiredAction="view">
            <ComplaintsBoardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "complaints/new",
        element: (
          <ProtectedRoute requiredModule="complaints" requiredAction="create">
            <ComplaintFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "complaints/:id",
        element: (
          <ProtectedRoute requiredModule="complaints" requiredAction="view">
            <ComplaintDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "maintenance",
        element: (
          <ProtectedRoute requiredModule="maintenance" requiredAction="view">
            <WorkOrdersListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "maintenance/new",
        element: (
          <ProtectedRoute requiredModule="maintenance" requiredAction="create">
            <WorkOrderFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "maintenance/:id",
        element: (
          <ProtectedRoute requiredModule="maintenance" requiredAction="view">
            <WorkOrderDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "assets",
        element: (
          <ProtectedRoute requiredModule="assets" requiredAction="view">
            <AssetsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "procurement/vendors",
        element: (
          <ProtectedRoute requiredModule="procurement" requiredAction="view">
            <VendorsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "security/guards",
        element: (
          <ProtectedRoute requiredModule="security-guards" requiredAction="view">
            <GuardRosterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "security/vehicles",
        element: (
          <ProtectedRoute requiredModule="security-vehicles" requiredAction="view">
            <VehicleRegistryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "security/visitors/entry",
        element: (
          <ProtectedRoute requiredModule="visitors" requiredAction="create">
            <GateEntryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "security/visitors/active",
        element: (
          <ProtectedRoute requiredModule="visitors" requiredAction="view">
            <ActiveVisitorsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "security/visitors/history",
        element: (
          <ProtectedRoute requiredModule="visitors" requiredAction="view">
            <VisitorHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "security/visitors/passes",
        element: (
          <ProtectedRoute requiredModule="visitors" requiredAction="view">
            <PassesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "members/new",
        element: (
          <ProtectedRoute requiredModule="members" requiredAction="create">
            <MemberFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "members/:id",
        element: (
          <ProtectedRoute requiredModule="members" requiredAction="view">
            <Member360Page />
          </ProtectedRoute>
        ),
      },
      {
        path: "members/:id/edit",
        element: (
          <ProtectedRoute requiredModule="members" requiredAction="edit">
            <MemberFormPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "admin/access-control",
        element: (
          <ProtectedRoute requiredModule="users-roles" requiredAction="edit" requiredSuperAdmin>
            <AccessControlPage />
          </ProtectedRoute>
        ),
      },
      // Users & Roles Management Routes
      {
        path: "admin/users",
        element: (
          <ProtectedRoute requiredModule="users-roles" requiredAction="edit">
            <UsersListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/users/new",
        element: (
          <ProtectedRoute requiredModule="users-roles" requiredAction="edit">
            <UserFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/users/:id/edit",
        element: (
          <ProtectedRoute requiredModule="users-roles" requiredAction="edit">
            <UserFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/roles",
        element: (
          <ProtectedRoute requiredModule="users-roles" requiredAction="edit">
            <RolesListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/roles/new",
        element: (
          <ProtectedRoute requiredModule="users-roles" requiredAction="edit" requiredSuperAdmin>
            <RolePermissionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/roles/:id/edit",
        element: (
          <ProtectedRoute requiredModule="users-roles" requiredAction="edit" requiredSuperAdmin>
            <RolePermissionsPage />
          </ProtectedRoute>
        ),
      },

      // HR & Staff Management Routes
      {
        path: "hr/employees",
        element: (
          <ProtectedRoute requiredModule="hr" requiredAction="view">
            <EmployeesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "hr/attendance",
        element: (
          <ProtectedRoute requiredModule="hr" requiredAction="view">
            <AttendancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "hr/leave-requests",
        element: (
          <ProtectedRoute requiredModule="hr" requiredAction="view">
            <LeaveRequestsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "hr/setup",
        element: (
          <ProtectedRoute requiredModule="hr-payroll" requiredAction="view">
            <HRSetupPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "hr/payroll",
        element: (
          <ProtectedRoute requiredModule="hr-payroll" requiredAction="view">
            <PayrollLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <PayrollPage /> },
          { path: "loans", element: <LoansPage /> },
          { path: "setup", element: <HRSetupPage /> },
          { path: "reports", element: <PayrollReportsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
