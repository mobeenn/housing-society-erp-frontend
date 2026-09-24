import { useState } from "react";
import { Eye, Plus, Printer } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Table from "@/components/common/Table";
import StatusPill from "@/components/ui/StatusPill";
import { downloadReceipt, getPayments } from "./paymentsApi";

export default function PaymentsListPage() {
  const navigate = useNavigate();
  const [refreshKey] = useState(0);
  const printReceipt = async (payment) => {
    try {
      const blob = await downloadReceipt(payment._id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error.response?.data?.message || "Receipt generation failed");
    }
  };
  const columns = [
    {
      key: "receiptNumber",
      label: "Receipt",
      render: (row) => (
        <span data-tour="payments-receipt" className="font-mono font-semibold text-primary-700">
          {row.receiptNumber}
        </span>
      ),
    },
    {
      key: "member",
      label: "Member",
      render: (row) => row.memberRef?.name || "—",
    },
    {
      key: "plot",
      label: "Plot",
      render: (row) => row.plotRef?.plotNumber || "—",
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => Number(row.amount).toLocaleString(),
    },
    { key: "method", label: "Method" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div
          data-tour="payments-row-actions"
          className="flex gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            title="View payment"
            onClick={() => navigate(`/payments/${row._id}`)}
            className="rounded p-1 text-primary-600 hover:bg-primary-50"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            title="Print receipt"
            onClick={() => printReceipt(row)}
            className="rounded p-1 text-neutral-600 hover:bg-neutral-100"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
  return (
    <div data-tour="payments-page-intro" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Payments</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Receipts and installment allocations.
          </p>
        </div>
        <button
          data-tour="payments-record"
          onClick={() => navigate("/payments/new")}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Record payment
        </button>
      </div>
      <Table
        columns={columns}
        fetchFn={getPayments}
        filters={{ refreshKey }}
        searchPlaceholder="Search payments by receipt..."
        onRowClick={(row) => navigate(`/payments/${row._id}`)}
      />
    </div>
  );
}
