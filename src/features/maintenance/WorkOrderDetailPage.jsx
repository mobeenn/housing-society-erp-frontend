import { useEffect, useState } from "react";
import { ArrowLeft, History, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import StatusPill from "@/components/ui/StatusPill";
import {
  cancelWorkOrder,
  changeWorkOrderStatus,
  completeWorkOrder,
  getWorkOrder,
  logWorkOrderProgress,
} from "./maintenanceApi";

export default function WorkOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  const load = () =>
    getWorkOrder(id)
      .then(setWorkOrder)
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "Failed to load work order",
        );
        navigate("/maintenance");
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [id]);

  const act = async (handler, message) => {
    try {
      const updated = await handler();
      if (updated) setWorkOrder(updated);
      else await load();
      toast.success(message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const submitNote = async (event) => {
    event.preventDefault();
    if (!note.trim()) return;
    await act(() => logWorkOrderProgress(id, note.trim()), "Progress logged");
    setNote("");
  };

  const start = () =>
    act(() => changeWorkOrderStatus(id, "InProgress"), "Work started");

  const complete = () => {
    const completionNote = window.prompt("Completion note (required)");
    if (completionNote?.trim()) {
      act(
        () => completeWorkOrder(id, completionNote.trim()),
        "Work order completed",
      );
    }
  };

  const cancel = () => {
    const reason = window.prompt("Cancel reason (optional)");
    if (reason !== null) {
      act(
        () => cancelWorkOrder(id, reason || undefined),
        "Work order cancelled",
      );
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-neutral-500">
        Loading work order...
      </div>
    );
  }
  if (!workOrder) return null;

  const editable = ["Open", "InProgress"].includes(workOrder.status);

  return (
    <div className="space-y-6" data-tour="maintenance-detail-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/maintenance")}
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">
                Work Order
              </h1>
              <StatusPill status={workOrder.status} />
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              {workOrder.priority} priority ·{" "}
              {workOrder.assignedStaffRef?.name ||
                (workOrder.contractor
                  ? `Contractor: ${workOrder.contractor}`
                  : "Unassigned")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" data-tour="maintenance-detail-actions">
          {workOrder.status === "Open" && (
            <button
              onClick={start}
              className="rounded-lg bg-warning-600 px-4 py-2 text-sm font-medium text-white"
            >
              Start work
            </button>
          )}
          {workOrder.status === "InProgress" && (
            <button
              onClick={complete}
              className="rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white"
            >
              Mark complete
            </button>
          )}
          {editable && (
            <button
              onClick={cancel}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-600"
            >
              Cancel work order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div>
            <h2 className="font-semibold text-neutral-900">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">
              {workOrder.description}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
            <div>
              <dt className="text-neutral-500">Asset</dt>
              <dd className="font-medium">
                {workOrder.assetRef ? (
                  <button
                    onClick={() => navigate(`/assets?id=${workOrder.asset}`)}
                    className="text-primary-600 hover:underline"
                  >
                    {workOrder.assetRef.name}
                  </button>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Source complaint</dt>
              <dd className="font-medium">
                {workOrder.relatedComplaintRef ? (
                  <button
                    onClick={() =>
                      navigate(`/complaints/${workOrder.relatedComplaint}`)
                    }
                    className="text-primary-600 hover:underline"
                  >
                    {workOrder.relatedComplaintRef.complaintNumber ||
                      workOrder.relatedComplaintRef.category}
                  </button>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Expected completion</dt>
              <dd className="font-medium">
                {workOrder.expectedCompletion
                  ? new Date(workOrder.expectedCompletion).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Labor cost</dt>
              <dd className="font-medium">{workOrder.laborCost || 0}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Material cost</dt>
              <dd className="font-medium">{workOrder.materialCost || 0}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Total cost</dt>
              <dd className="font-semibold">{workOrder.totalCost || 0}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Created</dt>
              <dd className="font-medium">
                {new Date(workOrder.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Completed</dt>
              <dd className="font-medium">
                {workOrder.completedAt
                  ? new Date(workOrder.completedAt).toLocaleString()
                  : "—"}
              </dd>
            </div>
          </dl>

          {workOrder.materials?.length > 0 && (
            <div className="border-t border-neutral-200 pt-4">
              <h3 className="mb-2 text-sm font-semibold text-neutral-900">
                Materials
              </h3>
              <ul className="divide-y divide-neutral-100 text-sm">
                {workOrder.materials.map((material, index) => (
                  <li key={index} className="flex justify-between py-1.5">
                    <span className="text-neutral-700">{material.item}</span>
                    <span className="text-neutral-500">
                      × {material.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {workOrder.completionNote && (
            <div className="rounded-lg bg-success-50 p-3 text-sm text-success-800">
              <span className="font-semibold">Completion note: </span>
              {workOrder.completionNote}
            </div>
          )}

          {/* Progress log */}
          <div className="border-t border-neutral-200 pt-4" data-tour="maintenance-progress-log">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-neutral-900">
                <MessageSquare className="h-4 w-4" /> Progress Log
              </h3>
              <span className="text-xs text-neutral-400">
                {workOrder.progressLog?.length || 0} entries
              </span>
            </div>
            <div className="space-y-3">
              {(workOrder.progressLog || []).map((entry, index) => (
                <div key={index} className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">
                    {entry.authorRef?.name || "Staff"} ·{" "}
                    {new Date(entry.date).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-neutral-800">{entry.note}</p>
                </div>
              ))}
              {(workOrder.progressLog || []).length === 0 && (
                <p className="text-sm text-neutral-400">
                  No progress logged yet.
                </p>
              )}
            </div>
            {editable && (
              <form onSubmit={submitNote} className="mt-4 flex gap-2">
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Log a progress note..."
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
                <button data-tour="maintenance-progress-submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">
                  Add
                </button>
              </form>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
              <History className="h-4 w-4" /> Assignment
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-neutral-500">Staff</dt>
                <dd className="font-medium">
                  {workOrder.assignedStaffRef?.name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Contractor</dt>
                <dd className="font-medium">{workOrder.contractor || "—"}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Priority</dt>
                <dd className="font-medium">{workOrder.priority}</dd>
              </div>
            </dl>
          </section>

          {workOrder.asset && (
            <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-neutral-900">
                Asset history
              </h2>
              <p className="mb-3 text-sm text-neutral-500">
                View every work order raised against{" "}
                <span className="font-medium text-neutral-700">
                  {workOrder.assetRef?.name}
                </span>
                .
              </p>
              <button
                onClick={() => navigate(`/assets?id=${workOrder.asset}`)}
                className="w-full rounded-lg bg-secondary-600 px-4 py-2 text-sm font-medium text-white"
              >
                View maintenance history
              </button>
            </section>
          )}

          {!editable && (
            <p className="text-sm text-neutral-500">
              This work order is {workOrder.status.toLowerCase()} and can no
              longer be edited.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
