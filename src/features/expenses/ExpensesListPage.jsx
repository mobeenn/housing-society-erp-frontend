import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Table from "@/components/common/Table";
import StatusPill from "@/components/ui/StatusPill";
import {
  approveExpense,
  getExpenses,
  payExpense,
  rejectExpense,
} from "./expensesApi";

export default function ExpensesListPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const action = async (handler, id, message) => {
    try {
      await handler(id);
      toast.success(message);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Expense action failed");
    }
  };
  const columns = [
    {
      key: "date",
      label: "Date",
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    { key: "category", label: "Category" },
    { key: "vendor", label: "Vendor", render: (row) => row.vendor || "—" },
    {
      key: "amount",
      label: "Amount",
      render: (row) => Number(row.amount).toLocaleString(),
    },
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
          data-tour="expenses-row-actions"
          className="flex gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          {row.status === "Pending" && (
            <>
              <button
                onClick={() =>
                  action(approveExpense, row._id, "Expense approved")
                }
                className="text-success-600"
              >
                Approve
              </button>
              <button
                onClick={() =>
                  action(rejectExpense, row._id, "Expense rejected")
                }
                className="text-danger-600"
              >
                Reject
              </button>
            </>
          )}
          {row.status === "Approved" && (
            <button
              onClick={() => action(payExpense, row._id, "Expense marked paid")}
              className="text-primary-600"
            >
              Mark paid
            </button>
          )}
        </div>
      ),
    },
  ];
  return (
    <div data-tour="expenses-page-intro" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 data-tour="expenses-heading" className="text-2xl font-bold text-neutral-900">Expenses</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Track expense approvals and paid operating costs.
          </p>
        </div>
        <button
          data-tour="expenses-add"
          onClick={() => navigate("/expenses/new")}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Add expense
        </button>
      </div>
      <Table
        columns={columns}
        fetchFn={getExpenses}
        filters={{ refreshKey }}
        searchPlaceholder="Search expenses..."
      />
    </div>
  );
}
