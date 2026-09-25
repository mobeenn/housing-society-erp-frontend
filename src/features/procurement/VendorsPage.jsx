import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Building2,
  Phone,
  Mail,
  FileText,
  DollarSign,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { vendorApi } from "./procurementApi";

export default function VendorsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailVendor, setDetailVendor] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Confirm delete state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    vendor: null,
    loading: false,
  });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    taxId: "",
    ntn: "",
    paymentTerms: "Net 30",
    status: "Active",
    performanceNotes: "",
    documents: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = () => {
    setSelectedVendor(null);
    setFormData({
      name: "",
      category: "General",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      taxId: "",
      ntn: "",
      paymentTerms: "Net 30",
      status: "Active",
      performanceNotes: "",
      documents: [],
    });
    setIsFormOpen(true);
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name || "",
      category: vendor.category || "General",
      contactPerson: vendor.contactPerson || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      address: vendor.address || "",
      taxId: vendor.taxId || "",
      ntn: vendor.ntn || "",
      paymentTerms: vendor.paymentTerms || "Net 30",
      status: vendor.status || "Active",
      performanceNotes: vendor.performanceNotes || "",
      documents: vendor.documents || [],
    });
    setIsFormOpen(true);
  };

  const handleViewDetail = async (vendor) => {
    setDetailVendor(vendor);
    setIsDetailOpen(true);
    setHistoryLoading(true);
    try {
      const res = await vendorApi.getPurchaseHistory(vendor._id);
      setPurchaseHistory(res.data || res);
    } catch (err) {
      toast.error("Failed to load purchase history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedVendor) {
        await vendorApi.update(selectedVendor._id, formData);
        toast.success("Vendor updated successfully");
      } else {
        await vendorApi.create(formData);
        toast.success("Vendor created successfully");
      }
      setIsFormOpen(false);
      setSelectedVendor(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save vendor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await vendorApi.delete(confirmDialog.vendor._id);
      toast.success("Vendor deleted successfully");
      setConfirmDialog({ isOpen: false, vendor: null, loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete vendor");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Active: "bg-success-soft text-success",
      Inactive: "bg-surface-muted text-primary",
      Blacklisted: "bg-danger-soft text-danger",
      UnderReview: "bg-warning-soft text-warning",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-small font-medium rounded-full ${
          variants[status] || "bg-surface-muted text-primary"
        }`}
      >
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "name",
      label: "Vendor Name",
      render: (row) => (
        <div>
          <button
            onClick={() => handleViewDetail(row)}
            data-tour="procurement-vendors"
            className="font-semibold text-info hover:underline text-left"
          >
            {row.name}
          </button>
          <div className="text-small text-secondary">{row.category}</div>
        </div>
      ),
    },
    {
      key: "contactPerson",
      label: "Contact",
      render: (row) => (
        <div className="text-body">
          <div className="text-primary font-medium">{row.contactPerson || "—"}</div>
          <div className="text-small text-secondary">{row.phone || row.email || "No contact info"}</div>
        </div>
      ),
    },
    {
      key: "paymentTerms",
      label: "Payment Terms",
      render: (row) => <span className="text-secondary text-body">{row.paymentTerms || "Net 30"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "outstandingBalance",
      label: "Balance (PKR)",
      render: (row) => (
        <span
          className={`font-mono text-body font-medium ${
            (row.outstandingBalance || 0) > 0 ? "text-danger" : "text-primary"
          }`}
        >
          {(row.outstandingBalance || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewDetail(row)}
            className="p-1.5 text-secondary hover:bg-surface-muted rounded-control transition-colors"
            title="View Profile & History"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-info hover:bg-info-soft rounded-control transition-colors"
            title="Edit Vendor"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDialog({ isOpen: true, vendor: row, loading: false })}
            className="p-1.5 text-danger hover:bg-danger-soft rounded-control transition-colors"
            title="Delete Vendor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto" data-tour="procurement-page">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h1 font-bold text-primary flex items-center gap-2" data-tour="procurement-heading">
            <Building2 className="w-7 h-7 text-info" />
            Vendor Management
          </h1>
          <p className="text-body text-secondary mt-1">
            Maintain supplier directory, documents, purchase history, and balances
          </p>
        </div>
        <button
          data-tour="procurement-add-vendor"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-medium px-4 py-2 rounded-control shadow-none transition-colors text-body"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-control border border-border shadow-none mb-6 flex flex-wrap gap-4 items-center" data-tour="procurement-filters">
        <div>
          <label className="block text-small font-medium text-secondary mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-body border border-border-strong rounded-control px-3 py-1.5 focus:ring-info focus:border-info"
          >
            <option value="">All Categories</option>
            <option value="Construction">Construction</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="IT & Hardware">IT & Hardware</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Security">Security Equipment</option>
            <option value="General">General</option>
          </select>
        </div>

        <div>
          <label className="block text-small font-medium text-secondary mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-body border border-border-strong rounded-control px-3 py-1.5 focus:ring-info focus:border-info"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="UnderReview">Under Review</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        key={refreshKey}
        columns={columns}
        fetchFn={async (params) => {
          const res = await vendorApi.list({
            ...params,
            category: categoryFilter || undefined,
            status: statusFilter || undefined,
          });
          return res.data || res;
        }}
        filters={{ categoryFilter, statusFilter }}
        searchPlaceholder="Search vendor by name, email, phone, NTN..."
      />

      {/* Vendor Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-overlay flex items-center justify-center p-4">
          <div className="bg-surface rounded-card max-w-2xl w-full p-6 shadow-overlay relative">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-h2 font-bold text-primary">
                {selectedVendor ? "Edit Vendor" : "Add New Vendor"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-muted hover:text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                    placeholder="e.g. Atlas Construction Materials"
                  />
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                    placeholder="e.g. Electrical, Hardware, Construction"
                  />
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                    placeholder="e.g. Tariq Mehmood"
                  />
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                    placeholder="0300-1234567"
                  />
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                    placeholder="vendor@company.com"
                  />
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="UnderReview">Under Review</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    NTN / Tax ID
                  </label>
                  <input
                    type="text"
                    value={formData.ntn}
                    onChange={(e) => setFormData({ ...formData, ntn: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                    placeholder="1234567-8"
                  />
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                    placeholder="e.g. Net 30, Advance 50%, Cash on Delivery"
                  />
                </div>
              </div>

              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  placeholder="Physical office / warehouse address"
                />
              </div>

              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Performance & Quality Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.performanceNotes}
                  onChange={(e) => setFormData({ ...formData, performanceNotes: e.target.value })}
                  className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  placeholder="Reliability ratings, delivery speed notes, warranties compliance..."
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
                  {submitting ? "Saving..." : selectedVendor ? "Update Vendor" : "Save Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Profile & History Drawer / Modal */}
      {isDetailOpen && detailVendor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-overlay flex items-center justify-center p-4">
          <div className="bg-surface rounded-card max-w-3xl w-full p-6 shadow-overlay relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h2 className="text-h2 font-bold text-primary flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-info" />
                  {detailVendor.name}
                </h2>
                <span className="text-small text-secondary">Category: {detailVendor.category}</span>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-muted hover:text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface-muted p-4 rounded-control mb-6 border">
              <div>
                <div className="text-small text-secondary">Status</div>
                <div className="mt-1">{getStatusBadge(detailVendor.status)}</div>
              </div>
              <div>
                <div className="text-small text-secondary">Outstanding Balance</div>
                <div className="text-body font-bold text-danger mt-1">
                  PKR {(detailVendor.outstandingBalance || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-small text-secondary">Payment Terms</div>
                <div className="text-body font-medium text-primary mt-1">
                  {detailVendor.paymentTerms || "Net 30"}
                </div>
              </div>
              <div>
                <div className="text-small text-secondary">NTN / Tax ID</div>
                <div className="text-body font-medium text-primary mt-1">
                  {detailVendor.ntn || detailVendor.taxId || "—"}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-body font-semibold text-primary mb-2">
                Contact Details
              </h3>
              <div className="bg-surface border rounded-control p-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-body">
                <div>
                  <span className="text-small text-secondary block">Contact Person:</span>
                  <span className="font-medium text-primary">{detailVendor.contactPerson || "—"}</span>
                </div>
                <div>
                  <span className="text-small text-secondary block">Phone:</span>
                  <span className="font-medium text-primary">{detailVendor.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-small text-secondary block">Email:</span>
                  <span className="font-medium text-primary">{detailVendor.email || "—"}</span>
                </div>
                <div className="md:col-span-3">
                  <span className="text-small text-secondary block">Address:</span>
                  <span className="font-medium text-primary">{detailVendor.address || "—"}</span>
                </div>
              </div>
            </div>

            {/* Performance Notes */}
            {detailVendor.performanceNotes && (
              <div className="mb-6">
                <h3 className="text-body font-semibold text-primary mb-2 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-warning" />
                  Performance Notes
                </h3>
                <div className="bg-warning-soft border border-warning rounded-control p-3 text-body text-warning">
                  {detailVendor.performanceNotes}
                </div>
              </div>
            )}

            {/* Purchase History */}
            <div>
              <h3 className="text-body font-semibold text-primary mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-info" />
                Purchase Orders History
              </h3>

              {historyLoading ? (
                <div className="text-center py-6 text-secondary text-body">Loading purchase history...</div>
              ) : !purchaseHistory || !purchaseHistory.purchaseOrders || purchaseHistory.purchaseOrders.length === 0 ? (
                <div className="bg-surface-muted border rounded-control p-6 text-center text-body text-secondary">
                  No purchase orders found for this vendor.
                </div>
              ) : (
                <div className="border rounded-control overflow-hidden">
                  <table className="w-full text-body text-left">
                    <thead className="bg-surface-muted border-b text-small text-secondary">
                      <tr>
                        <th className="px-4 py-2">PO #</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2 text-right">Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {purchaseHistory.purchaseOrders.map((po) => (
                        <tr key={po._id} className="hover:bg-surface-muted">
                          <td className="px-4 py-2.5 font-mono text-info font-medium">{po.poNumber}</td>
                          <td className="px-4 py-2.5 text-secondary">
                            {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-small px-2 py-0.5 rounded-full bg-info-soft text-info font-medium">
                              {po.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-medium text-primary">
                            {(po.totalAmount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Vendor"
        message={`Are you sure you want to delete vendor "${confirmDialog.vendor?.name}"? This action cannot be undone.`}
        confirmText="Delete Vendor"
        confirmVariant="danger"
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, vendor: null, loading: false })}
      />
    </div>
  );
}
