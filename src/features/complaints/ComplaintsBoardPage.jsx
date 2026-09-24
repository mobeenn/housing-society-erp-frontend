import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import StatusPill from "@/components/ui/StatusPill";
import {
  changeComplaintStatus,
  getComplaints,
  reopenComplaint,
  resolveComplaint,
} from "./complaintsApi";

const COLUMNS = [
  { status: "New", label: "New", tone: "border-primary-300" },
  { status: "Assigned", label: "Assigned", tone: "border-secondary-300" },
  { status: "InProgress", label: "In Progress", tone: "border-warning-300" },
  { status: "Resolved", label: "Resolved", tone: "border-success-300" },
];

const priorityStyles = {
  Low: "bg-neutral-100 text-neutral-600",
  Medium: "bg-warning-100 text-warning-700",
  High: "bg-danger-100 text-danger-700",
  Urgent: "bg-danger-600 text-white",
};

const formatSla = (complaint) => {
  if (!complaint.slaDueDate) return null;
  const remaining = new Date(complaint.slaDueDate).getTime() - Date.now();
  if (complaint.isOverdue || remaining < 0) {
    const overdueBy = Math.ceil(Math.abs(remaining) / 3600000);
    return {
      text: `Overdue by ${overdueBy}h`,
      className: "bg-danger-600 text-white",
    };
  }
  const hours = Math.ceil(remaining / 3600000);
  return {
    text: hours >= 48 ? `${Math.ceil(hours / 24)}d left` : `${hours}h left`,
    className: "bg-neutral-100 text-neutral-600",
  };
};

export default function ComplaintsBoardPage() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    () =>
      getComplaints({ page: 1, limit: 200 })
        .then((result) => setComplaints(result.data || []))
        .catch((error) =>
          toast.error(
            error.response?.data?.message || "Failed to load complaints",
          ),
        )
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const act = async (handler, message) => {
    try {
      await handler();
      toast.success(message);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const startWork = (complaint) =>
    act(
      () => changeComplaintStatus(complaint._id, "InProgress"),
      "Work started",
    );

  const resolve = (complaint) => {
    const note = window.prompt("Resolution note (required)");
    if (note?.trim()) {
      act(
        () => resolveComplaint(complaint._id, note.trim()),
        "Complaint resolved",
      );
    }
  };

  const close = (complaint) =>
    act(
      () => changeComplaintStatus(complaint._id, "Closed"),
      "Complaint closed",
    );

  const reopen = (complaint) =>
    act(() => reopenComplaint(complaint._id), "Complaint reopened");

  if (loading) {
    return (
      <div className="py-16 text-center text-neutral-500">
        Loading complaints...
      </div>
    );
  }

  return (
    <div className="space-y-6" data-tour="complaints-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" data-tour="complaints-page-heading">
            Complaints Board
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Kanban view by status — use the card buttons to move complaints
            along.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            data-tour="complaints-refresh"
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            data-tour="complaints-new"
            onClick={() => navigate("/complaints/new")}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" /> File complaint
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" data-tour="complaints-status-board">
        {COLUMNS.map((column) => {
          const items = complaints.filter((c) => c.status === column.status);
          return (
            <div
              key={column.status}
              className={`rounded-xl border-2 ${column.tone} bg-neutral-50 p-3`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-700">
                  {column.label}
                </h2>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-500">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.length === 0 && (
                  <p className="py-6 text-center text-xs text-neutral-400">
                    No complaints
                  </p>
                )}
                {items.map((complaint) => {
                  const sla = formatSla(complaint);
                  return (
                    <div
                      key={complaint._id}
                      className="cursor-pointer rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition hover:border-primary-300"
                      onClick={() => navigate(`/complaints/${complaint._id}`)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-neutral-900">
                          {complaint.complaintNumber || "—"}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[complaint.priority] || priorityStyles.Medium}`}
                        >
                          {complaint.priority}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                        {complaint.description}
                      </p>
                      <p className="mt-2 text-xs text-neutral-400">
                        {complaint.category} ·{" "}
                        {complaint.memberRef?.name || "—"}
                      </p>
                      {sla && (
                        <span
                          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${sla.className}`}
                        >
                          SLA: {sla.text}
                        </span>
                      )}
                      <div
                        className="mt-3 flex flex-wrap gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {complaint.status === "Assigned" && (
                          <button
                            onClick={() => startWork(complaint)}
                            className="rounded-lg bg-warning-600 px-2.5 py-1 text-[11px] font-medium text-white"
                          >
                            Start work
                          </button>
                        )}
                        {complaint.status === "InProgress" && (
                          <button
                            onClick={() => resolve(complaint)}
                            className="rounded-lg bg-success-600 px-2.5 py-1 text-[11px] font-medium text-white"
                          >
                            Resolve
                          </button>
                        )}
                        {complaint.status === "Resolved" && (
                          <>
                            <button
                              onClick={() => reopen(complaint)}
                              className="rounded-lg bg-primary-600 px-2.5 py-1 text-[11px] font-medium text-white"
                            >
                              Reopen
                            </button>
                            <button
                              onClick={() => close(complaint)}
                              className="rounded-lg border border-neutral-300 px-2.5 py-1 text-[11px] text-neutral-600"
                            >
                              Close
                            </button>
                          </>
                        )}
                        <StatusPill status={complaint.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
