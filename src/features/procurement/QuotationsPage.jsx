import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Layers,
  ArrowRight,
  Eye,
  X,
  Award,
  Sparkles,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { quotationApi, purchaseRequestApi, vendorApi, purchaseOrderApi } from "./procurementApi";

export default function QuotationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const prIdParam = searchParams.get("prId") || "";

  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPrFilter, setSelectedPrFilter] = useState(prIdParam);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState("compare"); // "table" | "compare"

  // Dropdown options
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [quotationsForPr, setQuotationsForPr] = useState([]);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailQuotation, setDetailQuotation] = useState(null);

  // Confirm delete
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    quotation: null,
    loading: false,
  });

  // Generate PO Dialog
  const [poDialog, setPoDialog] = useState({
    isOpen: false,
    quotation: null,
    loading: false,
  });

  // Form State
  const [formData, setFormData] = useState({
    purchaseRequest: prIdParam || "",
    vendor: "",
    amount: "",
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    currency: "PKR",
    paymentTerms: "Net 30",
    deliveryTerms: "Delivered to Site",
    warrantyTerms: "1 Year Standard Warranty",
    remarks: "",
    items: [{ item: "", quantity: 1, unitPrice: 0, totalPrice: 0, description: "" }],
  });
  const [submitting, setSubmitting] = useState(false);

  // Load PRs and Vendors for selection
  useEffect(() => {
    purchaseRequestApi.list({ limit: 100 }).then((res) => {
      setPurchaseRequests(res.data?.data || res.data || []);
    });
    vendorApi.list({ limit: 100, status: "Active" }).then((res) => {
      setVendors(res.data?.data || res.data || []);
    });
  }, []);

  // When selected PR filter changes, fetch quotes for side-by-side comparison
  useEffect(() => {
    if (selectedPrFilter) {
      setLoadingCompare(true);
      quotationApi
        .list({ purchaseRequest: selectedPrFilter, limit: 50 })
        .then((res) => {
          setQuotationsForPr(res.data?.data || res.data || []);
        })
        .catch(() => toast.error("Failed to load quotations for comparison"))
        .finally(() => setLoadingCompare(false));
    } else {
      setQuotationsForPr([]);
    }
  }, [selectedPrFilter, refreshKey]);

  const handlePrFilterChange = (prId) => {
    setSelectedPrFilter(prId);
    if (prId) {
      setSearchParams({ prId });
    } else {
      setSearchParams({});
    }
  };

  const handleCreate = () => {
    setSelectedQuotation(null);
    const matchedPr = purchaseRequests.find((p) => p._id === selectedPrFilter);
    setFormData({
      purchaseRequest: selectedPrFilter || (purchaseRequests[0]?._id || ""),
      vendor: vendors[0]?._id || "",
      amount: matchedPr?.estimatedCost || "",
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      currency: "PKR",
      paymentTerms: "Net 30",
      deliveryTerms: "Delivered to Site",
      warrantyTerms: "1 Year Standard Warranty",
      remarks: "",
      items: [
        {
          item: matchedPr?.itemDescription || "",
          quantity: matchedPr?.quantity || 1,
          unitPrice: matchedPr?.estimatedCost ? matchedPr.estimatedCost / (matchedPr.quantity || 1) : 0,
          totalPrice: matchedPr?.estimatedCost || 0,
          description: "",
        },
      ],
    });
    setIsFormOpen(true);
  };

  const handleEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setFormData({
      purchaseRequest: quotation.purchaseRequest?._id || quotation.purchaseRequest || "",
      vendor: quotation.vendor?._id || quotation.vendor || "",
      amount: quotation.amount || "",
      validUntil: quotation.validUntil ? new Date(quotation.validUntil).toISOString().split("T")[0] : "",
      currency: quotation.currency || "PKR",
      paymentTerms: quotation.paymentTerms || "",
      deliveryTerms: quotation.deliveryTerms || "",
      warrantyTerms: quotation.warrantyTerms || "",
      remarks: quotation.remarks || "",
      items: quotation.items?.length
        ? quotation.items
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
    const totalAmount = updated.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
    setFormData({ ...formData, items: updated, amount: totalAmount });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item: "", quantity: 1, unitPrice: 0, totalPrice: 0, description: "" }],
    });
  };

  const handleRemoveItem = (index) => {
    const updated = formData.items.filter((_, idx) => idx !== index);
    const totalAmount = updated.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
    setFormData({ ...formData, items: updated, amount: totalAmount });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        items: formData.items.map((it) => ({
          ...it,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          totalPrice: Number(it.totalPrice),
        })),
      };

      if (selectedQuotation) {
        await quotationApi.update(selectedQuotation._id, payload);
        toast.success("Quotation updated successfully");
      } else {
        await quotationApi.create(payload);
        toast.success("Quotation submitted successfully");
      }
      setIsFormOpen(false);
      setSelectedQuotation(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save quotation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectQuotation = async (quotation) => {
    setPoDialog({ isOpen: true, quotation, loading: false });
  };

  const handleConfirmGeneratePo = async () => {
    const quote = poDialog.quotation;
    if (!quote) return;
    setPoDialog((prev) => ({ ...prev, loading: true }));
    try {
      // 1. Update quotation status to Accepted
      await quotationApi.update(quote._id, { status: "Accepted" });

      // 2. Create Purchase Order from quotation
      const poPayload = {
        purchaseRequest: quote.purchaseRequest?._id || quote.purchaseRequest,
        selectedVendor: quote.vendor?._id || quote.vendor,
        selectedQuotation: quote._id,
        items: (quote.items && quote.items.length > 0)
          ? quote.items.map((it) => ({
              item: it.item,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              totalPrice: it.totalPrice,
              description: it.description,
            }))
          : [
              {
                item: quote.purchaseRequest?.itemDescription || "Procurement Item",
                quantity: quote.purchaseRequest?.quantity || 1,
                unitPrice: quote.amount / (quote.purchaseRequest?.quantity || 1),
                totalPrice: quote.amount,
              },
            ],
        totalAmount: quote.amount,
        currency: quote.currency || "PKR",
        paymentTerms: quote.paymentTerms || "Net 30",
        deliveryTerms: quote.deliveryTerms || "Delivered to Site",
        deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      };

      const poRes = await purchaseOrderApi.create(poPayload);
      toast.success("Quotation accepted & Purchase Order generated!");
      setPoDialog({ isOpen: false, quotation: null, loading: false });
      setRefreshKey((k) => k + 1);
      navigate("/procurement/purchase-orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate PO from quotation");
      setPoDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await quotationApi.delete(confirmDialog.quotation._id);
      toast.success("Quotation deleted successfully");
      setConfirmDialog({ isOpen: false, quotation: null, loading: false });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete quotation");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Received: "bg-blue-100 text-blue-700",
      UnderReview: "bg-amber-100 text-amber-700",
      Accepted: "bg-green-100 text-green-700 font-bold",
      Rejected: "bg-red-100 text-red-700",
      Expired: "bg-gray-200 text-gray-700",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${
          variants[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status === "Accepted" && <Award className="w-3 h-3" />}
        {status}
      </span>
    );
  };

  // Find lowest price among loaded comparison quotations
  const lowestAmount = quotationsForPr.length
    ? Math.min(...quotationsForPr.map((q) => q.amount || Infinity))
    : 0;

  const columns = [
    {
      key: "quotationNumber",
      label: "Quotation #",
      render: (row) => (
        <span className="font-mono text-sm font-semibold text-blue-600">
          {row.quotationNumber}
        </span>
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.vendor?.name || "—"}</div>
          <div className="text-xs text-gray-500">{row.vendor?.category}</div>
        </div>
      ),
    },
    {
      key: "purchaseRequest",
      label: "Purchase Request",
      render: (row) => (
        <div>
          <span className="font-mono text-xs text-indigo-600 block">
            {row.purchaseRequest?.requestNumber}
          </span>
          <span className="text-xs text-gray-600 line-clamp-1">
            {row.purchaseRequest?.itemDescription}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount (PKR)",
      render: (row) => (
        <span className="font-mono font-bold text-sm text-gray-900">
          {row.amount?.toLocaleString()} {row.currency}
        </span>
      ),
    },
    {
      key: "validUntil",
      label: "Valid Until",
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.validUntil ? new Date(row.validUntil).toLocaleDateString() : "—"}
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
          {row.status !== "Accepted" && (
            <button
              onClick={() => handleSelectQuotation(row)}
              className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-semibold flex items-center gap-1"
              title="Accept Quote & Create PO"
            >
              <Award className="w-3.5 h-3.5" />
              Accept
            </button>
          )}

          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit Quotation"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => setConfirmDialog({ isOpen: true, quotation: row, loading: false })}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Quotation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto" data-tour="procurement-quotations-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2" data-tour="procurement-quotations-heading">
            <FileSpreadsheet className="w-7 h-7 text-blue-600" />
            Vendor Quotations & Comparison
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Collect supplier bids and perform side-by-side comparative analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-lg bg-gray-100 p-0.5 text-xs font-medium" data-tour="procurement-quotation-view">
            <button
              onClick={() => setViewMode("compare")}
              className={`px-3 py-1.5 rounded-md ${
                viewMode === "compare" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-md ${
                viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
              }`}
            >
              All Quotes Table
            </button>
          </div>

          <button
            data-tour="procurement-add-quotation"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Quotation
          </button>
        </div>
      </div>

      {/* Requisition Selector Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6" data-tour="procurement-quotation-selector">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Select Purchase Request to Compare
            </label>
            <select
              value={selectedPrFilter}
              onChange={(e) => handlePrFilterChange(e.target.value)}
              className="w-full text-sm border border-blue-300 rounded-md px-3 py-2 bg-blue-50/40 focus:ring-blue-500 focus:border-blue-500 font-medium"
            >
              <option value="">-- Choose Purchase Request --</option>
              {purchaseRequests.map((pr) => (
                <option key={pr._id} value={pr._id}>
                  {pr.requestNumber} — {pr.itemDescription} ({pr.quantity} units)
                </option>
              ))}
            </select>
          </div>

          {selectedPrFilter && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-md border">
              <span>Comparing {quotationsForPr.length} vendor bids</span>
              {lowestAmount > 0 && lowestAmount < Infinity && (
                <span className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  Lowest: PKR {lowestAmount.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Comparison View vs Table View */}
      {viewMode === "compare" && selectedPrFilter ? (
        <div data-tour="procurement-quotation-compare">
          {loadingCompare ? (
            <div className="text-center py-12 text-gray-500">Loading quotation bids...</div>
          ) : quotationsForPr.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No vendor quotations added yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
                Add 2 or more vendor quotations for this purchase request to perform side-by-side cost and terms comparison.
              </p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
              >
                <Plus className="w-4 h-4" />
                Add First Quotation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quotationsForPr.map((quote) => {
                const isLowest = quote.amount === lowestAmount;
                return (
                  <div
                    key={quote._id}
                    className={`bg-white rounded-xl border relative shadow-sm overflow-hidden flex flex-col justify-between ${
                      quote.status === "Accepted"
                        ? "border-green-500 ring-2 ring-green-400"
                        : isLowest
                        ? "border-blue-400 shadow-md"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Header Banner */}
                    <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          {quote.vendor?.name || "Vendor"}
                        </div>
                        <div className="text-xs text-gray-500">{quote.vendor?.category}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(quote.status)}
                        {isLowest && quote.status !== "Accepted" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Lowest Bid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Primary Terms */}
                    <div className="p-4 space-y-4">
                      <div className="bg-slate-50 p-3 rounded-lg border text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Quoted Bid</div>
                        <div className="text-2xl font-bold font-mono text-gray-900 mt-1">
                          PKR {quote.amount?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Terms Comparison */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-gray-500 font-medium">Payment Terms:</span>
                          <span className="font-semibold text-gray-800">{quote.paymentTerms || "Net 30"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-gray-500 font-medium">Delivery:</span>
                          <span className="font-semibold text-gray-800">{quote.deliveryTerms || "Standard"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-gray-500 font-medium">Warranty:</span>
                          <span className="font-semibold text-gray-800">{quote.warrantyTerms || "Standard"}</span>
                        </div>
                      </div>

                      {/* Items Breakdown */}
                      {quote.items && quote.items.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
                            Line Item Breakdown
                          </span>
                          <div className="bg-gray-50 rounded border overflow-hidden text-xs">
                            <table className="w-full text-left">
                              <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                  <th className="p-1.5">Item</th>
                                  <th className="p-1.5 text-center">Qty</th>
                                  <th className="p-1.5 text-right">Unit Price</th>
                                  <th className="p-1.5 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {quote.items.map((it, idx) => (
                                  <tr key={idx}>
                                    <td className="p-1.5 font-medium">{it.item}</td>
                                    <td className="p-1.5 text-center">{it.quantity}</td>
                                    <td className="p-1.5 text-right font-mono">
                                      {it.unitPrice?.toLocaleString()}
                                    </td>
                                    <td className="p-1.5 text-right font-mono font-semibold">
                                      {it.totalPrice?.toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Footer */}
                    <div className="p-4 border-t bg-gray-50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(quote)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                          title="Edit Quote"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDialog({ isOpen: true, quotation: quote, loading: false })
                          }
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                          title="Delete Quote"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {quote.status !== "Accepted" ? (
                        <button
                          onClick={() => handleSelectQuotation(quote)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold shadow-sm transition-colors"
                        >
                          <Award className="w-4 h-4" />
                          Accept & Generate PO
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-md">
                          Selected & Ordered
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Full Table View */
        <Table
          key={refreshKey}
          columns={columns}
          fetchFn={async (params) => {
            const res = await quotationApi.list({
              ...params,
              purchaseRequest: selectedPrFilter || undefined,
              status: statusFilter || undefined,
            });
            return res.data || res;
          }}
          filters={{ selectedPrFilter, statusFilter }}
          searchPlaceholder="Search quotation number, remarks..."
        />
      )}

      {/* Add / Edit Quotation Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedQuotation ? "Edit Quotation" : "Record Supplier Quotation"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4" data-tour="procurement-quotation-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Purchase Request *
                  </label>
                  <select
                    required
                    value={formData.purchaseRequest}
                    onChange={(e) => setFormData({ ...formData, purchaseRequest: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Purchase Request --</option>
                    {purchaseRequests.map((pr) => (
                      <option key={pr._id} value={pr._id}>
                        {pr.requestNumber} — {pr.itemDescription}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Vendor *
                  </label>
                  <select
                    required
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Vendor --</option>
                    {vendors.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name} ({v.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Total Quoted Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full text-sm font-mono font-bold border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Valid Until Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
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
                    placeholder="e.g. Net 30, 20% advance"
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
                    placeholder="e.g. Delivered to Site within 5 days"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Warranty & Guarantee Terms
                </label>
                <input
                  type="text"
                  value={formData.warrantyTerms}
                  onChange={(e) => setFormData({ ...formData, warrantyTerms: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 1 Year Replacement Warranty"
                />
              </div>

              {/* Line Items Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Quotation Line Items
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
                        placeholder="Item name"
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
                  {submitting ? "Saving..." : selectedQuotation ? "Update Quotation" : "Save Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accept & Generate PO Confirmation Dialog */}
      {poDialog.isOpen && poDialog.quotation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Accept Quotation & Generate PO
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              You are selecting vendor <span className="font-bold text-gray-900">{poDialog.quotation.vendor?.name}</span> with bid <span className="font-bold font-mono text-gray-900">PKR {poDialog.quotation.amount?.toLocaleString()}</span>. This will automatically approve and generate an official Purchase Order.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setPoDialog({ isOpen: false, quotation: null, loading: false })}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={poDialog.loading}
                onClick={handleConfirmGeneratePo}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-semibold disabled:opacity-50"
              >
                {poDialog.loading ? "Generating PO..." : "Confirm Selection & Create PO"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Quotation"
        message={`Are you sure you want to delete quotation "${confirmDialog.quotation?.quotationNumber}"?`}
        confirmText="Delete Quotation"
        confirmVariant="danger"
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, quotation: null, loading: false })}
      />
    </div>
  );
}
