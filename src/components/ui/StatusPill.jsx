const statusStyles = {
  active: "bg-success-100 text-success-700",
  inactive: "bg-neutral-100 text-neutral-600",
  pending: "bg-warning-100 text-warning-700",
  overdue: "bg-danger-100 text-danger-700",
  paid: "bg-success-100 text-success-700",
  unpaid: "bg-danger-100 text-danger-700",
  partial: "bg-warning-100 text-warning-700",
  available: "bg-success-100 text-success-700",
  reserved: "bg-warning-100 text-warning-700",
  booked: "bg-primary-100 text-primary-700",
  allotted: "bg-secondary-100 text-secondary-700",
  sold: "bg-danger-100 text-danger-700",
  transferred: "bg-secondary-100 text-secondary-700",
  cancelled: "bg-danger-100 text-danger-700",
  possessed: "bg-primary-100 text-primary-700",
  "under construction": "bg-warning-100 text-warning-700",
  constructed: "bg-success-100 text-success-700",
  "pending approval": "bg-warning-100 text-warning-700",
  confirmed: "bg-success-100 text-success-700",
  upcoming: "bg-primary-100 text-primary-700",
  due: "bg-warning-100 text-warning-700",
  partiallypaid: "bg-warning-100 text-warning-700",
  open: "bg-primary-100 text-primary-700",
  inprogress: "bg-warning-100 text-warning-700",
  completed: "bg-success-100 text-success-700",
  resolved: "bg-success-100 text-success-700",
  new: "bg-primary-100 text-primary-700",
  assigned: "bg-secondary-100 text-secondary-700",
  closed: "bg-neutral-100 text-neutral-600",
  reopened: "bg-danger-100 text-danger-700",
  merged: "bg-danger-100 text-danger-700",
  boughtback: "bg-secondary-100 text-secondary-700",
};

const statusDots = {
  active: "bg-success-500",
  paid: "bg-success-500",
  available: "bg-success-500",
  constructed: "bg-success-500",
  overdue: "bg-danger-500",
  unpaid: "bg-danger-500",
  sold: "bg-danger-500",
  cancelled: "bg-danger-500",
  pending: "bg-warning-500",
  partial: "bg-warning-500",
  reserved: "bg-warning-500",
  "under construction": "bg-warning-500",
  booked: "bg-primary-500",
  possessed: "bg-primary-500",
  allotted: "bg-secondary-500",
  transferred: "bg-secondary-500",
  "pending approval": "bg-warning-500",
  confirmed: "bg-success-500",
  upcoming: "bg-primary-500",
  due: "bg-warning-500",
  partiallypaid: "bg-warning-500",
  open: "bg-primary-500",
  inprogress: "bg-warning-500",
  completed: "bg-success-500",
  resolved: "bg-success-500",
  new: "bg-primary-500",
  assigned: "bg-secondary-500",
  reopened: "bg-danger-500",
  merged: "bg-danger-500",
  boughtback: "bg-secondary-500",
};

export default function StatusPill({ status, className = "" }) {
  const normalized = status?.toLowerCase();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
        ${statusStyles[normalized] || "bg-neutral-100 text-neutral-700"} ${className}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          statusDots[normalized] || "bg-neutral-400"
        }`}
      />
      {status}
    </span>
  );
}
