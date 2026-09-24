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
      Draft: "bg-gray-100 text-gray-700",
      Approved: "bg-blue-100 text-blue-700 font-semibold",
      Sent: "bg-purple-100 text-purple-700",
      PartiallyReceived: "bg-amber-100 text-amber-700 font-bold",
      Completed: "bg-green-100 text-green-700 font-bold",
      Cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${
          variants[status] || "bg-gray-100 text-gray-700"
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
        <span className="font-mono text-sm font-bold text-blue-600" data-tour="procurement-orders-list">
          {row.poNumber}
        </span>
      ),
    },
    {
      key: "selectedVendor",
      label: "Vendor",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.selectedVendor?.name || "—"}</div>
          <div className="text-xs text-gray-500">{row.selectedVendor?.category}</div>
        </div>
      ),
    },
    {
      key: "items",
      label: "Ordered Items",
      render: (row) => (
        <div className="text-xs text-gray-700">
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
        <span className="font-mono font-bold text-sm text-gray-900">
          {row.totalAmount?.toLocaleString()} {row.currency}
        </span>
      ),
    },
    {
      key: "deliveryDate",
      label: "Target Delivery",
      render: (row) => (
        <span className="text-sm text-gray-600">
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
              className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-semibold flex items-center gap-1"
              title="Receive Goods Note (GRN)"
            >
              <Package className="w-3.5 h-3.5" />
              Receive GRN
            </button>
          )}

          {row.status === "Draft" && (
            <button
              onClick={() => setStatusModal({ isOpen: true, po: row, targetStatus: "Approved", loading: false })}
              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium"
              title="Approve PO"
            >
              Approve
            </button>
          )}

          {row.status === "Approved" && (
            <button
              onClick={() => setStatusModal({ isOpen: true, po: row, targetStatus: "Sent", loading: false })}
              className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-xs font-medium"
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
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit Purchase Order"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => setConfirmDialog({ isOpen: true, po: row, loading: false })}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2" data-tour="procurement-orders-heading">
            <ShoppingCart className="w-7 h-7 text-blue-600" />
            Purchase Orders
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Generate, track, and manage official binding vendor purchase orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-tour="procurement-create-po"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors text-sm"
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              statusFilter === st
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedPO ? "Edit Purchase Order" : "Generate Purchase Order"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4" data-tour="procurement-order-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Selected Vendor *
                  </label>
                  <select
                    required
                    value={formData.selectedVendor}
                    onChange={(e) => setFormData({ ...formData, selectedVendor: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Related Purchase Request
                  </label>
                  <select
                    value={formData.purchaseRequest}
                    onChange={(e) => setFormData({ ...formData, purchaseRequest: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Accepted Quotation Reference
                  </label>
                  <select
                    value={formData.selectedQuotation}
                    onChange={(e) => setFormData({ ...formData, selectedQuotation: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Target Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Net 30, on delivery"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Delivery Terms
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryTerms}
                    onChange={(e) => setFormData({ ...formData, deliveryTerms: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Delivered to Site"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    PO Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.items.map((it, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                      <input
                        type="text"
                        placeholder="Item name / specs"
                        value={it.item}
                        onChange={(e) => handleItemChange(idx, "item", e.target.value)}
                        className="flex-1 text-xs border rounded p-1.5"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className="w-16 text-xs border rounded p-1.5 text-center"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Unit Price"
                        min={0}
                        value={it.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                        className="w-24 text-xs border rounded p-1.5 text-right font-mono"
                        required
                      />
                      <div className="w-24 text-xs font-mono font-bold text-right text-gray-800 pr-1">
                        PKR {it.totalPrice?.toLocaleString()}
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-end">
                  <div className="text-sm font-bold text-gray-900 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                    Grand Total: PKR {Number(formData.totalAmount || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Additional Remarks / Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notes for vendor or store inspection..."
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
                  {submitting ? "Saving..." : selectedPO ? "Update Purchase Order" : "Generate Purchase Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {isDetailOpen && detailPO && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  Purchase Order: {detailPO.poNumber}
                </h2>
                <div className="text-xs text-gray-500 mt-0.5">
                  Status: {getStatusBadge(detailPO.status)}
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border">
                <div>
                  <span className="text-xs text-gray-500 block">Vendor</span>
                  <span className="font-semibold text-gray-900">{detailPO.selectedVendor?.name}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Target Delivery</span>
                  <span className="font-semibold text-gray-900">
                    {detailPO.deliveryDate ? new Date(detailPO.deliveryDate).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Payment Terms</span>
                  <span className="text-gray-900">{detailPO.paymentTerms || "Net 30"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Delivery Terms</span>
                  <span className="text-gray-900">{detailPO.deliveryTerms || "Standard"}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2">
                  Items Ordered
                </h3>
                <table className="w-full text-xs text-left border rounded overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700">
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

              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                <span className="font-semibold text-blue-900">Total Purchase Order Value</span>
                <span className="font-bold font-mono text-base text-blue-900">
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
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5"
                >
                  <Package className="w-4 h-4" /> Receive Goods Note (GRN)
                </button>
              )}
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Confirmation Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Update Purchase Order Status
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Mark Purchase Order <span className="font-bold font-mono">{statusModal.po?.poNumber}</span> as{" "}
              <span className="font-bold text-blue-600">{statusModal.targetStatus}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setStatusModal({ isOpen: false, po: null, targetStatus: "", loading: false })}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusModal.loading}
                onClick={() => handleStatusChange(statusModal.targetStatus)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
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
