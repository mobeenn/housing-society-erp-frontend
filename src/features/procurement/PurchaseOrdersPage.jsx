import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  CheckCircle,
  Clock,
  Truck,
  Send,
  XCircle,
  FileCheck,
  Building2,
  DollarSign,
  Package,
  Eye,
  X,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  purchaseOrderApi,
  purchaseRequestApi,
  vendorApi,
  quotationApi,
} from "./procurementApi";

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  // Options for modal
  const [vendors, setVendors] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailPO, setDetailPO] = useState(null);

  // Status Action Modal
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    po: null,
    targetStatus: "",
    loading: false,
  });

  // Confirm delete
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    po: null,
    loading: false,
  });

  // Form State
  const [formData, setFormData] = useState({
    purchaseRequest: "",
    selectedVendor: "",
    selectedQuotation: "",
    totalAmount: "",
    currency: "PKR",
    paymentTerms: "Net 30",
    deliveryTerms: "Delivered to Site",
    deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    remarks: "",
    items: [{ item: "", quantity: 1, unitPrice: 0, totalPrice: 0, description: "" }],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    vendorApi.list({ limit: 100, status: "Active" }).then((res) => {
      setVendors(res.data?.data || res.data || []);
    });
    purchaseRequestApi.list({ limit: 100 }).then((res) => {
      setPurchaseRequests(res.data?.data || res.data || []);
    });
    quotationApi.list({ limit: 100 }).then((res) => {
      setQuotations(res.data?.data || res.data || []);
    });
  }, []);

  const handleCreate = () => {
    setSelectedPO(null);
    setFormData({
      purchaseRequest: purchaseRequests[0]?._id || "",
      selectedVendor: vendors[0]?._id || "",
      selectedQuotation: "",
      totalAmount: "",
      currency: "PKR",
      paymentTerms: "Net 30",
      deliveryTerms: "Delivered to Site",
      deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      remarks: "",
      items: [{ item: "", quantity: 1, unitPrice: 0, totalPrice: 0, description: "" }],
    });
    setIsFormOpen(true);
  };

  const handleEdit = (po) => {
    setSelectedPO(po);
    setFormData({
      purchaseRequest: po.purchaseRequest?._id || po.purchaseRequest || "",
      selectedVendor: po.selectedVendor?._id || po.selectedVendor || "",
      selectedQuotation: po.selectedQuotation?._id || po.selectedQuotation || "",
      totalAmount: po.totalAmount || "",
      currency: po.currency || "PKR",
      paymentTerms: po.paymentTerms || "",
      deliveryTerms: po.deliveryTerms || "",
      deliveryDate: po.deliveryDate ? new Date(po.deliveryDate).toISOString().split("T")[0] : "",
      remarks: po.remarks || "",
      items: po.items?.length
        ? po.items
        : [{ item: "", quantity: 1, unitPrice: 0, totalPrice: 0, description: "" }],
    });
    setIsFormOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    if (field === "quantity" || field === "unitPrice") {
      const q = Number(updated[index].quantity) || 0;
      const u = Number(updated[index].unitPrice) || 0;
      updated[index].totalPrice = q * u;
    }
    const total = updated.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
    setFormData({ ...formData, items: updated, totalAmount: total });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item: "", quantity: 1, unitPrice: 0, totalPrice: 0, description: "" }],
    });
  };

  const handleRemoveItem = (index) => {
    const updated = formData.items.filter((_, idx) => idx !== index);
    const total = updated.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
    setFormData({ ...formData, items: updated, totalAmount: total });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        totalAmount: Number(formData.totalAmount),
        items: formData.items.map((it) => ({
          ...it,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          totalPrice: Number(it.totalPrice),
        })),
      };
      if (!payload.selectedQuotation) delete payload.selectedQuotation;

      if (selectedPO) {
        await purchaseOrderApi.update(selectedPO._id, payload);
        toast.success("Purchase Order updated successfully");
      } else {
        await purchaseOrderApi.create(payload);
        toast.success("Purchase Order created successfully");
      }
      setIsFormOpen(false);
      setSelectedPO(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save Purchase Order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (targetStatus) => {
    const po = statusModal.po;
    if (!po) return;
    setStatusModal((prev) => ({ ...prev, loading: true }));
    try {
      await purchaseOrderApi.update(po._id, { status: targetStatus });
      toast.success(`Purchase Order marked as ${targetStatus}`);
      setStatusModal({ isOpen: false, po: null, targetStatus: "", loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await purchaseOrderApi.delete(confirmDialog.po._id);
      toast.success("Purchase Order deleted successfully");
      setConfirmDialog({ isOpen: false, po: null, loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete Purchase Order");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Draft: "bg-surface-muted text-primary",
      Approved: "bg-info-soft text-info font-semibold",
      Sent: "bg-info-soft text-info",
      PartiallyReceived: "bg-warning-soft text-warning font-bold",
      Completed: "bg-success-soft text-success font-bold",
      Cancelled: "bg-danger-soft text-danger",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-small font-medium rounded-full ${
          variants[status] || "bg-surface-muted text-primary"
        }`}
      >
        {status === "Completed" && <CheckCircle className="w-3 h-3" />}
        {status === "PartiallyReceived" && <Clock className="w-3 h-3" />}
        {status === "Sent" && <Send className="w-3 h-3" />}
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "poNumber",
      label: "PO Number",
      render: (row) => (
        <span className="font-mono text-body font-bold text-info" data-tour="procurement-orders-list">
          {row.poNumber}
        </span>
      ),
    },
    {
      key: "selectedVendor",
      label: "Vendor",
      render: (row) => (
        <div>
          <div className="font-medium text-primary">{row.selectedVendor?.name || "—"}</div>
          <div className="text-small text-secondary">{row.selectedVendor?.category}</div>
        </div>
      ),
    },
    {
      key: "items",
      label: "Ordered Items",
      render: (row) => (
        <div className="text-small text-primary">
          {row.items?.map((it, idx) => (
            <div key={idx} className="line-clamp-1">
              • {it.item} ({it.quantity} @ PKR {it.unitPrice?.toLocaleString()})
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Total Amount (PKR)",
      render: (row) => (
        <span className="font-mono font-bold text-body text-primary">
          {row.totalAmount?.toLocaleString()} {row.currency}
        </span>
      ),
    },
    {
      key: "deliveryDate",
      label: "Target Delivery",
      render: (row) => (
        <span className="text-body text-secondary">
          {row.deliveryDate ? new Date(row.deliveryDate).toLocaleDateString() : "—"}
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
          {/* Receive Goods via GRN Trigger */}
          {["Approved", "Sent", "PartiallyReceived"].includes(row.status) && (
            <button
              onClick={() => navigate(`/procurement/grns?poId=${row._id}`)}
              className="px-2.5 py-1 bg-success-soft text-success hover:bg-success-soft rounded-control text-small font-semibold flex items-center gap-1"
              title="Receive Goods Note (GRN)"
            >
              <Package className="w-3.5 h-3.5" />
              Receive GRN
            </button>
          )}

          {row.status === "Draft" && (
            <button
              onClick={() => setStatusModal({ isOpen: true, po: row, targetStatus: "Approved", loading: false })}
              className="px-2 py-1 bg-info-soft text-info hover:bg-info-soft rounded-control text-small font-medium"
              title="Approve PO"
            >
              Approve
            </button>
          )}

          {row.status === "Approved" && (
            <button
              onClick={() => setStatusModal({ isOpen: true, po: row, targetStatus: "Sent", loading: false })}
              className="px-2 py-1 bg-info-soft text-info hover:bg-info-soft rounded-control text-small font-medium"
              title="Mark as Sent to Vendor"
            >
              Send
            </button>
          )}

          <button
            onClick={() => {
              setDetailPO(row);
              setIsDetailOpen(true);
            }}
            className="p-1.5 text-secondary hover:bg-surface-muted rounded-control transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-info hover:bg-info-soft rounded-control transition-colors"
            title="Edit Purchase Order"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => setConfirmDialog({ isOpen: true, po: row, loading: false })}
            className="p-1.5 text-danger hover:bg-danger-soft rounded-control transition-colors"
            title="Delete Purchase Order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto" data-tour="procurement-orders-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h1 font-bold text-primary flex items-center gap-2" data-tour="procurement-orders-heading">
            <ShoppingCart className="w-7 h-7 text-info" />
            Purchase Orders
          </h1>
          <p className="text-body text-secondary mt-1">
            Generate, track, and manage official binding vendor purchase orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-tour="procurement-create-po"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-medium px-4 py-2 rounded-control shadow-none transition-colors text-body"
          >
            <Plus className="w-4 h-4" />
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" data-tour="procurement-order-filters">
        {["", "Draft", "Approved", "Sent", "PartiallyReceived", "Completed", "Cancelled"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-control text-small font-medium border transition-colors ${
              statusFilter === st
                ? "bg-accent text-on-accent border-info shadow-none"
                : "bg-surface text-primary border-border hover:bg-surface-muted"
            }`}
          >
            {st || "All Purchase Orders"}
          </button>
        ))}
      </div>

      {/* Table */}
      <Table
        key={refreshKey}
        columns={columns}
        fetchFn={async (params) => {
          const res = await purchaseOrderApi.list({
            ...params,
            status: statusFilter || undefined,
          });
          return res.data || res;
        }}
        filters={{ statusFilter }}
        searchPlaceholder="Search PO number, terms, remarks..."
      />

      {/* Create/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-overlay flex items-center justify-center p-4">
          <div className="bg-surface rounded-card max-w-3xl w-full p-6 shadow-overlay relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-h2 font-bold text-primary">
                {selectedPO ? "Edit Purchase Order" : "Generate Purchase Order"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-muted hover:text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4" data-tour="procurement-order-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Selected Vendor *
                  </label>
                  <select
                    required
                    value={formData.selectedVendor}
                    onChange={(e) => setFormData({ ...formData, selectedVendor: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  >
                    <option value="">-- Choose Vendor --</option>
                    {vendors.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name} ({v.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Related Purchase Request
                  </label>
                  <select
                    value={formData.purchaseRequest}
                    onChange={(e) => setFormData({ ...formData, purchaseRequest: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  >
                    <option value="">-- Select Requisition (Optional) --</option>
                    {purchaseRequests.map((pr) => (
                      <option key={pr._id} value={pr._id}>
                        {pr.requestNumber} — {pr.itemDescription}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Accepted Quotation Reference
                  </label>
                  <select
                    value={formData.selectedQuotation}
                    onChange={(e) => setFormData({ ...formData, selectedQuotation: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  >
                    <option value="">-- Select Quotation (Optional) --</option>
                    {quotations.map((q) => (
                      <option key={q._id} value={q._id}>
                        {q.quotationNumber} — PKR {q.amount?.toLocaleString()} ({q.vendor?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Target Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
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
                    placeholder="e.g. Net 30, on delivery"
                  />
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Delivery Terms
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryTerms}
                    onChange={(e) => setFormData({ ...formData, deliveryTerms: e.target.value })}
                    className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                    placeholder="e.g. Delivered to Site"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-small font-semibold text-primary">
                    PO Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-small text-info font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.items.map((it, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-surface-muted p-2 rounded-control border">
                      <input
                        type="text"
                        placeholder="Item name / specs"
                        value={it.item}
                        onChange={(e) => handleItemChange(idx, "item", e.target.value)}
                        className="flex-1 text-small border rounded-control p-1.5"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className="w-16 text-small border rounded-control p-1.5 text-center"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Unit Price"
                        min={0}
                        value={it.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                        className="w-24 text-small border rounded-control p-1.5 text-right font-mono"
                        required
                      />
                      <div className="w-24 text-small font-mono font-bold text-right text-primary pr-1">
                        PKR {it.totalPrice?.toLocaleString()}
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-danger hover:bg-danger-soft rounded-control"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-end">
                  <div className="text-body font-bold text-primary bg-info-soft px-4 py-2 rounded-control border border-info">
                    Grand Total: PKR {Number(formData.totalAmount || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Additional Remarks / Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full text-body border border-border-strong rounded-control px-3 py-2 focus:ring-info focus:border-info"
                  placeholder="Notes for vendor or store inspection..."
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
                  {submitting ? "Saving..." : selectedPO ? "Update Purchase Order" : "Generate Purchase Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {isDetailOpen && detailPO && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-overlay flex items-center justify-center p-4">
          <div className="bg-surface rounded-card max-w-2xl w-full p-6 shadow-overlay relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h2 className="text-h2 font-bold text-primary flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-info" />
                  Purchase Order: {detailPO.poNumber}
                </h2>
                <div className="text-small text-secondary mt-0.5">
                  Status: {getStatusBadge(detailPO.status)}
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-muted hover:text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-body">
              <div className="grid grid-cols-2 gap-4 bg-surface-muted p-3 rounded-control border">
                <div>
                  <span className="text-small text-secondary block">Vendor</span>
                  <span className="font-semibold text-primary">{detailPO.selectedVendor?.name}</span>
                </div>
                <div>
                  <span className="text-small text-secondary block">Target Delivery</span>
                  <span className="font-semibold text-primary">
                    {detailPO.deliveryDate ? new Date(detailPO.deliveryDate).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-small text-secondary block">Payment Terms</span>
                  <span className="text-primary">{detailPO.paymentTerms || "Net 30"}</span>
                </div>
                <div>
                  <span className="text-small text-secondary block">Delivery Terms</span>
                  <span className="text-primary">{detailPO.deliveryTerms || "Standard"}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-small text-primary mb-2">
                  Items Ordered
                </h3>
                <table className="w-full text-small text-left border rounded-control overflow-hidden">
                  <thead className="bg-surface-muted text-primary">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detailPO.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{it.item}</td>
                        <td className="p-2 text-center">{it.quantity}</td>
                        <td className="p-2 text-right font-mono">
                          PKR {it.unitPrice?.toLocaleString()}
                        </td>
                        <td className="p-2 text-right font-mono font-semibold">
                          PKR {it.totalPrice?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-info-soft p-3 rounded-control border border-info">
                <span className="font-semibold text-info">Total Purchase Order Value</span>
                <span className="font-bold font-mono text-body text-info">
                  PKR {detailPO.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              {["Approved", "Sent", "PartiallyReceived"].includes(detailPO.status) && (
                <button
                  onClick={() => {
                    setIsDetailOpen(false);
                    navigate(`/procurement/grns?poId=${detailPO._id}`);
                  }}
                  className="px-4 py-2 bg-success hover:bg-success text-on-accent rounded-control text-small font-bold flex items-center gap-1.5"
                >
                  <Package className="w-4 h-4" /> Receive Goods Note (GRN)
                </button>
              )}
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 border border-border-strong rounded-control text-small font-medium text-primary hover:bg-surface-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Confirmation Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-overlay flex items-center justify-center p-4">
          <div className="bg-surface rounded-card max-w-md w-full p-6 shadow-overlay relative">
            <h2 className="text-h2 font-bold text-primary mb-2">
              Update Purchase Order Status
            </h2>
            <p className="text-body text-secondary mb-4">
              Mark Purchase Order <span className="font-bold font-mono">{statusModal.po?.poNumber}</span> as{" "}
              <span className="font-bold text-info">{statusModal.targetStatus}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setStatusModal({ isOpen: false, po: null, targetStatus: "", loading: false })}
                className="px-4 py-2 border border-border-strong rounded-control text-body font-medium text-primary hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusModal.loading}
                onClick={() => handleStatusChange(statusModal.targetStatus)}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-on-accent rounded-control text-body font-medium disabled:opacity-50"
              >
                {statusModal.loading ? "Updating..." : `Confirm ${statusModal.targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Purchase Order"
        message={`Are you sure you want to delete purchase order "${confirmDialog.po?.poNumber}"?`}
        confirmText="Delete Purchase Order"
        confirmVariant="danger"
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, po: null, loading: false })}
      />
    </div>
  );
}
