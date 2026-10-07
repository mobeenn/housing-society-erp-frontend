/**
 * Canonical loading UI for DashboardLayout main content.
 * Variants mirror common page layouts so modules stay visually consistent.
 */
export default function PageSkeleton({
  variant = "page",
  rows = 6,
  cards = 4,
  className = "",
  label = "Loading content",
}) {
  if (variant === "cards") {
    return (
      <div
        className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${className}`}
        role="status"
        aria-label={label}
      >
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="space-y-3 rounded-card border border-slate-100 bg-white p-5">
            <div className="erp-skeleton h-5 w-2/5 rounded-control" />
            <div className="erp-skeleton h-8 w-3/5 rounded-control" />
            <div className="erp-skeleton h-24 w-full rounded-control" />
            <div className="erp-skeleton h-4 w-1/2 rounded-control" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list" || variant === "rows") {
    return (
      <div
        className={`space-y-3 rounded-card border border-slate-100 bg-white p-4 ${className}`}
        role="status"
        aria-label={label}
      >
        <div className="erp-skeleton mb-4 h-6 w-40 rounded-control" />
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="erp-skeleton h-10 w-full rounded-control" />
        ))}
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div
        className={`space-y-5 rounded-card border border-slate-100 bg-white p-6 ${className}`}
        role="status"
        aria-label={label}
      >
        <div className="erp-skeleton h-7 w-48 rounded-control" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <div className="erp-skeleton h-4 w-24 rounded-control" />
              <div className="erp-skeleton h-10 w-full rounded-control" />
            </div>
          ))}
        </div>
        <div className="erp-skeleton h-10 w-32 rounded-control" />
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={`space-y-5 ${className}`} role="status" aria-label={label}>
        <div className="space-y-2">
          <div className="erp-skeleton h-8 w-64 rounded-control" />
          <div className="erp-skeleton h-4 w-40 rounded-control" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="erp-skeleton h-28 rounded-card" />
          ))}
        </div>
        <div className="space-y-3 rounded-card border border-slate-100 bg-white p-5">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="erp-skeleton h-10 w-full rounded-control" />
          ))}
        </div>
      </div>
    );
  }

  // Default full-page shell (route Suspense / access gate)
  return (
    <div className={`space-y-5 ${className}`} role="status" aria-label={label}>
      <div className="space-y-2">
        <div className="erp-skeleton h-8 w-56 rounded-control" />
        <div className="erp-skeleton h-4 w-72 max-w-full rounded-control" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="erp-skeleton h-28 rounded-card" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="erp-skeleton h-72 rounded-card lg:col-span-2" />
        <div className="erp-skeleton h-72 rounded-card" />
      </div>
      <div className="space-y-3 rounded-card border border-slate-100 bg-white p-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="erp-skeleton h-10 w-full rounded-control" />
        ))}
      </div>
    </div>
  );
}
