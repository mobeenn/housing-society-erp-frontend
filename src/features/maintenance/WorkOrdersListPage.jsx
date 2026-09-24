import { useCallback, useEffect, useState } from "react";
import { Boxes, Plus, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import StatusPill from "@/components/ui/StatusPill";
import { getWorkOrders } from "./maintenanceApi";

const STATUSES = ["Open", "InProgress", "Completed", "Cancelled"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const priorityStyles = {
  Low: "bg-neutral-100 text-neutral-600",
  Medium: "bg-warning-100 text-warning-700",
  High: "bg-danger-100 text-danger-700",
  Urgent: "bg-danger-600 text-white",
};

export default function WorkOrdersListPage() {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", priority: "" });

  const load = useCallback(() => {
    const params = { page: 1, limit: 200 };
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    return getWorkOrders(params)
      .then((result) => setWorkOrders(result.data || []))
      .catch((error) =>
        toast.error(
          error.response?.data?.message || "Failed to load work orders",
        ),
      )
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="py-16 text-center text-neutral-500">
        Loading work orders...
      </div>
    );
  }

  return (
    <div className="space-y-6" data-tour="maintenance-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" data-tour="maintenance-heading">Work Orders</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Maintenance jobs for society assets — raised directly or spawned
            from a complaint.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            data-tour="maintenance-assets"
            onClick={() => navigate("/assets")}
            className="flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm"
          >
            <Boxes className="h-4 w-4" /> Assets
          </button>
          <button
            data-tour="maintenance-refresh"
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            data-tour="maintenance-new"
            onClick={() => navigate("/maintenance/new")}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" /> New work order
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3" data-tour="maintenance-filters">
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          Status
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value,
              }))
            }
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          Priority
          <select
            value={filters.priority}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                priority: event.target.value,
              }))
            }
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            {PRIORITIES.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm" data-tour="maintenance-list">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Complaint</th>
              <th className="px-4 py-3">Assigned to</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {workOrders.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-neutral-400"
                >
                  No work orders found.
                </td>
              </tr>
            )}
            {workOrders.map((workOrder) => (
              <tr
                key={workOrder._id}
                className="cursor-pointer hover:bg-primary-50/40"
                onClick={() => navigate(`/maintenance/${workOrder._id}`)}
              >
                <td className="max-w-xs px-4 py-3 font-medium text-neutral-800">
                  <span className="line-clamp-2">{workOrder.description}</span>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {workOrder.assetRef ? (
                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/assets?id=${workOrder.asset}`);
                      }}
                      className="text-primary-600 hover:underline"
                    >
                      {workOrder.assetRef.name}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {workOrder.relatedComplaintRef ? (
                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/complaints/${workOrder.relatedComplaint}`);
                      }}
                      className="text-primary-600 hover:underline"
                    >
                      {workOrder.relatedComplaintRef.complaintNumber ||
                        workOrder.relatedComplaintRef.category}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {workOrder.assignedStaffRef?.name ||
                    workOrder.contractor ||
                    "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityStyles[workOrder.priority] || priorityStyles.Medium}`}
                  >
                    {workOrder.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {workOrder.expectedCompletion
                    ? new Date(
                        workOrder.expectedCompletion,
                      ).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={workOrder.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
