import { useState } from "react";
import { ExternalLink, Loader2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusPill from "../../components/ui/StatusPill";
import { useCan } from "@/hooks/useCan";
import { cancelInvoice, listInvoices, openInvoiceFile } from "./invoicesApi";

const currency = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

export default function InvoiceTable({
  member,
  dealer,
  embedded = false,
  filters: extraFilters = {},
}) {
  const canDelete = useCan("invoices", "delete");
  const [refreshKey, setRefreshKey] = useState(0);
  const [workingId, setWorkingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const openFile = async (invoice) => {
    try {
      setWorkingId(invoice._id);
      await openInvoiceFile(invoice.fileUrl || invoice.viewUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to open invoice document");
    } finally {
      setWorkingId(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelInvoice(cancelTarget._id);
      toast.success("Invoice cancelled");
      setCancelTarget(null);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cancel invoice");
    } finally {
      setCancelling(false);
    }
  };

  const columns = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      sortable: false,
      render: (row) => <span className="font-mono text-xs font-medium text-neutral-800">{row.invoiceNumber}</span>,
    },
    {
      key: "invoiceType",
      label: "Type",
      sortable: false,
      render: (row) => <span className="text-sm text-neutral-700">{row.invoiceType}</span>,
    },
    {
      key: "memberName",
      label: "Member",
      sortable: false,
      render: (row) => row.memberName || row.memberNumber || "—",
    },
    {
      key: "dealerName",
      label: "Dealer/Vendor",
      sortable: false,
      render: (row) => row.dealerName || "—",
    },
    {
      key: "plotNumber",
      label: "Plot",
      sortable: false,
      render: (row) => row.plotNumber || "—",
    },
    {
      key: "amount",
      label: "Amount",
      sortable: false,
      render: (row) => currency.format(Number(row.amount || 0)),
    },
    {
      key: "issueDate",
      label: "Issue Date",
      sortable: false,
      render: (row) => formatDate(row.issueDate),
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div data-tour="invoices-actions" className="flex items-center gap-2">
          <button
            data-tour="invoices-open-document"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openFile(row);
            }}
            disabled={(!row.fileUrl && !row.viewUrl) || workingId === row._id}
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
            title="View or reprint original document"
          >
            {workingId === row._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
            View/Reprint
          </button>
          {canDelete && row.status !== "Cancelled" && (
            <button
              data-tour="invoices-cancel"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setCancelTarget(row);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-danger-200 px-2.5 py-1.5 text-xs font-medium text-danger-700 hover:bg-danger-50"
              title="Cancel invoice"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div data-tour="invoices-table" className={embedded ? "" : "space-y-4"}>
      <Table
        columns={columns}
        fetchFn={listInvoices}
        filters={{ member, dealer, refreshKey, ...extraFilters }}
        searchPlaceholder="Search invoice number, type, member, plot..."
        emptyMessage="No invoices found"
      />
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
        title="Cancel Invoice"
        message={`Cancel invoice ${cancelTarget?.invoiceNumber || ""}? The source document will not be deleted.`}
        confirmText="Cancel Invoice"
        variant="danger"
        loading={cancelling}
      />
    </div>
  );
}
