import { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { leaveRequestApi } from "../hrApi";

export default function LeaveApprovalModal({ request, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("approve");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (action === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setLoading(true);

    try {
      const payload =
        action === "approve"
          ? { status: "Approved" }
          : { status: "Rejected", rejectionReason };

      await leaveRequestApi.update(request._id, payload);
      toast.success(
        action === "approve"
          ? "Leave request approved successfully"
          : "Leave request rejected"
      );
      onSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to process leave request"
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!request.fromDate || !request.toDate) return null;
    const from = new Date(request.fromDate);
    const to = new Date(request.toDate);
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : null;
  };

  const days = calculateDays();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-overlay flex items-center justify-center p-4">
      <div className="bg-surface rounded-card shadow-overlay max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-h2 font-bold text-primary">
              Review Leave Request
            </h2>
            <p className="text-small text-secondary mt-0.5">
              Approve or reject this leave application
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-secondary p-1.5 rounded-control hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Details */}
        <div className="p-6 space-y-4 bg-surface-muted border-b border-border">
          <div className="grid grid-cols-2 gap-4 text-body">
            <div>
              <span className="text-secondary">Employee:</span>
              <div className="font-medium text-primary mt-0.5">
                {request.employeeRef?.name || "—"}
              </div>
              <div className="text-small text-secondary">
                {request.employeeRef?.employeeId} • {request.employeeRef?.department}
              </div>
            </div>

            <div>
              <span className="text-secondary">Leave Type:</span>
              <div className="font-medium text-primary mt-0.5">{request.type}</div>
            </div>

            <div>
              <span className="text-secondary">Period:</span>
              <div className="font-medium text-primary mt-0.5">
                {request.fromDate?.slice(0, 10)} to {request.toDate?.slice(0, 10)}
              </div>
              {days && (
                <div className="text-small text-info font-medium mt-0.5">
                  {days} day{days !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div>
              <span className="text-secondary">Available Balance:</span>
              <div className="font-medium text-primary mt-0.5">
                {request.balanceSnapshot?.available !== undefined
                  ? `${request.balanceSnapshot.available} days`
                  : "—"}
              </div>
            </div>
          </div>

          <div>
            <span className="text-body text-secondary">Reason:</span>
            <div className="mt-1 text-body text-primary bg-surface p-3 rounded-control border border-border">
              {request.reason}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-tour="hr-leave-review">
          <div>
            <label className="block text-body font-medium text-primary mb-3">
              Action <span className="text-danger">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAction("approve")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-control border-2 transition-colors duration-base ${
                  action === "approve"
                    ? "border-success bg-success-soft text-success"
                    : "border-border bg-surface text-secondary hover:border-border-strong"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Approve</span>
              </button>

              <button
                type="button"
                onClick={() => setAction("reject")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-control border-2 transition-colors duration-base ${
                  action === "reject"
                    ? "border-danger bg-danger-soft text-danger"
                    : "border-border bg-surface text-secondary hover:border-border-strong"
                }`}
              >
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Reject</span>
              </button>
            </div>
          </div>

          {action === "reject" && (
            <div>
              <label className="block text-body font-medium text-primary mb-1">
                Rejection Reason <span className="text-danger">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                rows={3}
                placeholder="Please provide a reason for rejecting this leave request"
                className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-danger focus:border-transparent text-body"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-body font-medium text-primary hover:bg-surface-muted rounded-control transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-body font-medium text-on-accent rounded-control transition-colors disabled:opacity-50 flex items-center gap-2 ${
                action === "approve"
                  ? "bg-success hover:bg-success"
                  : "bg-danger hover:bg-danger"
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" />
              )}
              {action === "approve" ? "Approve Request" : "Reject Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
