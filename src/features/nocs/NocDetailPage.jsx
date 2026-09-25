import { useEffect, useState } from "react";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import ApprovalStageTracker from "@/components/workflow/ApprovalStageTracker";
import { StatusPill } from "@/components/ui";
import {
  approveNoc,
  clearNocDues,
  downloadNocCertificate,
  getNoc,
  issueNoc,
  payNocFee,
  verifyNoc,
} from "./nocsApi";
export default function NocDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [noc, setNoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = () =>
    getNoc(id)
      .then(setNoc)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to load NOC");
        navigate("/nocs");
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
      toast.error(error.response?.data?.message || "NOC action failed");
    }
  };
  const download = async () => {
    try {
      const blob = await downloadNocCertificate(id);
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
      <div className="py-16 text-center text-secondary">Loading NOC...</div>
    );
  if (!noc) return null;
  const verifyUrl = noc.qrVerificationToken
    ? `${window.location.origin}/api/nocs/verify/${noc.qrVerificationToken}`
    : null;
  return (
    <div className="space-y-6" data-tour="nocs-detail-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/nocs")}
            className="rounded-control p-2 hover:bg-surface-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-h1 font-bold text-primary">
                {noc.issuedNocNumber || "NOC Application"}
              </h1>
              <StatusPill status={noc.status} />
            </div>
            <p className="mt-1 text-body text-secondary">
              {noc.nocType} · {noc.memberRef?.name} · {noc.plotRef?.plotNumber}
            </p>
          </div>
        </div>
        {noc.status === "Issued" && (
          <button
            onClick={download}
            className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
          >
            <Download className="h-4 w-4" /> Certificate
          </button>
        )}
      </div>
      <section className="rounded-card border border-border bg-surface p-5 shadow-none" data-tour="nocs-detail-workflow">
        <h2 className="mb-5 font-semibold text-primary">Approval stages</h2>
        <ApprovalStageTracker stages={noc.approvalStages} />
        <div className="mt-6 flex flex-wrap gap-2">
          {noc.status === "Applied" && (
            <button
              onClick={() => action(verifyNoc, "NOC verified")}
              className="rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
            >
              Verify
            </button>
          )}
          {noc.status === "DuesPending" && (
            <button
              onClick={() => action(clearNocDues, "Dues cleared")}
              className="rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
            >
              Clear dues
            </button>
          )}
          {noc.status === "UnderVerification" && !noc.feePaid && (
            <button
              onClick={() => action(payNocFee, "NOC fee paid")}
              className="rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
            >
              Pay fee
            </button>
          )}
          {noc.status === "UnderVerification" && noc.feePaid && (
            <button
              onClick={() => action(approveNoc, "NOC approved")}
              className="rounded-control bg-success px-4 py-2 text-body font-medium text-on-accent"
            >
              Approve
            </button>
          )}
          {noc.status === "Approved" && (
            <button
              onClick={() => action(issueNoc, "NOC issued")}
              className="rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
            >
              Issue NOC
            </button>
          )}
        </div>
      </section>
      {verifyUrl && (
        <section className="rounded-card border border-success bg-success-soft p-5">
          <p className="text-body font-semibold text-success">
            Public verification link
          </p>
          <a
            href={verifyUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center gap-2 break-all text-body text-success underline"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {verifyUrl}
          </a>
        </section>
      )}
    </div>
  );
}
