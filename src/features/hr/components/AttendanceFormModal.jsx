import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { attendanceApi } from "../hrApi";

export default function AttendanceFormModal({ record, employees, defaultDate, onClose, onSuccess }) {
  const isEdit = !!record;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee: record?.employee || "",
    date: record?.date ? record.date.slice(0, 10) : defaultDate || new Date().toISOString().slice(0, 10),
    status: record?.status || "Present",
    checkIn: record?.checkIn || "",
    checkOut: record?.checkOut || "",
    remarks: record?.remarks || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        checkIn: formData.checkIn || null,
        checkOut: formData.checkOut || null,
        remarks: formData.remarks || null,
      };

      if (isEdit) {
        await attendanceApi.update(record._id, payload);
        toast.success("Attendance updated successfully");
      } else {
        await attendanceApi.create(payload);
        toast.success("Attendance marked successfully");
      }

      onSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-overlay flex items-center justify-center p-4">
      <div className="bg-surface rounded-card shadow-overlay max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-h2 font-bold text-primary">
              {isEdit ? "Edit Attendance" : "Mark Attendance"}
            </h2>
            <p className="text-small text-secondary mt-0.5">
              Record daily attendance for a staff member
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-tour="hr-attendance-form">
          <div>
            <label className="block text-body font-medium text-primary mb-1">
              Employee <span className="text-danger">*</span>
            </label>
            <select
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              required
              disabled={isEdit}
              className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body disabled:bg-surface-muted"
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
              Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={isEdit}
              className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body disabled:bg-surface-muted"
            />
          </div>

          <div>
            <label className="block text-body font-medium text-primary mb-1">
              Status <span className="text-danger">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
              <option value="Holiday">Holiday</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body font-medium text-primary mb-1">
                Check-In Time
              </label>
              <input
                type="time"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body"
              />
            </div>

            <div>
              <label className="block text-body font-medium text-primary mb-1">
                Check-Out Time
              </label>
              <input
                type="time"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body"
              />
            </div>
          </div>

          <div>
            <label className="block text-body font-medium text-primary mb-1">
              Remarks / Notes
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={2}
              placeholder="Optional notes or observations"
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
              {isEdit ? "Update" : "Mark Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
