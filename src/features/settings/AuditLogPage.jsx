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
  create: "bg-success-50 text-success-700",
  update: "bg-primary-50 text-primary-700",
  delete: "bg-danger-50 text-danger-700",
  approve: "bg-success-50 text-success-700",
  reject: "bg-danger-50 text-danger-700",
  cancel: "bg-warning-50 text-warning-700",
  statusChange: "bg-primary-50 text-primary-700",
  login: "bg-neutral-100 text-neutral-700",
  logout: "bg-neutral-100 text-neutral-700",
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
        <h1 className="text-2xl font-bold text-neutral-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Track all system changes and user activities with complete audit trail.
        </p>
      </div>

      {/* Filters */}
      <div data-tour="audit-filters" className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div data-tour="audit-search" className="lg:col-span-2">
            <label className="block text-xs font-medium text-neutral-700">Search</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                {...register("search")}
                placeholder="Search by entity ID, user, or IP..."
                className="block w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Entity Type */}
          <div>
            <label className="block text-xs font-medium text-neutral-700">Entity Type</label>
            <select
              {...register("entityType")}
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
            <label className="block text-xs font-medium text-neutral-700">Action</label>
            <select
              {...register("action")}
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
            <label className="block text-xs font-medium text-neutral-700">Date Range</label>
            <div className="mt-1 flex gap-2">
              <input
                type="date"
                {...register("startDate")}
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <input
                type="date"
                {...register("endDate")}
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
            <p className="text-xs text-neutral-600">{totalCount} log entries found</p>
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              <X className="h-3 w-3" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div data-tour="audit-log-table" className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center text-neutral-500">
            <Activity className="mb-2 h-12 w-12 text-neutral-300" />
            <p className="text-sm">No audit logs found</p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Clear filters to see all logs
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-600">
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
              <tbody className="divide-y divide-neutral-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-xs text-neutral-600">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-neutral-400" />
                        <span className="text-neutral-900">
                          {log.userId?.name || log.userId?.email || "System"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          ACTION_COLORS[log.action] || "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-900">
                          {log.entityType || "—"}
                        </span>
                        {log.entityId && (
                          <span className="text-xs text-neutral-500">{log.entityId}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-600">
                      {log.ip || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "success" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-success-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-success-600"></span>
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-danger-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-danger-600"></span>
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.changes && (
                        <button
                          onClick={() => handleViewDiff(log)}
                          className="inline-flex items-center gap-1 rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Change Details</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {ACTION_LABELS[selectedLog.action]} on {formatTimestamp(selectedLog.timestamp)}
                </p>
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-neutral-50 p-4 text-sm">
                <div>
                  <span className="font-medium text-neutral-700">User:</span>
                  <span className="ml-2 text-neutral-900">
                    {selectedLog.userId?.name || selectedLog.userId?.email || "System"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">IP:</span>
                  <span className="ml-2 font-mono text-neutral-900">{selectedLog.ip || "—"}</span>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Entity:</span>
                  <span className="ml-2 text-neutral-900">{selectedLog.entityType}</span>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Entity ID:</span>
                  <span className="ml-2 font-mono text-neutral-900">{selectedLog.entityId}</span>
                </div>
              </div>

              {/* Changes Diff */}
              {selectedLog.changes && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedLog.changes.before && (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700">
                        <span className="rounded bg-danger-100 px-2 py-0.5 text-xs text-danger-700">
                          Before
                        </span>
                      </h3>
                      <pre className="max-h-96 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs">
                        {JSON.stringify(selectedLog.changes.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.changes.after && (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700">
                        <span className="rounded bg-success-100 px-2 py-0.5 text-xs text-success-700">
                          After
                        </span>
                      </h3>
                      <pre className="max-h-96 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs">
                        {JSON.stringify(selectedLog.changes.after, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* User Agent */}
              {selectedLog.userAgent && (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                  <h3 className="mb-1 text-xs font-semibold uppercase text-neutral-600">
                    User Agent
                  </h3>
                  <p className="text-xs text-neutral-700">{selectedLog.userAgent}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDiffModal(false)}
                className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
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
