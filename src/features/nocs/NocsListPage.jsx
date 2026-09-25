import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Table from "@/components/common/Table";
import StatusPill from "@/components/ui/StatusPill";
import { getNocs } from "./nocsApi";
export default function NocsListPage() {
  const navigate = useNavigate();
  const columns = [
    {
      key: "issuedNocNumber",
      label: "NOC number",
      render: (row) => row.issuedNocNumber || "Pending",
    },
    { key: "nocType", label: "Type" },
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
      key: "status",
      label: "Status",
      render: (row) => <StatusPill status={row.status} />,
    },
  ];
  return (
    <div className="space-y-6" data-tour="nocs-list">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-primary" data-tour="nocs-page">NOCs</h1>
          <p className="mt-1 text-body text-secondary" data-tour="nocs-summary">
            Manage clearance applications and issued certificates.
          </p>
        </div>
        <button
          data-tour="nocs-new"
          onClick={() => navigate("/nocs/new")}
          className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
        >
          <Plus className="h-4 w-4" /> Apply for NOC
        </button>
      </div>
      <Table
        columns={columns}
        fetchFn={getNocs}
        searchPlaceholder="Search NOCs..."
        onRowClick={(row) => navigate(`/nocs/${row._id}`)}
      />
    </div>
  );
}
