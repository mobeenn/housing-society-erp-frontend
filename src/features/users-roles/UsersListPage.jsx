import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, UserX, RefreshCw, Shield } from "lucide-react";
import { toast } from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { getUsers, toggleUserActive, triggerPasswordReset } from "./usersRolesApi";
import { useCan, useIsSuperAdmin } from "@/hooks/useCan";

export default function UsersListPage() {
  const navigate = useNavigate();
  const canManageRoles = useCan("users-roles", "edit");
  const isSuperAdmin = useIsSuperAdmin();
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    user: null,
    loading: false,
  });

  const handleToggleActive = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await toggleUserActive(confirmDialog.user._id);
      toast.success(
        `User ${confirmDialog.user.isActive ? "deactivated" : "activated"} successfully`
      );
      setConfirmDialog({ isOpen: false, type: null, user: null, loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle user status");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handlePasswordReset = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await triggerPasswordReset(confirmDialog.user._id);
      toast.success("Password reset triggered successfully");
      setConfirmDialog({ isOpen: false, type: null, user: null, loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to trigger password reset");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div>
          <div className="font-medium text-primary">{row.name}</div>
          <div className="text-small text-secondary">{row.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <span className="px-2 py-1 text-small font-medium bg-info-soft text-info rounded-control">
          {row.role?.name || "No Role"}
        </span>
      ),
      sortable: false,
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => <span className="text-secondary">{row.phone || "—"}</span>,
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 text-small font-medium rounded-control ${
            row.isActive
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => (
        <span className="text-secondary">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div data-tour="users-roles-row-actions" className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/users/${row._id}/edit`)}
            className="p-1 text-info hover:bg-info-soft rounded-control"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              setConfirmDialog({ isOpen: true, type: "toggle", user: row, loading: false })
            }
            className={`p-1 rounded-control ${
              row.isActive
                ? "text-danger hover:bg-danger-soft"
                : "text-success hover:bg-success-soft"
            }`}
            title={row.isActive ? "Deactivate" : "Activate"}
          >
            <UserX className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              setConfirmDialog({ isOpen: true, type: "reset", user: row, loading: false })
            }
            className="p-1 text-warning hover:bg-warning-soft rounded-control"
            title="Reset Password"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div data-tour="users-roles-page-intro" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-primary">Users</h1>
          <p className="text-body text-secondary mt-1">Manage system users and their roles</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageRoles && <button
            data-tour="users-roles-roles"
            onClick={() => navigate("/admin/roles")}
            className="flex items-center gap-2 px-4 py-2 border border-info text-info rounded-control hover:bg-info-soft"
          >
            <Shield className="w-5 h-5" />
            Roles
          </button>}
          {isSuperAdmin && <button
            onClick={() => navigate("/admin/access-control")}
            className="flex items-center gap-2 px-4 py-2 border border-gold text-accent rounded-control hover:bg-gold-soft"
          >
            <Shield className="w-5 h-5" />
            Access Control
          </button>}
          <button
            data-tour="users-roles-add-user"
            onClick={() => navigate("/admin/users/new")}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-on-accent rounded-control hover:bg-accent-hover"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        fetchFn={getUsers}
        filters={{ refreshKey }}
        searchPlaceholder="Search by name or email..."
        onRowClick={(row) => navigate(`/admin/users/${row._id}/edit`)}
      />

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === "toggle"}
        onClose={() => setConfirmDialog({ isOpen: false, type: null, user: null, loading: false })}
        onConfirm={handleToggleActive}
        title={`${confirmDialog.user?.isActive ? "Deactivate" : "Activate"} User`}
        message={`Are you sure you want to ${
          confirmDialog.user?.isActive ? "deactivate" : "activate"
        } ${confirmDialog.user?.name}? ${
          confirmDialog.user?.isActive
            ? "They will not be able to log in."
            : "They will be able to log in again."
        }`}
        confirmText={confirmDialog.user?.isActive ? "Deactivate" : "Activate"}
        variant={confirmDialog.user?.isActive ? "danger" : "primary"}
        loading={confirmDialog.loading}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === "reset"}
        onClose={() => setConfirmDialog({ isOpen: false, type: null, user: null, loading: false })}
        onConfirm={handlePasswordReset}
        title="Trigger Password Reset"
        message={`Are you sure you want to trigger a password reset for ${confirmDialog.user?.name}? They will be required to change their password on next login.`}
        confirmText="Trigger Reset"
        variant="primary"
        loading={confirmDialog.loading}
      />
    </div>
  );
}
