import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Table from "@/components/common/Table";
import StatusPill from "@/components/ui/StatusPill";
import { getTransfers } from "./transfersApi";
export default function TransfersListPage() {
  const navigate = useNavigate();
  const columns = [
    {
      key: "plot",
      label: "Plot",
      render: (row) => row.plotRef?.plotNumber || "—",
    },
    {
      key: "fromMember",
      label: "From",
      render: (row) => row.fromMemberRef?.name || "—",
    },
    {
      key: "toMember",
      label: "To",
      render: (row) => row.toMemberRef?.name || "—",
    },
    { key: "type", label: "Type" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusPill status={row.status} />,
    },
  ];
  return (
    <div className="space-y-6" data-tour="transfers-list">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-primary" data-tour="transfers-page">Transfers</h1>
          <p className="mt-1 text-body text-secondary" data-tour="transfers-summary">
            Manage ownership transfer verification and approval.
          </p>
        </div>
        <button
          data-tour="transfers-new"
          onClick={() => navigate("/transfers/new")}
          className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
        >
          <Plus className="h-4 w-4" /> New transfer
        </button>
      </div>
      <Table
        columns={columns}
        fetchFn={getTransfers}
        searchPlaceholder="Search transfer requests..."
        onRowClick={(row) => navigate(`/transfers/${row._id}`)}
      />
    </div>
  );
}
