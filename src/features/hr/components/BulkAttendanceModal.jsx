import { useState } from "react";
import { X, CheckSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { attendanceApi } from "../hrApi";

export default function BulkAttendanceModal({ employees, defaultDate, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [defaultStatus, setDefaultStatus] = useState("Present");
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("17:00");
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());

  const toggleEmployee = (empId) => {
    setSelectedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(empId)) {
        newSet.delete(empId);
      } else {
        newSet.add(empId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map((e) => e._id)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedEmployees.size === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    setLoading(true);

    try {
      const records = Array.from(selectedEmployees).map((empId) => ({
        employee: empId,
        date,
        status: defaultStatus,
        checkIn: checkInTime || null,
        checkOut: checkOutTime || null,
      }));

      await attendanceApi.bulkCreate(records);
      toast.success(`Attendance marked for ${records.length} employees`);
      onSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark bulk attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-overlay flex items-center justify-center p-4">
      <div className="bg-surface rounded-card shadow-overlay max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <h2 className="text-h2 font-bold text-primary flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-info" />
              Bulk Mark Attendance
            </h2>
            <p className="text-small text-secondary mt-0.5">
              Select multiple employees and apply the same attendance status
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6" data-tour="hr-bulk-attendance-form">
          {/* Date & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body font-medium text-primary mb-1">
                Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body"
              />
            </div>

            <div>
              <label className="block text-body font-medium text-primary mb-1">
                Status <span className="text-danger">*</span>
              </label>
              <select
                value={defaultStatus}
                onChange={(e) => setDefaultStatus(e.target.value)}
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

            <div>
              <label className="block text-body font-medium text-primary mb-1">
                Check-In Time
              </label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body"
              />
            </div>

            <div>
              <label className="block text-body font-medium text-primary mb-1">
                Check-Out Time
              </label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="w-full px-3 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-body"
              />
            </div>
          </div>

          {/* Employee Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-body font-medium text-primary">
                Select Employees <span className="text-danger">*</span>
              </label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-small text-info hover:text-info font-medium"
              >
                {selectedEmployees.size === employees.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="border border-border-strong rounded-control max-h-60 overflow-y-auto">
              {employees.length === 0 ? (
                <div className="p-4 text-center text-body text-secondary">
                  No active employees found
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {employees.map((emp) => (
                    <label
                      key={emp._id}
                      className="flex items-center gap-3 p-3 hover:bg-surface-muted cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(emp._id)}
                        onChange={() => toggleEmployee(emp._id)}
                        className="w-4 h-4 text-info border-border-strong rounded-control focus:ring-info"
                      />
                      <div className="flex-1">
                        <div className="text-body font-medium text-primary">{emp.name}</div>
                        <div className="text-small text-secondary">
                          {emp.employeeId} • {emp.department} • {emp.designation}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <p className="text-small text-secondary mt-2">
              {selectedEmployees.size} employee(s) selected
            </p>
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
              disabled={loading || selectedEmployees.size === 0}
              className="px-4 py-2 text-body font-medium text-on-accent bg-accent hover:bg-accent-hover rounded-control transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" />
              )}
              Mark {selectedEmployees.size} Record{selectedEmployees.size !== 1 ? "s" : ""}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
