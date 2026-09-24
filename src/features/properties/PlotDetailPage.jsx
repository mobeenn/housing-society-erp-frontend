import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Edit,
  FileText,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import StatusPill from "@/components/ui/StatusPill";
import DocumentUploader from "@/components/documents/DocumentUploader";
import DocumentList from "@/components/documents/DocumentList";
import { getPlotById, getPlotHistory } from "./propertiesApi";

const Placeholder = ({ icon: Icon, title }) => (
  <div className="rounded-lg border border-dashed border-neutral-300 p-5">
    <div className="flex items-center gap-2 text-neutral-700">
      <Icon className="h-4 w-4" />
      <h3 className="font-medium">{title}</h3>
    </div>
    <p className="mt-2 text-sm text-neutral-500">
      This linked module is not available yet. Records will appear here when
      implemented.
    </p>
  </div>
);

export default function PlotDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [plot, setPlot] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentRefreshKey, setDocumentRefreshKey] = useState(0);
  useEffect(() => {
    Promise.all([getPlotById(id), getPlotHistory(id)])
      .then(([record, records]) => {
        setPlot(record);
        setHistory(records);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to load plot");
        navigate("/plots");
      })
      .finally(() => setLoading(false));
  }, [id]);
  if (loading)
    return (
      <div className="py-16 text-center text-neutral-500">Loading plot...</div>
    );
  if (!plot) return null;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/plots")}
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">
                {plot.plotNumber}
              </h1>
              <StatusPill status={plot.status} />
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              {plot.blockRef?.name || "—"} · {plot.streetRef?.name || "—"} ·{" "}
              {plot.size}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/plots/${id}/edit`)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
        >
          <Edit className="h-4 w-4" /> Edit Plot
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          ["Plot category", plot.categoryRef?.name],
          ["Property type", plot.propertyTypeRef?.name],
          ["File number", plot.fileNumber || "—"],
          ["Price", Number(plot.price || 0).toLocaleString()],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-1 font-medium text-neutral-900">{value || "—"}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
            <RefreshCw className="h-4 w-4 text-primary-600" /> Status timeline
          </h2>
          <div className="mt-5 space-y-4">
            {(history?.transactionHistory || [])
              .filter(
                (entry) =>
                  entry.action === "statusChange" || entry.action === "create",
              )
              .map((entry) => (
                <div
                  key={entry._id}
                  className="flex gap-3 border-l-2 border-primary-200 pl-4"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {entry.action === "create"
                        ? "Plot created"
                        : `Status changed to ${entry.changes?.after?.status || "updated"}`}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            {!history?.transactionHistory?.length && (
              <p className="text-sm text-neutral-500">
                No timeline entries yet.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
            <Building2 className="h-4 w-4 text-primary-600" /> Ownership history
          </h2>
          <div className="mt-5 space-y-3">
            {(history?.ownershipHistory || []).map((entry) => (
              <div key={entry._id} className="rounded-lg bg-neutral-50 p-3">
                <p className="text-sm font-medium text-neutral-900">
                  {entry.memberRef?.name || `Member ${entry.member}`}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {new Date(entry.fromDate).toLocaleDateString()} to{" "}
                  {entry.toDate
                    ? new Date(entry.toDate).toLocaleDateString()
                    : "Current"}{" "}
                  · {entry.type}
                </p>
              </div>
            ))}
            {!history?.ownershipHistory?.length && (
              <p className="text-sm text-neutral-500">
                No ownership changes recorded.
              </p>
            )}
          </div>
        </section>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Placeholder icon={ScrollText} title="Bookings" />
        <Placeholder icon={RefreshCw} title="Transfers" />
        <Placeholder icon={FileText} title="NOCs" />
      </div>
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          Documents
        </h2>
        <div className="space-y-5">
          <DocumentUploader
            relatedEntityType="plot"
            relatedEntityId={id}
            onUploaded={() => setDocumentRefreshKey((key) => key + 1)}
          />
          <DocumentList
            relatedEntityType="plot"
            relatedEntityId={id}
            refreshKey={documentRefreshKey}
          />
        </div>
      </section>
    </div>
  );
}
