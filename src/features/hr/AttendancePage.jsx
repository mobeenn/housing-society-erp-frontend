import { useState, useEffect } from "react";
import { Plus, CheckSquare, Calendar, Search, Clock, CheckCircle2, XCircle, AlertCircle, Trash2, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AttendanceFormModal from "./components/AttendanceFormModal";
import BulkAttendanceModal from "./components/BulkAttendanceModal";
import { attendanceApi, employeeApi } from "./hrApi";

export default function AttendancePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [employees, setEmployees] = useState([]);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    record: null,
    loading: false,
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await employeeApi.list({ limit: 200, status: "Active" });
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to load employees for attendance:", err);
    }
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setIsSingleModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsSingleModalOpen(true);
  };

  const handleSuccess = () => {
    setIsSingleModalOpen(false);
    setIsBulkModalOpen(false);
    setSelectedRecord(null);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await attendanceApi.delete(confirmDialog.record._id);
      toast.success("Attendance record deleted successfully");
      setConfirmDialog({ isOpen: false, record: null, loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete attendance record");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Present: "bg-green-100 text-green-700",
      Absent: "bg-red-100 text-red-700",
      "Half Day": "bg-yellow-100 text-yellow-700",
      Leave: "bg-blue-100 text-blue-700",
      Holiday: "bg-purple-100 text-purple-700",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
          variants[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status === "Present" && <CheckCircle2 className="w-3.5 h-3.5" />}
        {status === "Absent" && <XCircle className="w-3.5 h-3.5" />}
        {status === "Half Day" && <Clock className="w-3.5 h-3.5" />}
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (row) => (
        <span className="font-mono text-sm text-gray-800 font-medium">
          {row.date ? row.date.slice(0, 10) : "—"}
        </span>
      ),
    },
    {
      key: "employee",
      label: "Employee",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.employeeRef?.name || row.employee}
          </div>
          <div className="text-xs text-gray-500">
            {row.employeeRef?.employeeId} • {row.employeeRef?.department}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "checkIn",
      label: "Check-In",
      render: (row) => (
        <span className="text-sm font-mono text-gray-600">
          {row.checkIn || "—"}
        </span>
      ),
    },
    {
      key: "checkOut",
      label: "Check-Out",
      render: (row) => (
        <span className="text-sm font-mono text-gray-600">
          {row.checkOut || "—"}
        </span>
      ),
    },
    {
      key: "remarks",
      label: "Remarks",
      render: (row) => (
        <span className="text-xs text-gray-500">{row.remarks || "—"}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit record"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              setConfirmDialog({ isOpen: true, record: row, loading: false })
            }
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6" data-tour="hr-attendance-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2" data-tour="hr-attendance-heading">
              <Calendar className="w-7 h-7 text-blue-600" />
              Staff Attendance
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Track daily attendance, check-in/out logs, and bulk mark shifts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              data-tour="hr-attendance-bulk"
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <CheckSquare className="w-4 h-4" />
              Bulk Mark
            </button>
            <button
              data-tour="hr-attendance-mark"
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Mark Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6" data-tour="hr-attendance-filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Date Filter
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
              <option value="Holiday">Holiday</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Employee Filter
            </label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" data-tour="hr-attendance-list">
        <Table
          key={refreshKey}
          columns={columns}
          fetchFn={(params) =>
            attendanceApi.list({
              ...params,
              date: selectedDate || undefined,
              status: statusFilter || undefined,
              employee: employeeFilter || undefined,
            })
          }
          emptyMessage="No attendance records found for selected criteria"
        />
      </div>

      {/* Single Attendance Modal */}
      {isSingleModalOpen && (
        <AttendanceFormModal
          record={selectedRecord}
          employees={employees}
          defaultDate={selectedDate}
          onClose={() => {
            setIsSingleModalOpen(false);
            setSelectedRecord(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {/* Bulk Attendance Modal */}
      {isBulkModalOpen && (
        <BulkAttendanceModal
          employees={employees}
          defaultDate={selectedDate}
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Attendance"
        message="Are you sure you want to delete this attendance record?"
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() =>
          setConfirmDialog({ isOpen: false, record: null, loading: false })
        }
        loading={confirmDialog.loading}
      />
    </div>
  );
}
