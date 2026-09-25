import { useState } from "react";
import { RotateCcw, ReceiptText } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import InvoiceTable from "./InvoiceTable";

const INVOICE_TYPES = [
  "Booking",
  "Installment",
  "Transfer",
  "NOC",
  "Possession",
  "Construction",
  "PlotMerge",
  "BuyBack",
  "Expense",
  "OtherTransaction",
  "VendorCommission",
];

const emptyFilters = {
  invoiceType: "",
  member: "",
  dealer: "",
  plot: "",
  startDate: "",
  endDate: "",
  status: "",
};

export default function InvoicesListPage() {
  const [filters, setFilters] = useState(emptyFilters);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => setFilters(emptyFilters);

  return (
    <div data-tour="invoices-page-intro" className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-h1 font-bold text-primary">Invoices</h1>
            <span className="rounded-full bg-gold-soft px-2.5 py-1 text-small font-medium text-accent">
              Document registry
            </span>
          </div>
          <p className="mt-1 text-body text-secondary">
            Browse, filter, view, and reprint generated society documents.
          </p>
        </div>
        <ReceiptText className="hidden h-8 w-8 text-accent sm:block" />
      </div>

      <Card title="Filters">
        <div data-tour="invoices-filters" className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
          <label data-tour="dealers-type-filter" className="text-body font-medium text-primary">
            Type
            <select
              value={filters.invoiceType}
              onChange={(event) => setFilter("invoiceType", event.target.value)}
              className="mt-1 w-full rounded-control border border-border-strong bg-surface px-3 py-2 text-body font-normal"
            >
              <option value="">All types</option>
              {INVOICE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="text-body font-medium text-primary">
            Member ID
            <Input value={filters.member} onChange={(event) => setFilter("member", event.target.value)} placeholder="Member ID" className="mt-1" />
          </label>
          <label className="text-body font-medium text-primary">
            Dealer/Vendor ID
            <Input data-tour="dealers-reference-filter" value={filters.dealer} onChange={(event) => setFilter("dealer", event.target.value)} placeholder="Vendor ID" className="mt-1" />
          </label>
          <label className="text-body font-medium text-primary">
            Plot ID
            <Input value={filters.plot} onChange={(event) => setFilter("plot", event.target.value)} placeholder="Plot ID" className="mt-1" />
          </label>
          <label className="text-body font-medium text-primary">
            From
            <Input type="date" value={filters.startDate} onChange={(event) => setFilter("startDate", event.target.value)} className="mt-1" />
          </label>
          <label className="text-body font-medium text-primary">
            To
            <Input type="date" value={filters.endDate} onChange={(event) => setFilter("endDate", event.target.value)} className="mt-1" />
          </label>
          <label className="text-body font-medium text-primary">
            Status
            <select
              value={filters.status}
              onChange={(event) => setFilter("status", event.target.value)}
              className="mt-1 w-full rounded-control border border-border-strong bg-surface px-3 py-2 text-body font-normal"
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <Button data-tour="invoices-clear-filters" type="button" variant="outline" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4" /> Clear filters
          </Button>
        </div>
      </Card>

      <InvoiceTable filters={filters} />
    </div>
  );
}
