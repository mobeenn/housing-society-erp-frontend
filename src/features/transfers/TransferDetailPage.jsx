import { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import ApprovalStageTracker from "@/components/workflow/ApprovalStageTracker";
import DocumentUploader from "@/components/documents/DocumentUploader";
import DocumentList from "@/components/documents/DocumentList";
import {
  approveTransfer,
  completeTransfer,
  downloadCertificate,
  getTransfer,
  rejectTransfer,
  verifyTransfer,
} from "./transfersApi";

export default function TransferDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentRefreshKey, setDocumentRefreshKey] = useState(0);
  const load = () =>
    getTransfer(id)
      .then(setTransfer)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to load transfer");
        navigate("/transfers");
      })
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, [id]);
  const action = async (handler, message) => {
    try {
      await handler(id);
      toast.success(message);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Transfer action failed");
    }
  };
  const reject = async () => {
    const remarks = window.prompt("Rejection remarks");
    if (remarks)
      await action(
        (requestId) => rejectTransfer(requestId, remarks),
        "Transfer rejected",
      );
  };
  const certificate = async () => {
    try {
      const blob = await downloadCertificate(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Certificate download failed",
      );
    }
  };
  if (loading)
    return (
      <div className="py-16 text-center text-neutral-500">
        Loading transfer...
      </div>
    );
  if (!transfer) return null;
  return (
    <div className="space-y-6" data-tour="transfers-detail-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/transfers")}
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Transfer Request
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {transfer.plotRef?.plotNumber} · {transfer.fromMemberRef?.name} →{" "}
              {transfer.toMemberRef?.name}
            </p>
          </div>
        </div>
        {transfer.status === "Completed" && (
          <button
            onClick={certificate}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Download className="h-4 w-4" /> Certificate
          </button>
        )}
      </div>
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm" data-tour="transfers-detail-workflow">
        <h2 className="mb-5 font-semibold text-neutral-900">Approval stages</h2>
        <ApprovalStageTracker stages={transfer.approvalStages} />
        <div className="mt-6 flex flex-wrap gap-2">
          {transfer.status === "Draft" && (
            <button
              onClick={() => action(verifyTransfer, "Transfer verified")}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
            >
              Verify transfer
            </button>
          )}
          {transfer.status === "PendingApproval" && (
            <>
              <button
                onClick={() => action(approveTransfer, "Transfer approved")}
                className="rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white"
              >
                Approve
              </button>
              <button
                onClick={reject}
                className="rounded-lg border border-danger-200 px-4 py-2 text-sm text-danger-700"
              >
                Reject
              </button>
            </>
          )}
          {transfer.status === "Approved" && (
            <button
              onClick={() => action(completeTransfer, "Transfer completed")}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
            >
              Complete transfer
            </button>
          )}
        </div>
      </section>
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm" data-tour="transfers-detail-documents">
        <h2 className="mb-4 font-semibold text-neutral-900">Documents</h2>
        <DocumentUploader
          relatedEntityType="transfer"
          relatedEntityId={id}
          onUploaded={() => setDocumentRefreshKey((key) => key + 1)}
        />
        <div className="mt-5">
          <DocumentList
            relatedEntityType="transfer"
            relatedEntityId={id}
            refreshKey={documentRefreshKey}
          />
        </div>
      </section>
    </div>
  );
}
