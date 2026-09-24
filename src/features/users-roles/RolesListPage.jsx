import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Shield, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { getRoles, deleteRole } from "./usersRolesApi";
import { useIsSuperAdmin } from "@/hooks/useCan";

export default function RolesListPage() {
  const navigate = useNavigate();
  const isSuperAdmin = useIsSuperAdmin();
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    role: null,
    loading: false,
  });

  const handleDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteRole(confirmDialog.role._id);
      toast.success("Role deleted successfully");
      setConfirmDialog({ isOpen: false, role: null, loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete role");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const columns = [
    {
      key: "name",
      label: "Role Name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">{row.name}</span>
          {row.isSystem && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
              <Lock className="w-3 h-3" />
              System
            </span>
          )}
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="text-gray-600 line-clamp-1">{row.description || "—"}</span>
      ),
    },
    {
      key: "access",
      label: "Access",
      sortable: false,
      render: () => (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
          Configured in Access Control
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => (
        <span className="text-gray-600">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => isSuperAdmin && navigate(`/admin/roles/${row._id}/edit`)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30"
            disabled={!isSuperAdmin}
            title={isSuperAdmin ? "Configure role access" : "Super Admin access required"}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDialog({ isOpen: true, role: row, loading: false })}
            disabled={row.isSystem}
            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title={row.isSystem ? "System roles cannot be deleted" : "Delete Role"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Access Control</h1>
          <p className="text-sm text-gray-600 mt-1">
            Define system roles and configure module visibility and actions
          </p>
        </div>
        {isSuperAdmin && <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/access-control")}
            className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50"
          >
            <Shield className="w-5 h-5" />
            Access Control
          </button>
          <button
            onClick={() => navigate("/admin/roles/new")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Create Role
          </button>
        </div>}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        fetchFn={getRoles}
        filters={{ refreshKey }}
        searchPlaceholder="Search roles..."
        onRowClick={(row) => isSuperAdmin && navigate(`/admin/roles/${row._id}/edit`)}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, role: null, loading: false })}
        onConfirm={handleDelete}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${confirmDialog.role?.name}"? This action cannot be undone.`}
        confirmText="Delete Role"
        variant="danger"
        loading={confirmDialog.loading}
      />
    </div>
  );
}
