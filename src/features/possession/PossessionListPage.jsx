import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Table from "@/components/common/Table";
import StatusPill from "@/components/ui/StatusPill";
import { getPossessions } from "./possessionApi";
export default function PossessionListPage() {
  const navigate = useNavigate();
  const columns = [
    {
      key: "plot",
      label: "Plot",
      render: (row) => row.plotRef?.plotNumber || "—",
    },
    {
      key: "member",
      label: "Member",
      render: (row) => row.memberRef?.name || "—",
    },
    {
      key: "possessionCharges",
      label: "Charges",
      render: (row) => Number(row.possessionCharges).toLocaleString(),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusPill status={row.status} />,
    },
  ];
  return (
    <div className="space-y-6" data-tour="possession-list">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" data-tour="possession-page">Possession</h1>
          <p className="mt-1 text-sm text-neutral-500" data-tour="possession-summary">
            Manage site readiness, handover, and possession letters.
          </p>
        </div>
        <button
          data-tour="possession-new"
          onClick={() => navigate("/possession/new")}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Apply for possession
        </button>
      </div>
      <Table
        columns={columns}
        fetchFn={getPossessions}
        searchPlaceholder="Search possession applications..."
        onRowClick={(row) => navigate(`/possession/${row._id}`)}
      />
    </div>
  );
}
