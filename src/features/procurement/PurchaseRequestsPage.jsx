import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  FileCheck,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Send,
  Eye,
  X,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { purchaseRequestApi } from "./procurementApi";

export default function PurchaseRequestsPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailPR, setDetailPR] = useState(null);

  // Status Change Dialog
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    pr: null,
    newStatus: "",
    rejectionReason: "",
    loading: false,
  });

  // Confirm delete
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    pr: null,
    loading: false,
  });

  // Form State
  const [formData, setFormData] = useState({
    itemDescription: "",
    quantity: 1,
    estimatedCost: "",
    justification: "",
    requiredDate: "",
    priority: "Medium",
    department: "Administration",
    remarks: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = () => {
    setSelectedPR(null);
    setFormData({
      itemDescription: "",
      quantity: 1,
      estimatedCost: "",
      justification: "",
      requiredDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      priority: "Medium",
      department: "Administration",
      remarks: "",
    });
    setIsFormOpen(true);
  };

  const handleEdit = (pr) => {
    setSelectedPR(pr);
    setFormData({
      itemDescription: pr.itemDescription || "",
      quantity: pr.quantity || 1,
      estimatedCost: pr.estimatedCost || "",
      justification: pr.justification || "",
      requiredDate: pr.requiredDate ? new Date(pr.requiredDate).toISOString().split("T")[0] : "",
      priority: pr.priority || "Medium",
      department: pr.department || "Administration",
      remarks: pr.remarks || "",
    });
    setIsFormOpen(true);
  };

  const handleViewDetail = (pr) => {
    setDetailPR(pr);
    setIsDetailOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : undefined,
      };

      if (selectedPR) {
        await purchaseRequestApi.update(selectedPR._id, payload);
        toast.success("Purchase Request updated successfully");
      } else {
        await purchaseRequestApi.create(payload);
        toast.success("Purchase Request submitted successfully");
      }
      setIsFormOpen(false);
      setSelectedPR(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save purchase request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    setStatusDialog((prev) => ({ ...prev, loading: true }));
    try {
      await purchaseRequestApi.update(statusDialog.pr._id, {
        status: statusDialog.newStatus,
        rejectionReason: statusDialog.rejectionReason || undefined,
      });
      toast.success(`Purchase Request marked as ${statusDialog.newStatus}`);
      setStatusDialog({ isOpen: false, pr: null, newStatus: "", rejectionReason: "", loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
      setStatusDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await purchaseRequestApi.delete(confirmDialog.pr._id);
      toast.success("Purchase Request deleted successfully");
      setConfirmDialog({ isOpen: false, pr: null, loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete request");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Draft: "bg-gray-100 text-gray-700",
      PendingApproval: "bg-amber-100 text-amber-800",
      Approved: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
      ConvertedToPO: "bg-blue-100 text-blue-700",
      Cancelled: "bg-gray-200 text-gray-700",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${
          variants[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status === "Approved" && <CheckCircle className="w-3 h-3" />}
        {status === "Rejected" && <XCircle className="w-3 h-3" />}
        {status === "PendingApproval" && <Clock className="w-3 h-3" />}
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      Low: "bg-slate-100 text-slate-700",
      Medium: "bg-blue-50 text-blue-700 border-blue-200",
      High: "bg-orange-100 text-orange-800 border-orange-200",
      Urgent: "bg-red-100 text-red-800 border-red-200 font-bold",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs rounded border ${
          variants[priority] || "bg-gray-100 text-gray-700"
        }`}
      >
        {priority}
      </span>
    );
  };

  const columns = [
    {
      key: "requestNumber",
      label: "PR Number",
      render: (row) => (
        <button
          onClick={() => handleViewDetail(row)}
          data-tour="procurement-requests-list"
          className="font-mono text-sm font-semibold text-blue-600 hover:underline"
        >
          {row.requestNumber}
        </button>
      ),
    },
    {
      key: "itemDescription",
      label: "Item / Service",
      render: (row) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{row.itemDescription}</div>
          <div className="text-xs text-gray-500">
            Qty: <span className="font-semibold">{row.quantity}</span> | Dept: {row.department || "General"}
          </div>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (row) => getPriorityBadge(row.priority),
    },
    {
      key: "estimatedCost",
      label: "Est. Cost (PKR)",
      render: (row) => (
        <span className="font-mono text-sm text-gray-800">
          {row.estimatedCost ? row.estimatedCost.toLocaleString() : "—"}
        </span>
      ),
    },
    {
      key: "requiredDate",
      label: "Required Date",
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.requiredDate ? new Date(row.requiredDate).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleViewDetail(row)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Compare Quotations Button */}
          <button
            onClick={() => navigate(`/procurement/quotations?prId=${row._id}`)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="View / Compare Quotations"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          {row.status === "PendingApproval" && (
            <>
              <button
                onClick={() =>
                  setStatusDialog({
                    isOpen: true,
                    pr: row,
                    newStatus: "Approved",
                    rejectionReason: "",
                    loading: false,
                  })
                }
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Approve Request"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setStatusDialog({
                    isOpen: true,
                    pr: row,
                    newStatus: "Rejected",
                    rejectionReason: "",
                    loading: false,
                  })
                }
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Reject Request"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}

          {row.status === "Approved" && (
            <button
              onClick={() => navigate(`/procurement/purchase-orders?prId=${row._id}`)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Generate PO"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit PR"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => setConfirmDialog({ isOpen: true, pr: row, loading: false })}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete PR"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto" data-tour="procurement-requests-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2" data-tour="procurement-requests-heading">
            <Layers className="w-7 h-7 text-blue-600" />
            Purchase Requests
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Initiate, track, and approve department purchase requisitions
          </p>
        </div>
        <button
          data-tour="procurement-new-request"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Requisition
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center" data-tour="procurement-request-filters">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="PendingApproval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="ConvertedToPO">Converted to PO</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            <option value="Administration">Administration</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Security">Security</option>
            <option value="Accounts">Accounts</option>
            <option value="Horticulture">Horticulture</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        key={refreshKey}
        columns={columns}
        fetchFn={async (params) => {
          const res = await purchaseRequestApi.list({
            ...params,
            status: statusFilter || undefined,
            priority: priorityFilter || undefined,
            department: departmentFilter || undefined,
          });
          return res.data || res;
        }}
        filters={{ statusFilter, priorityFilter, departmentFilter }}
        searchPlaceholder="Search by item description, PR number, justification..."
      />

      {/* Create / Edit PR Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedPR ? "Edit Purchase Request" : "New Purchase Requisition"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4" data-tour="procurement-request-form">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Item / Service Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.itemDescription}
                  onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 50W LED Street Lights for Main Boulevard"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Estimated Cost (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 150000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Required By Date
                  </label>
                  <input
                    type="date"
                    value={formData.requiredDate}
                    onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Administration">Administration</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Security">Security</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Horticulture">Horticulture</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Business Justification *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Explain why this procurement is needed..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Additional Remarks
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Special instructions or specifications..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : selectedPR ? "Update Request" : "Submit Requisition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && detailPR && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  {detailPR.requestNumber}
                </h2>
                <span className="text-xs text-gray-500">
                  Requested by: {detailPR.requestedBy?.name || "Staff Member"} | Dept: {detailPR.department || "General"}
                </span>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg mb-4 border">
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1">{getStatusBadge(detailPR.status)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Priority</div>
                <div className="mt-1">{getPriorityBadge(detailPR.priority)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Quantity</div>
                <div className="text-sm font-bold text-gray-900 mt-1">{detailPR.quantity}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Est. Cost</div>
                <div className="text-sm font-bold text-gray-900 mt-1">
                  PKR {detailPR.estimatedCost ? detailPR.estimatedCost.toLocaleString() : "—"}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div>
                <span className="text-xs text-gray-500 block">Item Description:</span>
                <p className="font-medium text-gray-900 bg-gray-50 p-2.5 rounded border">
                  {detailPR.itemDescription}
                </p>
              </div>

              <div>
                <span className="text-xs text-gray-500 block">Justification:</span>
                <p className="text-gray-700 bg-gray-50 p-2.5 rounded border">
                  {detailPR.justification}
                </p>
              </div>

              {detailPR.rejectionReason && (
                <div className="bg-red-50 border border-red-200 p-3 rounded text-red-800">
                  <span className="font-semibold block text-xs uppercase">Rejection Reason:</span>
                  {detailPR.rejectionReason}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  navigate(`/procurement/quotations?prId=${detailPR._id}`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-sm font-medium"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Compare Vendor Quotations
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve / Reject Dialog */}
      {statusDialog.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {statusDialog.newStatus === "Approved" ? "Approve Purchase Request" : "Reject Purchase Request"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to mark PR <span className="font-mono font-semibold">{statusDialog.pr?.requestNumber}</span> as {statusDialog.newStatus}?
            </p>

            {statusDialog.newStatus === "Rejected" && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  required
                  value={statusDialog.rejectionReason}
                  onChange={(e) => setStatusDialog({ ...statusDialog, rejectionReason: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Provide feedback on why this request is rejected..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setStatusDialog({ isOpen: false, pr: null, newStatus: "", rejectionReason: "", loading: false })}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusDialog.loading || (statusDialog.newStatus === "Rejected" && !statusDialog.rejectionReason)}
                onClick={handleStatusUpdate}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 ${
                  statusDialog.newStatus === "Approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {statusDialog.loading ? "Processing..." : `Confirm ${statusDialog.newStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Purchase Request"
        message={`Are you sure you want to delete purchase request "${confirmDialog.pr?.requestNumber}"?`}
        confirmText="Delete PR"
        confirmVariant="danger"
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, pr: null, loading: false })}
      />
    </div>
  );
}
