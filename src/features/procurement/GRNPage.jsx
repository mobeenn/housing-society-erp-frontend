import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck,
  ClipboardCheck,
  Building2,
  Calendar,
  FileText,
  Eye,
  X,
  ShoppingCart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { grnApi, purchaseOrderApi, vendorApi } from "./procurementApi";

export default function GRNPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const poIdParam = searchParams.get("poId") || "";

  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  // Options
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailGRN, setDetailGRN] = useState(null);

  // Confirm delete
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    grn: null,
    loading: false,
  });

  // Form State
  const [formData, setFormData] = useState({
    purchaseOrder: poIdParam || "",
    vendor: "",
    receivedBy: "",
    deliveryChallanNo: "",
    inspectionStatus: "Passed",
    remarks: "",
    items: [],
  });
  const [submitting, setSubmitting] = useState(false);

  // Load POs and Vendors
  useEffect(() => {
    purchaseOrderApi
      .list({ limit: 100, status: "Sent,Approved,PartiallyReceived" })
      .then((res) => {
        const orders = res.data?.data || res.data || [];
        setPurchaseOrders(orders);
      });
    vendorApi.list({ limit: 100, status: "Active" }).then((res) => {
      setVendors(res.data?.data || res.data || []);
    });
  }, []);

  // When PO is selected, populate vendor and items
  useEffect(() => {
    if (formData.purchaseOrder) {
      const selectedPO = purchaseOrders.find((po) => po._id === formData.purchaseOrder);
      if (selectedPO) {
        setFormData((prev) => ({
          ...prev,
          vendor: selectedPO.selectedVendor?._id || selectedPO.selectedVendor || "",
          items: (selectedPO.items || []).map((it) => ({
            item: it.item,
            orderedQty: it.quantity,
            receivedQty: it.quantity,
            rejectedQty: 0,
            qualityCheckNote: "",
          })),
        }));
      }
    }
  }, [formData.purchaseOrder, purchaseOrders]);

  const handleCreate = () => {
    setSelectedGRN(null);
    const targetPO = purchaseOrders.find((po) => po._id === poIdParam) || purchaseOrders[0];
    setFormData({
      purchaseOrder: poIdParam || (targetPO?._id || ""),
      vendor: targetPO?.selectedVendor?._id || targetPO?.selectedVendor || vendors[0]?._id || "",
      receivedBy: "",
      deliveryChallanNo: "",
      inspectionStatus: "Passed",
      remarks: "",
      items: (targetPO?.items || []).map((it) => ({
        item: it.item,
        orderedQty: it.quantity,
        receivedQty: it.quantity,
        rejectedQty: 0,
        qualityCheckNote: "",
      })),
    });
    setIsFormOpen(true);
  };

  const handleEdit = (grn) => {
    setSelectedGRN(grn);
    setFormData({
      purchaseOrder: grn.purchaseOrder?._id || grn.purchaseOrder || "",
      vendor: grn.vendor?._id || grn.vendor || "",
      receivedBy: grn.receivedBy || "",
      deliveryChallanNo: grn.deliveryChallanNo || "",
      inspectionStatus: grn.inspectionStatus || "Passed",
      remarks: grn.remarks || "",
      items: grn.items?.length
        ? grn.items
        : [],
    });
    setIsFormOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData({ ...formData, items: updated });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        items: formData.items.map((it) => ({
          ...it,
          orderedQty: Number(it.orderedQty),
          receivedQty: Number(it.receivedQty),
          rejectedQty: Number(it.rejectedQty),
        })),
      };

      if (selectedGRN) {
        await grnApi.update(selectedGRN._id, payload);
        toast.success("GRN updated successfully");
      } else {
        await grnApi.create(payload);
        toast.success("GRN recorded successfully — Inventory stock updated");
      }
      setIsFormOpen(false);
      setSelectedGRN(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save GRN");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await grnApi.delete(confirmDialog.grn._id);
      toast.success("GRN deleted successfully");
      setConfirmDialog({ isOpen: false, grn: null, loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete GRN");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getInspectionBadge = (status) => {
    const variants = {
      Passed: "bg-green-100 text-green-700 font-semibold",
      PartiallyAccepted: "bg-amber-100 text-amber-700 font-bold",
      Rejected: "bg-red-100 text-red-700",
      Pending: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${
          variants[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status === "Passed" && <CheckCircle className="w-3 h-3" />}
        {status === "PartiallyAccepted" && <AlertTriangle className="w-3 h-3" />}
        {status === "Rejected" && <XCircle className="w-3 h-3" />}
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "grnNumber",
      label: "GRN Number",
      render: (row) => (
        <span className="font-mono text-sm font-bold text-blue-600" data-tour="procurement-grn-list">
          {row.grnNumber}
        </span>
      ),
    },
    {
      key: "purchaseOrder",
      label: "Purchase Order",
      render: (row) => (
        <div>
          <span className="font-mono text-xs text-indigo-600 block font-semibold">
            {row.purchaseOrder?.poNumber}
          </span>
          <span className="text-xs text-gray-500">
            {row.vendor?.name}
          </span>
        </div>
      ),
    },
    {
      key: "date",
      label: "Received Date",
      render: (row) => (
        <span className="text-sm text-gray-700">
          {row.date ? new Date(row.date).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "receivedBy",
      label: "Received By",
      render: (row) => (
        <span className="text-sm text-gray-700">{row.receivedBy || "—"}</span>
      ),
    },
    {
      key: "inspectionStatus",
      label: "Inspection Status",
      render: (row) => getInspectionBadge(row.inspectionStatus),
    },
    {
      key: "items",
      label: "Items Summary",
      render: (row) => (
        <div className="text-xs text-gray-600">
          {row.items?.map((it, idx) => (
            <div key={idx} className="line-clamp-1">
              {it.item}: Rcvd {it.receivedQty}/{it.orderedQty}
              {it.rejectedQty > 0 && <span className="text-red-600"> ({it.rejectedQty} rejected)</span>}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setDetailGRN(row);
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
            title="Edit GRN"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => setConfirmDialog({ isOpen: true, grn: row, loading: false })}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete GRN"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto" data-tour="procurement-grn-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2" data-tour="procurement-grn-heading">
            <Package className="w-7 h-7 text-blue-600" />
            Goods Received Notes (GRN)
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Material receipt, quality inspection & inventory reconciliation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-tour="procurement-record-grn"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Record Goods Receipt
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" data-tour="procurement-grn-filters">
        {["", "Passed", "PartiallyAccepted", "Rejected", "Pending"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              statusFilter === st
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {st || "All GRNs"}
          </button>
        ))}
      </div>

      {/* Table */}
      <Table
        key={refreshKey}
        columns={columns}
        fetchFn={async (params) => {
          const res = await grnApi.list({
            ...params,
            inspectionStatus: statusFilter || undefined,
            purchaseOrder: poIdParam || undefined,
          });
          return res.data || res;
        }}
        filters={{ statusFilter, poIdParam }}
        searchPlaceholder="Search GRN number, challan, remarks..."
      />

      {/* Create/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedGRN ? "Edit Goods Received Note" : "Record Goods Receipt (GRN)"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4" data-tour="procurement-grn-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Purchase Order *
                  </label>
                  <select
                    required
                    value={formData.purchaseOrder}
                    onChange={(e) => setFormData({ ...formData, purchaseOrder: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Purchase Order --</option>
                    {purchaseOrders.map((po) => (
                      <option key={po._id} value={po._id}>
                        {po.poNumber} — {po.selectedVendor?.name} (PKR {po.totalAmount?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <select
                    required
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    disabled
                  >
                    <option value="">-- Vendor --</option>
                    {vendors.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name} ({v.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Received By (Store Keeper) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.receivedBy}
                    onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Name of receiving officer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Delivery Challan / Invoice No.
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryChallanNo}
                    onChange={(e) => setFormData({ ...formData, deliveryChallanNo: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Vendor challan reference"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Overall Inspection Status *
                  </label>
                  <select
                    required
                    value={formData.inspectionStatus}
                    onChange={(e) => setFormData({ ...formData, inspectionStatus: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Passed">Passed (All Items Accepted)</option>
                    <option value="PartiallyAccepted">Partially Accepted (Some Rejected)</option>
                    <option value="Rejected">Rejected (Entire Lot Refused)</option>
                    <option value="Pending">Pending Inspection</option>
                  </select>
                </div>
              </div>

              {/* Items Receiving & Inspection Grid */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-blue-600" />
                  Item-wise Receiving & Quality Inspection
                </h3>

                <div className="bg-gray-50 rounded-lg border overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        <th className="p-2 text-left font-semibold">Item / Description</th>
                        <th className="p-2 text-center font-semibold">Ordered Qty</th>
                        <th className="p-2 text-center font-semibold bg-green-50">Received Qty</th>
                        <th className="p-2 text-center font-semibold bg-red-50">Rejected Qty</th>
                        <th className="p-2 text-left font-semibold">Quality Check Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white">
                      {formData.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium text-gray-900">{it.item}</td>
                          <td className="p-2 text-center font-mono text-gray-700">{it.orderedQty}</td>
                          <td className="p-2 text-center bg-green-50">
                            <input
                              type="number"
                              min={0}
                              max={it.orderedQty}
                              required
                              value={it.receivedQty}
                              onChange={(e) => handleItemChange(idx, "receivedQty", e.target.value)}
                              className="w-20 text-xs border rounded px-2 py-1 text-center font-mono font-bold"
                            />
                          </td>
                          <td className="p-2 text-center bg-red-50">
                            <input
                              type="number"
                              min={0}
                              max={it.receivedQty}
                              value={it.rejectedQty}
                              onChange={(e) => handleItemChange(idx, "rejectedQty", e.target.value)}
                              className="w-20 text-xs border rounded px-2 py-1 text-center font-mono font-bold text-red-700"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={it.qualityCheckNote}
                              onChange={(e) => handleItemChange(idx, "qualityCheckNote", e.target.value)}
                              className="w-full text-xs border rounded px-2 py-1"
                              placeholder="Quality remarks, defect notes..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Note:</strong> Accepted quantities (Received - Rejected) will be automatically added to inventory stock upon saving this GRN. Purchase Order status will update to "PartiallyReceived" or "Completed" based on reconciliation.
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  General Remarks / Observations
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Overall receipt condition, packaging damage, delivery delays..."
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Saving GRN..." : selectedGRN ? "Update GRN" : "Record GRN & Update Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {isDetailOpen && detailGRN && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  GRN: {detailGRN.grnNumber}
                </h2>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                  <span>Status: {getInspectionBadge(detailGRN.inspectionStatus)}</span>
                  <span>•</span>
                  <span>Received: {new Date(detailGRN.date).toLocaleDateString()}</span>
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
                  <span className="text-xs text-gray-500 block">Purchase Order</span>
                  <span className="font-mono font-semibold text-blue-600">
                    {detailGRN.purchaseOrder?.poNumber}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Vendor</span>
                  <span className="font-semibold text-gray-900">{detailGRN.vendor?.name}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Received By</span>
                  <span className="text-gray-900">{detailGRN.receivedBy}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Delivery Challan No.</span>
                  <span className="text-gray-900">{detailGRN.deliveryChallanNo || "—"}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2">
                  Received Items & Quality Check
                </h3>
                <table className="w-full text-xs text-left border rounded overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2 text-center">Ordered</th>
                      <th className="p-2 text-center bg-green-50">Received</th>
                      <th className="p-2 text-center bg-red-50">Rejected</th>
                      <th className="p-2 text-center bg-blue-50">Accepted</th>
                      <th className="p-2">Quality Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detailGRN.items?.map((it, idx) => {
                      const accepted = it.receivedQty - (it.rejectedQty || 0);
                      return (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{it.item}</td>
                          <td className="p-2 text-center font-mono">{it.orderedQty}</td>
                          <td className="p-2 text-center font-mono font-semibold text-green-700 bg-green-50">
                            {it.receivedQty}
                          </td>
                          <td className="p-2 text-center font-mono font-semibold text-red-700 bg-red-50">
                            {it.rejectedQty || 0}
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-blue-700 bg-blue-50">
                            {accepted}
                          </td>
                          <td className="p-2 text-gray-600">{it.qualityCheckNote || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {detailGRN.remarks && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <span className="text-xs font-semibold text-amber-900 block mb-1">
                    General Remarks:
                  </span>
                  <p className="text-xs text-amber-800">{detailGRN.remarks}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Goods Received Note"
        message={`Are you sure you want to delete GRN "${confirmDialog.grn?.grnNumber}"? This action cannot be undone and may affect inventory records.`}
        confirmText="Delete GRN"
        confirmVariant="danger"
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, grn: null, loading: false })}
      />
    </div>
  );
}
