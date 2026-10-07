import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageSpinner from "@/components/PageSpinner";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));

const SocietyProfilePage = lazy(() => import("@/features/settings/SocietyProfilePage"));
const NumberingRulesPage = lazy(() => import("@/features/settings/NumberingRulesPage"));
const MasterDataPage = lazy(() => import("@/features/settings/MasterDataPage"));
const AuditLogPage = lazy(() => import("@/features/settings/AuditLogPage"));

const UsersListPage = lazy(() => import("@/features/users-roles/UsersListPage"));
const UserFormPage = lazy(() => import("@/features/users-roles/UserFormPage"));
const RolesListPage = lazy(() => import("@/features/users-roles/RolesListPage"));
const RolePermissionsPage = lazy(() => import("@/features/users-roles/RolePermissionsPage"));
const AccessControlPage = lazy(() => import("@/features/users-roles/AccessControlPage"));

const MembersListPage = lazy(() => import("@/features/members/MembersListPage"));
const MemberFormPage = lazy(() => import("@/features/members/MemberFormPage"));
const Member360Page = lazy(() => import("@/features/members/Member360Page"));
const PlotsListPage = lazy(() => import("@/features/properties/PlotsListPage"));
const PlotFormPage = lazy(() => import("@/features/properties/PlotFormPage"));
const PlotDetailPage = lazy(() => import("@/features/properties/PlotDetailPage"));
const BookingsListPage = lazy(() => import("@/features/bookings/BookingsListPage"));
const NewBookingPage = lazy(() => import("@/features/bookings/NewBookingPage"));
const BookingDetailPage = lazy(() => import("@/features/bookings/BookingDetailPage"));
const PaymentsListPage = lazy(() => import("@/features/payments/PaymentsListPage"));
const RecordPaymentPage = lazy(() => import("@/features/payments/RecordPaymentPage"));
const PaymentDetailPage = lazy(() => import("@/features/payments/PaymentDetailPage"));
const MemberStatementPage = lazy(() => import("@/features/payments/MemberStatementPage"));
const RefundsPage = lazy(() => import("@/features/payments/RefundsPage"));
const ReportsPage = lazy(() => import("@/features/finance-reports/ReportsPage"));
const InvoicesListPage = lazy(() => import("@/features/invoices/InvoicesListPage"));
const RecoveryPage = lazy(() => import("@/features/recovery/RecoveryPage"));
const RecoveryPortalPage = lazy(() => import("@/features/recovery/RecoveryPortalPage"));
const RecoveryAdminPage = lazy(() => import("@/features/recovery/RecoveryAdminPage"));
const OverdueInstallmentsPage = lazy(() => import("@/features/recovery/overdue/OverdueInstallmentsPage"));
const NoticeBoardPage = lazy(() => import("@/features/notices/NoticeBoardPage"));
const NoticeFormPage = lazy(() => import("@/features/notices/NoticeFormPage"));
const ExpensesListPage = lazy(() => import("@/features/expenses/ExpensesListPage"));
const ExpenseFormPage = lazy(() => import("@/features/expenses/ExpenseFormPage"));
const TransfersListPage = lazy(() => import("@/features/transfers/TransfersListPage"));
const TransferRequestPage = lazy(() => import("@/features/transfers/TransferRequestPage"));
const TransferDetailPage = lazy(() => import("@/features/transfers/TransferDetailPage"));
const PossessionListPage = lazy(() => import("@/features/possession/PossessionListPage"));
const PossessionApplicationPage = lazy(() => import("@/features/possession/PossessionApplicationPage"));
const PossessionDetailPage = lazy(() => import("@/features/possession/PossessionDetailPage"));
const ConstructionListPage = lazy(() => import("@/features/construction/ConstructionListPage"));
const ConstructionApplicationPage = lazy(() => import("@/features/construction/ConstructionApplicationPage"));
const ConstructionDetailPage = lazy(() => import("@/features/construction/ConstructionDetailPage"));
const NocsListPage = lazy(() => import("@/features/nocs/NocsListPage"));
const NocApplicationPage = lazy(() => import("@/features/nocs/NocApplicationPage"));
const NocDetailPage = lazy(() => import("@/features/nocs/NocDetailPage"));
const ComplaintsBoardPage = lazy(() => import("@/features/complaints/ComplaintsBoardPage"));
const ComplaintFormPage = lazy(() => import("@/features/complaints/ComplaintFormPage"));
const ComplaintDetailPage = lazy(() => import("@/features/complaints/ComplaintDetailPage"));

const WorkOrdersListPage = lazy(() => import("@/features/maintenance/WorkOrdersListPage"));
const WorkOrderFormPage = lazy(() => import("@/features/maintenance/WorkOrderFormPage"));
const WorkOrderDetailPage = lazy(() => import("@/features/maintenance/WorkOrderDetailPage"));
const AssetsPage = lazy(() => import("@/features/maintenance/AssetsPage"));

const VendorsPage = lazy(() => import("@/features/procurement/VendorsPage"));

const GuardRosterPage = lazy(() => import("@/features/security/guards/GuardRosterPage"));
const VehicleRegistryPage = lazy(() => import("@/features/security/vehicles/VehicleRegistryPage"));
const GateEntryPage = lazy(() => import("@/features/security/visitors/GateEntryPage"));
const ActiveVisitorsPage = lazy(() => import("@/features/security/visitors/ActiveVisitorsPage"));
const VisitorHistoryPage = lazy(() => import("@/features/security/visitors/VisitorHistoryPage"));
const PassesPage = lazy(() => import("@/features/security/visitors/PassesPage"));

const EmployeesPage = lazy(() => import("@/features/hr/EmployeesPage"));
const AttendancePage = lazy(() => import("@/features/hr/AttendancePage"));
const LeaveRequestsPage = lazy(() => import("@/features/hr/LeaveRequestsPage"));
const PayrollLayout = lazy(() => import("@/features/hr-payroll/PayrollLayout"));
const PayrollPage = lazy(() => import("@/features/hr-payroll/PayrollPage"));
const LoansPage = lazy(() => import("@/features/hr-payroll/LoansPage"));
const PayrollReportsPage = lazy(() => import("@/features/hr-payroll/PayrollReportsPage"));
const HRSetupPage = lazy(() => import("@/features/hr-payroll/HRSetupPage"));

const PlotMergePage = lazy(() => import("@/features/plot-merge/PlotMergePage"));
const BuybackPage = lazy(() => import("@/features/buyback/BuybackPage"));
const RegistryPage = lazy(() => import("@/features/registry/RegistryPage"));
const AppointmentsLayout = lazy(() => import("@/features/appointments/AppointmentsLayout"));
const AppointmentsTodayPage = lazy(() => import("@/features/appointments/TodayPage"));
const AppointmentsLogsPage = lazy(() => import("@/features/appointments/LogsPage"));

function LazyPage({ children }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

function Guarded({ module: requiredModule, action = "view", superAdmin = false, children }) {
  return (
    <ProtectedRoute requiredModule={requiredModule} requiredAction={action} requiredSuperAdmin={superAdmin}>
      <LazyPage>{children}</LazyPage>
    </ProtectedRoute>
  );
}

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
          <Guarded module="dashboards">
            <DashboardPage />
          </Guarded>
        ),
      },
      {
        path: "settings/profile",
        element: (
          <Guarded module="settings">
            <SocietyProfilePage />
          </Guarded>
        ),
      },
      {
        path: "settings/numbering-rules",
        element: (
          <Guarded module="settings">
            <NumberingRulesPage />
          </Guarded>
        ),
      },
      {
        path: "settings/master-data",
        element: (
          <Guarded module="settings">
            <MasterDataPage />
          </Guarded>
        ),
      },
      {
        path: "settings/audit-logs",
        element: (
          <Guarded module="audit">
            <AuditLogPage />
          </Guarded>
        ),
      },
      {
        path: "members",
        element: (
          <Guarded module="members">
            <MembersListPage />
          </Guarded>
        ),
      },
      {
        path: "plots",
        element: (
          <Guarded module="plots">
            <PlotsListPage />
          </Guarded>
        ),
      },
      {
        path: "plots/new",
        element: (
          <Guarded module="plots" action="create">
            <PlotFormPage />
          </Guarded>
        ),
      },
      {
        path: "plots/:id",
        element: (
          <Guarded module="plots">
            <PlotDetailPage />
          </Guarded>
        ),
      },
      {
        path: "plots/:id/edit",
        element: (
          <Guarded module="plots" action="edit">
            <PlotFormPage />
          </Guarded>
        ),
      },
      {
        path: "bookings",
        element: (
          <Guarded module="bookings">
            <BookingsListPage />
          </Guarded>
        ),
      },
      {
        path: "bookings/new",
        element: (
          <Guarded module="bookings" action="create">
            <NewBookingPage />
          </Guarded>
        ),
      },
      {
        path: "bookings/:id",
        element: (
          <Guarded module="bookings">
            <BookingDetailPage />
          </Guarded>
        ),
      },
      {
        path: "plot-merge",
        element: (
          <Guarded module="plot-merge">
            <PlotMergePage />
          </Guarded>
        ),
      },
      {
        path: "buyback",
        element: (
          <Guarded module="buyback">
            <BuybackPage />
          </Guarded>
        ),
      },
      {
        path: "registry",
        element: (
          <Guarded module="registry">
            <RegistryPage />
          </Guarded>
        ),
      },
      {
        path: "appointments",
        element: (
          <Guarded module="appointments">
            <AppointmentsLayout />
          </Guarded>
        ),
        children: [
          { index: true, element: <Navigate to="/appointments/today" replace /> },
          {
            path: "today",
            element: (
              <LazyPage>
                <AppointmentsTodayPage />
              </LazyPage>
            ),
          },
          {
            path: "logs",
            element: (
              <LazyPage>
                <AppointmentsLogsPage />
              </LazyPage>
            ),
          },
        ],
      },
      {
        path: "payments",
        element: (
          <Guarded module="payments">
            <PaymentsListPage />
          </Guarded>
        ),
      },
      {
        path: "payments/new",
        element: (
          <Guarded module="payments" action="create">
            <RecordPaymentPage />
          </Guarded>
        ),
      },
      {
        path: "payments/:id",
        element: (
          <Guarded module="payments">
            <PaymentDetailPage />
          </Guarded>
        ),
      },
      {
        path: "members/:id/statement",
        element: (
          <Guarded module="payments">
            <MemberStatementPage />
          </Guarded>
        ),
      },
      {
        path: "refunds",
        element: (
          <Guarded module="refunds">
            <RefundsPage />
          </Guarded>
        ),
      },
      {
        path: "reports",
        element: (
          <Guarded module="reports">
            <ReportsPage />
          </Guarded>
        ),
      },
      {
        path: "invoices",
        element: (
          <Guarded module="invoices">
            <InvoicesListPage />
          </Guarded>
        ),
      },
      {
        path: "invoicing",
        element: (
          <Guarded module="invoices">
            <Navigate to="/invoices" replace />
          </Guarded>
        ),
      },
      {
        path: "recovery",
        element: (
          <Guarded module="recovery">
            <RecoveryPage />
          </Guarded>
        ),
      },
      {
        path: "recovery/admin",
        element: (
          <Guarded module="recovery" action="create">
            <RecoveryAdminPage />
          </Guarded>
        ),
      },
      {
        path: "recovery/portal",
        element: (
          <Guarded module="recovery">
            <RecoveryPortalPage />
          </Guarded>
        ),
      },
      {
        path: "recovery/overdue",
        element: (
          <Guarded module="recovery">
            <OverdueInstallmentsPage />
          </Guarded>
        ),
      },
      {
        path: "recovery/overdue-installments",
        element: (
          <Guarded module="recovery">
            <Navigate to="/recovery/overdue" replace />
          </Guarded>
        ),
      },
      {
        path: "notices",
        element: (
          <Guarded module="notices">
            <NoticeBoardPage />
          </Guarded>
        ),
      },
      {
        path: "notices/new",
        element: (
          <Guarded module="notices" action="create">
            <NoticeFormPage />
          </Guarded>
        ),
      },
      {
        path: "expenses",
        element: (
          <Guarded module="expenses">
            <ExpensesListPage />
          </Guarded>
        ),
      },
      {
        path: "expenses/new",
        element: (
          <Guarded module="expenses" action="create">
            <ExpenseFormPage />
          </Guarded>
        ),
      },
      {
        path: "transfers",
        element: (
          <Guarded module="transfers">
            <TransfersListPage />
          </Guarded>
        ),
      },
      {
        path: "transfers/new",
        element: (
          <Guarded module="transfers" action="create">
            <TransferRequestPage />
          </Guarded>
        ),
      },
      {
        path: "transfers/:id",
        element: (
          <Guarded module="transfers">
            <TransferDetailPage />
          </Guarded>
        ),
      },
      {
        path: "nocs",
        element: (
          <Guarded module="nocs">
            <NocsListPage />
          </Guarded>
        ),
      },
      {
        path: "nocs/new",
        element: (
          <Guarded module="nocs" action="create">
            <NocApplicationPage />
          </Guarded>
        ),
      },
      {
        path: "nocs/:id",
        element: (
          <Guarded module="nocs">
            <NocDetailPage />
          </Guarded>
        ),
      },
      {
        path: "possession",
        element: (
          <Guarded module="possession">
            <PossessionListPage />
          </Guarded>
        ),
      },
      {
        path: "possession/new",
        element: (
          <Guarded module="possession" action="create">
            <PossessionApplicationPage />
          </Guarded>
        ),
      },
      {
        path: "possession/:id",
        element: (
          <Guarded module="possession">
            <PossessionDetailPage />
          </Guarded>
        ),
      },
      {
        path: "construction",
        element: (
          <Guarded module="construction">
            <ConstructionListPage />
          </Guarded>
        ),
      },
      {
        path: "construction/new",
        element: (
          <Guarded module="construction" action="create">
            <ConstructionApplicationPage />
          </Guarded>
        ),
      },
      {
        path: "construction/:id",
        element: (
          <Guarded module="construction">
            <ConstructionDetailPage />
          </Guarded>
        ),
      },
      {
        path: "complaints",
        element: (
          <Guarded module="complaints">
            <ComplaintsBoardPage />
          </Guarded>
        ),
      },
      {
        path: "complaints/new",
        element: (
          <Guarded module="complaints" action="create">
            <ComplaintFormPage />
          </Guarded>
        ),
      },
      {
        path: "complaints/:id",
        element: (
          <Guarded module="complaints">
            <ComplaintDetailPage />
          </Guarded>
        ),
      },
      {
        path: "maintenance",
        element: (
          <Guarded module="maintenance">
            <WorkOrdersListPage />
          </Guarded>
        ),
      },
      {
        path: "maintenance/new",
        element: (
          <Guarded module="maintenance" action="create">
            <WorkOrderFormPage />
          </Guarded>
        ),
      },
      {
        path: "maintenance/:id",
        element: (
          <Guarded module="maintenance">
            <WorkOrderDetailPage />
          </Guarded>
        ),
      },
      {
        path: "assets",
        element: (
          <Guarded module="assets">
            <AssetsPage />
          </Guarded>
        ),
      },
      {
        path: "procurement/vendors",
        element: (
          <Guarded module="procurement">
            <VendorsPage />
          </Guarded>
        ),
      },
      {
        path: "security/guards",
        element: (
          <Guarded module="security-guards">
            <GuardRosterPage />
          </Guarded>
        ),
      },
      {
        path: "security/vehicles",
        element: (
          <Guarded module="security-vehicles">
            <VehicleRegistryPage />
          </Guarded>
        ),
      },
      {
        path: "security/visitors/entry",
        element: (
          <Guarded module="visitors" action="create">
            <GateEntryPage />
          </Guarded>
        ),
      },
      {
        path: "security/visitors/active",
        element: (
          <Guarded module="visitors">
            <ActiveVisitorsPage />
          </Guarded>
        ),
      },
      {
        path: "security/visitors/history",
        element: (
          <Guarded module="visitors">
            <VisitorHistoryPage />
          </Guarded>
        ),
      },
      {
        path: "security/visitors/passes",
        element: (
          <Guarded module="visitors">
            <PassesPage />
          </Guarded>
        ),
      },
      {
        path: "members/new",
        element: (
          <Guarded module="members" action="create">
            <MemberFormPage />
          </Guarded>
        ),
      },
      {
        path: "members/:id",
        element: (
          <Guarded module="members">
            <Member360Page />
          </Guarded>
        ),
      },
      {
        path: "members/:id/edit",
        element: (
          <Guarded module="members" action="edit">
            <MemberFormPage />
          </Guarded>
        ),
      },
      {
        path: "admin/access-control",
        element: (
          <Guarded module="users-roles" action="edit" superAdmin>
            <AccessControlPage />
          </Guarded>
        ),
      },
      {
        path: "admin/users",
        element: (
          <Guarded module="users-roles" action="edit">
            <UsersListPage />
          </Guarded>
        ),
      },
      {
        path: "admin/users/new",
        element: (
          <Guarded module="users-roles" action="edit">
            <UserFormPage />
          </Guarded>
        ),
      },
      {
        path: "admin/users/:id/edit",
        element: (
          <Guarded module="users-roles" action="edit">
            <UserFormPage />
          </Guarded>
        ),
      },
      {
        path: "admin/roles",
        element: (
          <Guarded module="users-roles" action="edit">
            <RolesListPage />
          </Guarded>
        ),
      },
      {
        path: "admin/roles/new",
        element: (
          <Guarded module="users-roles" action="edit" superAdmin>
            <RolePermissionsPage />
          </Guarded>
        ),
      },
      {
        path: "admin/roles/:id/edit",
        element: (
          <Guarded module="users-roles" action="edit" superAdmin>
            <RolePermissionsPage />
          </Guarded>
        ),
      },
      {
        path: "hr/employees",
        element: (
          <Guarded module="hr">
            <EmployeesPage />
          </Guarded>
        ),
      },
      {
        path: "hr/attendance",
        element: (
          <Guarded module="hr">
            <AttendancePage />
          </Guarded>
        ),
      },
      {
        path: "hr/leave-requests",
        element: (
          <Guarded module="hr">
            <LeaveRequestsPage />
          </Guarded>
        ),
      },
      {
        path: "hr/setup",
        element: (
          <Guarded module="hr-payroll">
            <HRSetupPage />
          </Guarded>
        ),
      },
      {
        path: "hr/payroll",
        element: (
          <Guarded module="hr-payroll">
            <PayrollLayout />
          </Guarded>
        ),
        children: [
          {
            index: true,
            element: (
              <LazyPage>
                <PayrollPage />
              </LazyPage>
            ),
          },
          {
            path: "loans",
            element: (
              <LazyPage>
                <LoansPage />
              </LazyPage>
            ),
          },
          {
            path: "setup",
            element: (
              <LazyPage>
                <HRSetupPage />
              </LazyPage>
            ),
          },
          {
            path: "reports",
            element: (
              <LazyPage>
                <PayrollReportsPage />
              </LazyPage>
            ),
          },
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
