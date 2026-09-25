import { useState } from "react";
import { X, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { leaveRequestApi } from "../hrApi";

export default function LeaveRequestModal({ employees, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee: "",
    type: "Annual",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await leaveRequestApi.create(formData);
      toast.success("Leave request submitted successfully");
      onSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit leave request"
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!formData.fromDate || !formData.toDate) return null;
    const from = new Date(formData.fromDate);
    const to = new Date(formData.toDate);
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
              New Leave Request
            </h2>
            <p className="text-small text-secondary mt-0.5">
              Submit a leave application for approval
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-secondary p-1.5 rounded-control hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-tour="hr-leave-form">
          <div>
            <label className="block text-body font-medium text-primary mb-1">
              Employee <span className="text-danger">*</span>
            </label>
            <select
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId}) - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-body font-medium text-primary mb-1">
              Leave Type <span className="text-danger">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body"
            >
              <option value="Annual">Annual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
              <option value="Maternity">Maternity Leave</option>
              <option value="Paternity">Paternity Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body font-medium text-primary mb-1">
                From Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body"
              />
            </div>

            <div>
              <label className="block text-body font-medium text-primary mb-1">
                To Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                required
                min={formData.fromDate}
                className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body"
              />
            </div>
          </div>

          {days && (
            <div className="bg-info-soft border border-info rounded-control p-3">
              <p className="text-body text-info">
                <span className="font-semibold">Duration:</span> {days} day{days !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          <div>
            <label className="block text-body font-medium text-primary mb-1">
              Reason <span className="text-danger">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Please provide a brief reason for your leave request"
              className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body"
            />
          </div>

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
              className="px-4 py-2 text-body font-medium text-on-accent bg-accent hover:bg-accent-hover rounded-control transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" />
              )}
              <Send className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
