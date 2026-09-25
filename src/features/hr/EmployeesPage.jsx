import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, Search, UserCheck, UserX, Users as UsersIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmployeeFormModal from "./components/EmployeeFormModal";
import { employeeApi } from "./hrApi";

export default function EmployeesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    employee: null,
    loading: false,
  });

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedEmployee(null);
    setRefreshKey((k) => k + 1);
    toast.success(
      selectedEmployee ? "Employee updated successfully" : "Employee created successfully"
    );
  };

  const handleDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await employeeApi.delete(confirmDialog.employee._id);
      toast.success("Employee deleted successfully");
      setConfirmDialog({ isOpen: false, employee: null, loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete employee");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Active: "bg-success-soft text-success",
      "On Leave": "bg-warning-soft text-warning",
      Resigned: "bg-surface-muted text-primary",
      Terminated: "bg-danger-soft text-danger",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-small font-medium rounded-full ${
          variants[status] || "bg-surface-muted text-primary"
        }`}
      >
        {status === "Active" && <UserCheck className="w-3.5 h-3.5" />}
        {status === "Terminated" && <UserX className="w-3.5 h-3.5" />}
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "employeeId",
      label: "Employee ID",
      render: (row) => (
        <span className="font-mono text-body font-medium text-info">{row.employeeId}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div>
          <div className="font-medium text-primary">{row.name}</div>
          {row.email && <div className="text-small text-secondary">{row.email}</div>}
        </div>
      ),
    },
    {
      key: "cnic",
      label: "CNIC",
      render: (row) => (
        <span className="font-mono text-body text-secondary">{row.cnic || "—"}</span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => <span className="text-secondary">{row.phone || "—"}</span>,
    },
    {
      key: "department",
      label: "Department",
      render: (row) => <span className="text-primary">{row.department}</span>,
    },
    {
      key: "designation",
      label: "Designation",
      render: (row) => <span className="text-secondary">{row.designation}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "linkedUser",
      label: "System Access",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.linkedUser ? (
            <>
              <UserCheck className="w-4 h-4 text-success" />
              <span className="text-small text-success">Linked</span>
            </>
          ) : (
            <>
              <UserX className="w-4 h-4 text-muted" />
              <span className="text-small text-secondary">Not linked</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2" data-tour="hr-employee-actions">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-info hover:bg-info-soft rounded-control transition-colors"
            title="Edit employee"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              setConfirmDialog({ isOpen: true, employee: row, loading: false })
            }
            className="p-1.5 text-danger hover:bg-danger-soft rounded-control transition-colors"
            title="Delete employee"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6" data-tour="hr-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 font-bold text-primary flex items-center gap-2" data-tour="hr-heading">
              <UsersIcon className="w-7 h-7 text-info" />
              Employees
            </h1>
            <p className="text-body text-secondary mt-1">
              Manage staff members and their employment details
            </p>
          </div>
          <button
            data-tour="hr-add-employee"
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-on-accent rounded-control hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-control shadow-none border border-border p-4 mb-6" data-tour="hr-filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name, ID, CNIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-border-strong rounded-control focus:ring-2 focus:ring-info focus:border-transparent"
          >
            <option value="">All Departments</option>
            <option value="Administration">Administration</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Security">Security</option>
            <option value="Accounts">Accounts</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="IT">IT</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-control shadow-none border border-border" data-tour="hr-list">
        <Table
          key={refreshKey}
          columns={columns}
          fetchFn={(params) =>
            employeeApi.list({
              ...params,
              search: searchQuery || undefined,
              status: statusFilter || undefined,
              department: departmentFilter || undefined,
            })
          }
          emptyMessage="No employees found"
        />
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <EmployeeFormModal
          employee={selectedEmployee}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedEmployee(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete ${confirmDialog.employee?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() =>
          setConfirmDialog({ isOpen: false, employee: null, loading: false })
        }
        loading={confirmDialog.loading}
      />
    </div>
  );
}
