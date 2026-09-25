import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Table from "@/components/common/Table";
import StatusPill from "@/components/ui/StatusPill";
import { getConstructionApplications } from "./constructionApi";
export default function ConstructionListPage() {
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
    { key: "applicationType", label: "Type" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusPill status={row.status} />,
    },
  ];
  return (
    <div className="space-y-6" data-tour="construction-list">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-primary" data-tour="construction-page">Construction</h1>
          <p className="mt-1 text-body text-secondary" data-tour="construction-summary">
            Review applications, inspections, corrective actions, and
            certificates.
          </p>
        </div>
        <button
          data-tour="construction-new"
          onClick={() => navigate("/construction/new")}
          className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
        >
          <Plus className="h-4 w-4" /> New application
        </button>
      </div>
      <Table
        columns={columns}
        fetchFn={getConstructionApplications}
        searchPlaceholder="Search construction applications..."
        onRowClick={(row) => navigate(`/construction/${row._id}`)}
      />
    </div>
  );
}
