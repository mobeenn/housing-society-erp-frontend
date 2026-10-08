import { useState } from "react";
import { Filter } from "lucide-react";
import Table from "@/components/common/Table";
import { Button, Card, FormGrid, Input } from "@/components/ui";
import { listVisitorEntries } from "./visitorsApi";

const formatTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PK", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateDuration = (entry, exit) => {
  if (!entry || !exit) return "—";
  const diff = new Date(exit) - new Date(entry);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

export default function VisitorHistoryPage() {
  const [draft, setDraft] = useState({ from: "", to: "", gate: "" });
  const [filters, setFilters] = useState({ from: "", to: "", gate: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchHistory = async (params) => {
    const result = await listVisitorEntries({
      q: params.search,
      page: params.page,
      limit: params.limit || 20,
      from: filters.from || undefined,
      to: filters.to || undefined,
      gate: filters.gate || undefined,
    });
    return result;
  };

  const columns = [
    {
      key: "visitorName",
      label: "Visitor",
      render: (row) => (
        <div>
          <div className="font-medium text-primary">{row.visitorName}</div>
          <div className="text-small text-secondary">
            {[row.phone, row.cnic].filter(Boolean).join(" · ") || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "host",
      label: "Host",
      hideBelow: "lg",
      render: (row) => row.hostMemberRef?.name || "—",
    },
    {
      key: "entryTime",
      label: "Entry",
      render: (row) => formatTime(row.entryTime),
    },
    {
      key: "exitTime",
      label: "Exit",
      hideBelow: "md",
      render: (row) =>
        row.exitTime ? formatTime(row.exitTime) : <span className="font-medium text-success">Inside</span>,
    },
    {
      key: "duration",
      label: "Duration",
      hideBelow: "lg",
      sortable: false,
      render: (row) => calculateDuration(row.entryTime, row.exitTime),
    },
    { key: "gate", label: "Gate", hideBelow: "lg" },
    {
      key: "vehicleNumber",
      label: "Vehicle",
      hideBelow: "lg",
      render: (row) => row.vehicleNumber || "—",
    },
  ];

  return (
    <div className="space-y-6" data-tour="visitors-history-page">
      <div>
        <h1 className="text-h1 font-bold text-primary" data-tour="visitors-history-heading">
          Visitor History
        </h1>
        <p className="mt-1 text-body text-secondary">Search and filter past visitor entries</p>
      </div>

      <Card>
        <div data-tour="visitors-history-filters" className="space-y-4">
          <FormGrid cols={3}>
            <Input
              label="From date"
              type="date"
              value={draft.from}
              onChange={(event) => setDraft((prev) => ({ ...prev, from: event.target.value }))}
            />
            <Input
              label="To date"
              type="date"
              value={draft.to}
              onChange={(event) => setDraft((prev) => ({ ...prev, to: event.target.value }))}
            />
            <Input
              label="Gate"
              value={draft.gate}
              onChange={(event) => setDraft((prev) => ({ ...prev, gate: event.target.value }))}
              placeholder="Gate name"
            />
          </FormGrid>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={() => {
                setFilters(draft);
                setRefreshKey((key) => key + 1);
              }}
            >
              <Filter className="h-4 w-4" />
              Apply filters
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const cleared = { from: "", to: "", gate: "" };
                setDraft(cleared);
                setFilters(cleared);
                setRefreshKey((key) => key + 1);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <div data-tour="visitors-history-results">
        <Table
          key={refreshKey}
          columns={columns}
          fetchFn={fetchHistory}
          filters={filters}
          searchPlaceholder="Search name, phone, CNIC, vehicle..."
          emptyMessage="No visitor entries found"
        />
      </div>
    </div>
  );
}
