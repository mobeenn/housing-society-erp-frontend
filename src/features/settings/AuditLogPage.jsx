import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  X,
  Loader2,
  Eye,
  Calendar,
  User,
  FileText,
  Activity,
} from "lucide-react";
import { administrationApi } from "./administrationApi";

const ACTION_LABELS = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  approve: "Approved",
  reject: "Rejected",
  cancel: "Cancelled",
  statusChange: "Status Changed",
  login: "Login",
  logout: "Logout",
};

const ACTION_COLORS = {
  create: "bg-success-soft text-success",
  update: "bg-gold-soft text-accent",
  delete: "bg-danger-soft text-danger",
  approve: "bg-success-soft text-success",
  reject: "bg-danger-soft text-danger",
  cancel: "bg-warning-soft text-warning",
  statusChange: "bg-gold-soft text-accent",
  login: "bg-surface-muted text-primary",
  logout: "bg-surface-muted text-primary",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDiffModal, setShowDiffModal] = useState(false);

  const { register, watch, reset } = useForm({
    defaultValues: {
      search: "",
      entityType: "",
      action: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 20,
    },
  });

  const filters = watch();

  useEffect(() => {
    loadLogs();
  }, [filters.search, filters.entityType, filters.action, filters.startDate, filters.endDate, filters.page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {
        search: filters.search || undefined,
        entityType: filters.entityType || undefined,
        action: filters.action || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: filters.page,
        limit: filters.limit,
      };
      const data = await administrationApi.getAuditLogs(params);
      setLogs(data.logs || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    reset({
      search: "",
      entityType: "",
      action: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 20,
    });
  };

  const handleViewDiff = (log) => {
    setSelectedLog(log);
    setShowDiffModal(true);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasActiveFilters =
    filters.search || filters.entityType || filters.action || filters.startDate || filters.endDate;

  return (
    <div data-tour="audit-page-intro" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-bold text-primary">Audit Logs</h1>
        <p className="mt-1 text-body text-secondary">
          Track all system changes and user activities with complete audit trail.
        </p>
      </div>

      {/* Filters */}
      <div data-tour="audit-filters" className="rounded-card border border-border bg-surface p-4 shadow-none">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div data-tour="audit-search" className="lg:col-span-2">
            <label className="block text-small font-medium text-primary">Search</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                {...register("search")}
                placeholder="Search by entity ID, user, or IP..."
                className="block w-full rounded-control border border-border-strong py-2 pl-9 pr-3 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Entity Type */}
          <div>
            <label className="block text-small font-medium text-primary">Entity Type</label>
            <select
              {...register("entityType")}
              className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="societySettings">Society Settings</option>
              <option value="numberingRule">Numbering Rule</option>
              <option value="block">Block</option>
              <option value="street">Street</option>
              <option value="plotCategory">Plot Category</option>
              <option value="propertyType">Property Type</option>
              <option value="department">Department</option>
               <option value="PlotMerge">Plot Merge</option>
               <option value="BuyBack">Buyback / Cancel</option>
               <option value="RegistryBatch">Registry Batch</option>
               <option value="Appointment">Appointment</option>
            </select>
          </div>

          {/* Action */}
          <div>
            <label className="block text-small font-medium text-primary">Action</label>
            <select
              {...register("action")}
              className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All Actions</option>
              {Object.keys(ACTION_LABELS).map((key) => (
                <option key={key} value={key}>
                  {ACTION_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div data-tour="audit-date-range" className="lg:col-span-2">
            <label className="block text-small font-medium text-primary">Date Range</label>
            <div className="mt-1 flex gap-2">
              <input
                type="date"
                {...register("startDate")}
                className="block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <input
                type="date"
                {...register("endDate")}
                className="block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <p className="text-small text-secondary">{totalCount} log entries found</p>
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-small font-medium text-secondary hover:text-primary"
            >
              <X className="h-3 w-3" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div data-tour="audit-log-table" className="rounded-card border border-border bg-surface shadow-none">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center text-secondary">
            <Activity className="mb-2 h-12 w-12 text-muted" />
            <p className="text-body">No audit logs found</p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 text-body font-medium text-accent hover:text-accent"
              >
                Clear filters to see all logs
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body">
              <thead className="border-b border-border bg-canvas text-small font-semibold text-secondary">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Entity</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-canvas">
                    <td className="px-6 py-4 text-small text-secondary">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted" />
                        <span className="text-primary">
                          {log.userId?.name || log.userId?.email || "System"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-small font-medium ${
                          ACTION_COLORS[log.action] || "bg-surface-muted text-primary"
                        }`}
                      >
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-primary">
                          {log.entityType || "—"}
                        </span>
                        {log.entityId && (
                          <span className="text-small text-secondary">{log.entityId}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-small text-secondary">
                      {log.ip || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "success" ? (
                        <span className="inline-flex items-center gap-1.5 text-small text-success">
                          <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-small text-danger">
                          <span className="h-1.5 w-1.5 rounded-full bg-danger"></span>
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.changes && (
                        <button
                          onClick={() => handleViewDiff(log)}
                          className="inline-flex items-center gap-1 rounded-control p-1.5 text-secondary hover:bg-surface-muted hover:text-primary"
                          title="View Changes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Diff Modal */}
      {showDiffModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="w-full max-w-3xl rounded-card bg-surface p-6 shadow-overlay">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-h2 font-semibold text-primary">Change Details</h2>
                <p className="mt-1 text-small text-secondary">
                  {ACTION_LABELS[selectedLog.action]} on {formatTimestamp(selectedLog.timestamp)}
                </p>
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                className="rounded-control p-1 text-muted hover:bg-surface-muted hover:text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 rounded-control bg-canvas p-4 text-body">
                <div>
                  <span className="font-medium text-primary">User:</span>
                  <span className="ml-2 text-primary">
                    {selectedLog.userId?.name || selectedLog.userId?.email || "System"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-primary">IP:</span>
                  <span className="ml-2 font-mono text-primary">{selectedLog.ip || "—"}</span>
                </div>
                <div>
                  <span className="font-medium text-primary">Entity:</span>
                  <span className="ml-2 text-primary">{selectedLog.entityType}</span>
                </div>
                <div>
                  <span className="font-medium text-primary">Entity ID:</span>
                  <span className="ml-2 font-mono text-primary">{selectedLog.entityId}</span>
                </div>
              </div>

              {/* Changes Diff */}
              {selectedLog.changes && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedLog.changes.before && (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-body font-semibold text-primary">
                        <span className="rounded-control bg-danger-soft px-2 py-0.5 text-small text-danger">
                          Before
                        </span>
                      </h3>
                      <pre className="max-h-96 overflow-auto rounded-control border border-border bg-canvas p-4 text-small">
                        {JSON.stringify(selectedLog.changes.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.changes.after && (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-body font-semibold text-primary">
                        <span className="rounded-control bg-success-soft px-2 py-0.5 text-small text-success">
                          After
                        </span>
                      </h3>
                      <pre className="max-h-96 overflow-auto rounded-control border border-border bg-canvas p-4 text-small">
                        {JSON.stringify(selectedLog.changes.after, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* User Agent */}
              {selectedLog.userAgent && (
                <div className="rounded-control border border-border bg-canvas p-4">
                  <h3 className="mb-1 text-small font-semibold text-secondary">
                    User Agent
                  </h3>
                  <p className="text-small text-primary">{selectedLog.userAgent}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDiffModal(false)}
                className="rounded-control bg-surface-muted px-4 py-2 text-body font-medium text-primary hover:bg-surface-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
