import auditTour from "./audit.tour.js";
import bookingsTour from "./bookings.tour.js";
import expensesTour from "./expenses.tour.js";
import invoicesTour from "./invoices.tour.js";
import membersTour from "./members.tour.js";
import paymentsTour from "./payments.tour.js";
import plotsTour from "./plots.tour.js";
import recoveryTour from "./recovery.tour.js";
import settingsTour from "./settings.tour.js";
import usersRolesTour from "./users-roles.tour.js";
import transfersTour from "./transfers.tour.js";
import nocsTour from "./nocs.tour.js";
import possessionTour from "./possession.tour.js";
import constructionTour from "./construction.tour.js";
import plotMergeTour from "./plot-merge.tour.js";
import buybackTour from "./buyback.tour.js";
import registryTour from "./registry.tour.js";
import complaintsTour from "./complaints.tour.js";
import maintenanceTour from "./maintenance.tour.js";
import securityGuardsTour from "./security-guards.tour.js";
import vehiclesTour from "./vehicles.tour.js";
import visitorsTour from "./visitors.tour.js";
import appointmentsTour from "./appointments.tour.js";
import hrTour from "./hr.tour.js";
import hrPayrollTour from "./hr-payroll.tour.js";
import procurementTour from "./procurement.tour.js";
import inventoryTour from "./inventory.tour.js";
import noticesTour from "./notices.tour.js";
import dashboardsTour from "./dashboards.tour.js";
import reportsTour from "./reports.tour.js";
import financeGlTour from "./finance-gl.tour.js";
import bankAccountsTour from "./bank-accounts.tour.js";
import dealersTour from "./dealers.tour.js";
import documentsTour from "./documents.tour.js";

export const TOURS = Object.fromEntries([
  usersRolesTour,
  settingsTour,
  auditTour,
  membersTour,
  plotsTour,
  bookingsTour,
  invoicesTour,
  documentsTour,
  paymentsTour,
  expensesTour,
  financeGlTour,
  bankAccountsTour,
  dealersTour,
  recoveryTour,
  transfersTour,
  nocsTour,
  possessionTour,
  constructionTour,
  plotMergeTour,
  buybackTour,
  registryTour,
  complaintsTour,
  maintenanceTour,
  securityGuardsTour,
  vehiclesTour,
  visitorsTour,
  appointmentsTour,
  hrTour,
  hrPayrollTour,
  procurementTour,
  inventoryTour,
  noticesTour,
  dashboardsTour,
  reportsTour,
].map((tour) => [tour.moduleKey, tour]));

export const TOUR_ROUTE_MAP = {
  "/admin/users": "users-roles",
  "/settings/audit-logs": "audit",
  "/settings/profile": "settings",
  "/members": "members",
  "/plots": "plots",
  "/bookings": "bookings",
  "/invoices": "invoices",
  "/payments": "payments",
  "/expenses": "expenses",
  "/recovery": "recovery",
  "/transfers": "transfers",
  "/nocs": "nocs",
  "/possession": "possession",
  "/construction": "construction",
  "/plot-merge": "plot-merge",
  "/buyback": "buyback",
  "/registry": "registry",
  "/complaints": "complaints",
  "/maintenance": "maintenance",
  "/security/guards": "security-guards",
  "/security/vehicles": "vehicles",
  "/security/visitors/entry": "visitors",
  "/appointments/today": "appointments",
  "/hr/employees": "hr",
  "/hr/payroll": "hr-payroll",
  "/procurement/vendors": "procurement",
  "/notices": "notices",
  "/dashboard": "dashboards",
  "/reports": "reports",
};

// Inventory is currently surfaced from the dashboard's low-stock widget. It
// remains a separate tour in the global menu, but has no standalone route.
export const TOUR_ROUTE_BY_MODULE = {
  ...Object.fromEntries(Object.entries(TOUR_ROUTE_MAP).map(([route, moduleKey]) => [moduleKey, route])),
  inventory: "/dashboard",
  "finance-gl": "/reports",
  "bank-accounts": "/hr/employees",
  dealers: "/invoices",
  documents: "/members",
};

export const getTour = (moduleKey) => TOURS[moduleKey] || null;

// Two checklist modules are contextual views of existing RBAC areas:
// Vehicles is stored as `security-vehicles`, and employee bank details are
// maintained with HR access.
const PERMISSION_MODULE_ALIASES = {
  vehicles: "security-vehicles",
  "bank-accounts": "hr",
};

export const getTourPermissionModule = (moduleKey) => (
  PERMISSION_MODULE_ALIASES[moduleKey] || moduleKey
);

export const getTourModuleForPath = (pathname) => {
  const normalized = String(pathname || "").split("?")[0].replace(/\/+$/, "") || "/";
  if (TOUR_ROUTE_MAP[normalized]) return TOUR_ROUTE_MAP[normalized];
  const match = Object.entries(TOUR_ROUTE_MAP)
    .sort(([a], [b]) => b.length - a.length)
    .find(([route]) => normalized === route || normalized.startsWith(`${route}/`));
  return match?.[1] || null;
};

export const TOUR_KEYS = Object.keys(TOURS);

