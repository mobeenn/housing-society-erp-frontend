import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, UserCheck, UserX, UserMinus } from "lucide-react";
import { toast } from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { getMembers, deleteMember } from "./membersApi";

export default function MembersListPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    member: null,
    loading: false,
  });

  const handleDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteMember(confirmDialog.member._id);
      toast.success("Member deleted successfully");
      setConfirmDialog({ isOpen: false, member: null, loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete member");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case "Inactive":
        return <UserMinus className="w-4 h-4 text-gray-600" />;
      case "Blacklisted":
        return <UserX className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const columns = [
    {
      key: "memberId",
      label: "Member ID",
      render: (row) => (
        <span className="font-mono text-sm font-medium text-blue-600">{row.memberId}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          {row.email && <div className="text-xs text-gray-500">{row.email}</div>}
        </div>
      ),
    },
    {
      key: "cnic",
      label: "CNIC",
      render: (row) => <span className="font-mono text-sm text-gray-600">{row.cnic}</span>,
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => <span className="text-gray-600">{row.phone || "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
            row.status === "Active"
              ? "bg-green-100 text-green-700"
              : row.status === "Blacklisted"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {getStatusIcon(row.status)}
          {row.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Registered",
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
        <div data-tour="members-row-actions" className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/members/${row._id}`)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View 360 Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/members/${row._id}/edit`)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDialog({ isOpen: true, member: row, loading: false })}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div data-tour="members-page-intro" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage housing society member records
          </p>
        </div>
        <button
          data-tour="members-add"
          onClick={() => navigate("/members/new")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Status Filter */}
      <div data-tour="members-status-filter" className="flex gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            statusFilter === ""
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("Active")}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            statusFilter === "Active"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter("Inactive")}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            statusFilter === "Inactive"
              ? "bg-gray-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Inactive
        </button>
        <button
          onClick={() => setStatusFilter("Blacklisted")}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            statusFilter === "Blacklisted"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Blacklisted
        </button>
      </div>

      {/* Table */}
      <div data-tour="members-table">
        <Table
          columns={columns}
          fetchFn={getMembers}
          filters={{ refreshKey, status: statusFilter }}
          searchPlaceholder="Search by Member ID, CNIC, name, phone..."
          onRowClick={(row) => navigate(`/members/${row._id}`)}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, member: null, loading: false })}
        onConfirm={handleDelete}
        title="Delete Member"
        message={`Are you sure you want to delete ${confirmDialog.member?.name} (${confirmDialog.member?.memberId})? This will mark them as inactive.`}
        confirmText="Delete Member"
        variant="danger"
        loading={confirmDialog.loading}
      />
    </div>
  );
}
