import { useState, useEffect } from "react";
import { ClipboardList, Plus, CheckCircle, XCircle, Clock, AlertCircle, Calendar as CalendarIcon, Search, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LeaveRequestModal from "./components/LeaveRequestModal";
import LeaveApprovalModal from "./components/LeaveApprovalModal";
import { leaveRequestApi, employeeApi } from "./hrApi";

export default function LeaveRequestsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    request: null,
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
      console.error("Failed to load employees:", err);
    }
  };

  const loadLeaveBalance = async (empId) => {
    try {
      const res = await employeeApi.getLeaveBalance(empId);
      setLeaveBalance(res.data);
    } catch (err) {
      console.error("Failed to load leave balance:", err);
      setLeaveBalance(null);
    }
  };

  const handleEmployeeSelect = (empId) => {
    setEmployeeFilter(empId);
    const emp = employees.find((e) => e._id === empId);
    setSelectedEmployee(emp);
    if (empId) {
      loadLeaveBalance(empId);
    } else {
      setLeaveBalance(null);
      setSelectedEmployee(null);
    }
  };

  const handleNewRequest = () => {
    setSelectedRequest(null);
    setIsRequestModalOpen(true);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setIsApprovalModalOpen(true);
  };

  const handleSuccess = () => {
    setIsRequestModalOpen(false);
    setIsApprovalModalOpen(false);
    setSelectedRequest(null);
    setRefreshKey((k) => k + 1);
    if (employeeFilter) {
      loadLeaveBalance(employeeFilter);
    }
  };

  const handleDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await leaveRequestApi.delete(confirmDialog.request._id);
      toast.success("Leave request deleted successfully");
      setConfirmDialog({ isOpen: false, request: null, loading: false });
      setRefreshKey((k) => k + 1);
      if (employeeFilter) {
        loadLeaveBalance(employeeFilter);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete leave request");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Pending: "bg-yellow-100 text-yellow-700",
      Approved: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
      Cancelled: "bg-gray-100 text-gray-700",
    };
    const icons = {
      Pending: Clock,
      Approved: CheckCircle,
      Rejected: XCircle,
      Cancelled: AlertCircle,
    };
    const Icon = icons[status] || Clock;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
          variants[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  const columns = [
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
      key: "type",
      label: "Leave Type",
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">{row.type}</span>
      ),
    },
    {
      key: "dates",
      label: "Period",
      render: (row) => (
        <div className="text-sm text-gray-600">
          <div>{row.fromDate ? row.fromDate.slice(0, 10) : "—"}</div>
          <div className="text-xs text-gray-500">
            to {row.toDate ? row.toDate.slice(0, 10) : "—"}
          </div>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (row) => (
        <span className="text-xs text-gray-600 line-clamp-2">{row.reason}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "balanceSnapshot",
      label: "Balance (at request)",
      render: (row) => (
        <span className="text-xs text-gray-600">
          {row.balanceSnapshot?.available !== undefined
            ? `${row.balanceSnapshot.available} days`
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === "Pending" && (
            <button
              onClick={() => handleApprove(row)}
              className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
            >
              Review
            </button>
          )}
          {(row.status === "Pending" || row.status === "Approved") && (
            <button
              onClick={() =>
                setConfirmDialog({ isOpen: true, request: row, loading: false })
              }
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete request"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6" data-tour="hr-leave-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2" data-tour="hr-leave-heading">
              <ClipboardList className="w-7 h-7 text-blue-600" />
              Leave Requests
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage employee leave applications and approvals
            </p>
          </div>
          <button
            data-tour="hr-leave-new"
            onClick={handleNewRequest}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Leave Request
          </button>
        </div>
      </div>

      {/* Leave Balance Card */}
      {selectedEmployee && leaveBalance && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-5 mb-6" data-tour="hr-leave-balance">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Leave Balance - {selectedEmployee.name}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Current year allocation and usage
              </p>
            </div>
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(leaveBalance).map(([type, balance]) => (
              <div
                key={type}
                className="bg-white rounded-lg p-3 border border-gray-200"
              >
                <div className="text-xs font-medium text-gray-500 mb-1">
                  {type}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {balance.available}
                  <span className="text-sm font-normal text-gray-500">
                    /{balance.total}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Used: {balance.used}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6" data-tour="hr-leave-filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Employee Filter
            </label>
            <select
              value={employeeFilter}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
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
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Leave Type Filter
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Types</option>
              <option value="Annual">Annual</option>
              <option value="Sick">Sick</option>
              <option value="Casual">Casual</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Maternity">Maternity</option>
              <option value="Paternity">Paternity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" data-tour="hr-leave-list">
        <Table
          key={refreshKey}
          columns={columns}
          fetchFn={(params) =>
            leaveRequestApi.list({
              ...params,
              employee: employeeFilter || undefined,
              status: statusFilter || undefined,
              type: typeFilter || undefined,
            })
          }
          emptyMessage="No leave requests found"
        />
      </div>

      {/* New Request Modal */}
      {isRequestModalOpen && (
        <LeaveRequestModal
          employees={employees}
          onClose={() => {
            setIsRequestModalOpen(false);
            setSelectedRequest(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {/* Approval Modal */}
      {isApprovalModalOpen && selectedRequest && (
        <LeaveApprovalModal
          request={selectedRequest}
          onClose={() => {
            setIsApprovalModalOpen(false);
            setSelectedRequest(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Leave Request"
        message="Are you sure you want to delete this leave request? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() =>
          setConfirmDialog({ isOpen: false, request: null, loading: false })
        }
        loading={confirmDialog.loading}
      />
    </div>
  );
}
