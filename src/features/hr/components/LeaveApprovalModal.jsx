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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Review Leave Request
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Approve or reject this leave application
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Details */}
        <div className="p-6 space-y-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Employee:</span>
              <div className="font-medium text-gray-900 mt-0.5">
                {request.employeeRef?.name || "—"}
              </div>
              <div className="text-xs text-gray-500">
                {request.employeeRef?.employeeId} • {request.employeeRef?.department}
              </div>
            </div>

            <div>
              <span className="text-gray-500">Leave Type:</span>
              <div className="font-medium text-gray-900 mt-0.5">{request.type}</div>
            </div>

            <div>
              <span className="text-gray-500">Period:</span>
              <div className="font-medium text-gray-900 mt-0.5">
                {request.fromDate?.slice(0, 10)} to {request.toDate?.slice(0, 10)}
              </div>
              {days && (
                <div className="text-xs text-blue-600 font-medium mt-0.5">
                  {days} day{days !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div>
              <span className="text-gray-500">Available Balance:</span>
              <div className="font-medium text-gray-900 mt-0.5">
                {request.balanceSnapshot?.available !== undefined
                  ? `${request.balanceSnapshot.available} days`
                  : "—"}
              </div>
            </div>
          </div>

          <div>
            <span className="text-sm text-gray-500">Reason:</span>
            <div className="mt-1 text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
              {request.reason}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-tour="hr-leave-review">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Action <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAction("approve")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  action === "approve"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Approve</span>
              </button>

              <button
                type="button"
                onClick={() => setAction("reject")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  action === "reject"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Reject</span>
              </button>
            </div>
          </div>

          {action === "reject" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                rows={3}
                placeholder="Please provide a reason for rejecting this leave request"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {action === "approve" ? "Approve Request" : "Reject Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
