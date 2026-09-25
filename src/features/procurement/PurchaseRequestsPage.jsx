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
      Draft: "bg-surface-muted text-primary",
      PendingApproval: "bg-warning-soft text-warning",
      Approved: "bg-success-soft text-success",
      Rejected: "bg-danger-soft text-danger",
      ConvertedToPO: "bg-info-soft text-info",
      Cancelled: "bg-surface-muted text-primary",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-small font-medium rounded-full ${
          variants[status] || "bg-surface-muted text-primary"
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
      Low: "bg-info-soft text-info",
      Medium: "bg-info-soft text-info border-info",
      High: "bg-warning-soft text-warning border-warning",
      Urgent: "bg-danger-soft text-danger border-danger font-bold",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-small rounded-control border ${
          variants[priority] || "bg-surface-muted text-primary"
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
          className="font-mono text-body font-semibold text-info hover:underline"
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
          <div className="font-medium text-primary truncate">{row.itemDescription}</div>
          <div className="text-small text-secondary">
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
        <span className="font-mono text-body text-primary">
          {row.estimatedCost ? row.estimatedCost.toLocaleString() : "—"}
        </span>
      ),
    },
    {
      key: "requiredDate",
      label: "Required Date",
      render: (row) => (
        <span className="text-body text-secondary">
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
            className="p-1.5 text-secondary hover:bg-surface-muted rounded-control transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Compare Quotations Button */}
          <button
            onClick={() => navigate(`/procurement/quotations?prId=${row._id}`)}
            className="p-1.5 text-info hover:bg-info-soft rounded-control transition-colors"
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
                className="p-1.5 text-success hover:bg-success-soft rounded-control transition-colors"
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
                className="p-1.5 text-danger hover:bg-danger-soft rounded-control transition-colors"
                title="Reject Request"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}

          {row.status === "Approved" && (
            <button
              onClick={() => navigate(`/procurement/purchase-orders?prId=${row._id}`)}
              className="p-1.5 text-info hover:bg-info-soft rounded-control transition-colors"
              title="Generate PO"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-info hover:bg-info-soft rounded-control transition-colors"
            title="Edit PR"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => setConfirmDialog({ isOpen: true, pr: row, loading: false })}
            className="p-1.5 text-danger hover:bg-danger-soft rounded-control transition-colors"
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
          <h1 className="text-h1 font-bold text-primary flex items-center gap-2" data-tour="procurement-requests-heading">
            <Layers className="w-7 h-7 text-info" />
            Purchase Requests
          </h1>
          <p className="text-body text-secondary mt-1">
            Initiate, track, and approve department purchase requisitions
          </p>
        </div>
        <button
          data-tour="procurement-new-request"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-medium px-4 py-2 rounded-control shadow-none transition-colors text-body"
        >
          <Plus className="w-4 h-4" />
          New Requisition
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface p-4 rounded-control border border-border shadow-none mb-6 flex flex-wrap gap-4 items-center" data-tour="procurement-request-filters">
        <div>
          <label className="block text-small font-medium text-secondary mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-body border border-border-strong rounded-control px-3 py-1.5 focus:ring-info focus:border-info"
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
          <label className="block text-small font-medium text-secondary mb-1">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-body border border-border-strong rounded-control px-3 py-1.5 focus:ring-info focus:border-info"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-small font-medium text-secondary mb-1">Department</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-body border border-border-strong rounded-control px-3 py-1.5 focus:ring-info focus:border-info"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-overlay flex items-center justify-center p-4">
          <div className="bg-surface rounded-card max-w-2xl w-full p-6 shadow-overlay relative">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-h2 font-bold text-primary">
                {selectedPR ? "Edit Purchase Request" : "New Purchase Requisition"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-muted hover:text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4" data-tour="procurement-request-form">
              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Item / Service Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.itemDescription}
                  onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                  className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  placeholder="e.g. 50W LED Street Lights for Main Boulevard"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  />
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Estimated Cost (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                    placeholder="e.g. 150000"
                  />
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Required By Date
                  </label>
                  <input
                    type="date"
                    value={formData.requiredDate}
                    onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
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
                <label className="block text-small font-medium text-primary mb-1">
                  Business Justification *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  placeholder="Explain why this procurement is needed..."
                />
              </div>

              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Additional Remarks
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  placeholder="Special instructions or specifications..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-border-strong rounded-control text-body font-medium text-primary hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-on-accent rounded-control text-body font-medium disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-overlay flex items-center justify-center p-4">
          <div className="bg-surface rounded-card max-w-2xl w-full p-6 shadow-overlay relative">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h2 className="text-h2 font-bold text-primary flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-info" />
                  {detailPR.requestNumber}
                </h2>
                <span className="text-small text-secondary">
                  Requested by: {detailPR.requestedBy?.name || "Staff Member"} | Dept: {detailPR.department || "General"}
                </span>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-muted hover:text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface-muted p-4 rounded-control mb-4 border">
              <div>
                <div className="text-small text-secondary">Status</div>
                <div className="mt-1">{getStatusBadge(detailPR.status)}</div>
              </div>
              <div>
                <div className="text-small text-secondary">Priority</div>
                <div className="mt-1">{getPriorityBadge(detailPR.priority)}</div>
              </div>
              <div>
                <div className="text-small text-secondary">Quantity</div>
                <div className="text-body font-bold text-primary mt-1">{detailPR.quantity}</div>
              </div>
              <div>
                <div className="text-small text-secondary">Est. Cost</div>
                <div className="text-body font-bold text-primary mt-1">
                  PKR {detailPR.estimatedCost ? detailPR.estimatedCost.toLocaleString() : "—"}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-body">
              <div>
                <span className="text-small text-secondary block">Item Description:</span>
                <p className="font-medium text-primary bg-surface-muted p-2.5 rounded-control border">
                  {detailPR.itemDescription}
                </p>
              </div>

              <div>
                <span className="text-small text-secondary block">Justification:</span>
                <p className="text-primary bg-surface-muted p-2.5 rounded-control border">
                  {detailPR.justification}
                </p>
              </div>

              {detailPR.rejectionReason && (
                <div className="bg-danger-soft border border-danger p-3 rounded-control text-danger">
                  <span className="font-semibold block text-small">Rejection Reason:</span>
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-info-soft text-info hover:bg-info-soft rounded-control text-body font-medium"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Compare Vendor Quotations
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-surface-muted hover:bg-surface-muted text-primary rounded-control text-body font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve / Reject Dialog */}
      {statusDialog.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-overlay flex items-center justify-center p-4">
          <div className="bg-surface rounded-card max-w-md w-full p-6 shadow-overlay relative">
            <h2 className="text-h2 font-bold text-primary mb-2">
              {statusDialog.newStatus === "Approved" ? "Approve Purchase Request" : "Reject Purchase Request"}
            </h2>
            <p className="text-body text-secondary mb-4">
              Are you sure you want to mark PR <span className="font-mono font-semibold">{statusDialog.pr?.requestNumber}</span> as {statusDialog.newStatus}?
            </p>

            {statusDialog.newStatus === "Rejected" && (
              <div className="mb-4">
                <label className="block text-small font-medium text-primary mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  required
                  value={statusDialog.rejectionReason}
                  onChange={(e) => setStatusDialog({ ...statusDialog, rejectionReason: e.target.value })}
                  className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-danger focus:border-danger"
                  placeholder="Provide feedback on why this request is rejected..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setStatusDialog({ isOpen: false, pr: null, newStatus: "", rejectionReason: "", loading: false })}
                className="px-4 py-2 border border-border-strong rounded-control text-body font-medium text-primary hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusDialog.loading || (statusDialog.newStatus === "Rejected" && !statusDialog.rejectionReason)}
                onClick={handleStatusUpdate}
                className={`px-4 py-2 rounded-control text-body font-medium text-on-accent disabled:opacity-50 ${
                  statusDialog.newStatus === "Approved"
                    ? "bg-success hover:bg-success"
                    : "bg-danger hover:bg-danger"
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
