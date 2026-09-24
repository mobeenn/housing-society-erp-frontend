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
      <div className="py-16 text-center text-neutral-500">Loading NOC...</div>
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
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">
                {noc.issuedNocNumber || "NOC Application"}
              </h1>
              <StatusPill status={noc.status} />
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              {noc.nocType} · {noc.memberRef?.name} · {noc.plotRef?.plotNumber}
            </p>
          </div>
        </div>
        {noc.status === "Issued" && (
          <button
            onClick={download}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Download className="h-4 w-4" /> Certificate
          </button>
        )}
      </div>
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm" data-tour="nocs-detail-workflow">
        <h2 className="mb-5 font-semibold text-neutral-900">Approval stages</h2>
        <ApprovalStageTracker stages={noc.approvalStages} />
        <div className="mt-6 flex flex-wrap gap-2">
          {noc.status === "Applied" && (
            <button
              onClick={() => action(verifyNoc, "NOC verified")}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
            >
              Verify
            </button>
          )}
          {noc.status === "DuesPending" && (
            <button
              onClick={() => action(clearNocDues, "Dues cleared")}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
            >
              Clear dues
            </button>
          )}
          {noc.status === "UnderVerification" && !noc.feePaid && (
            <button
              onClick={() => action(payNocFee, "NOC fee paid")}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
            >
              Pay fee
            </button>
          )}
          {noc.status === "UnderVerification" && noc.feePaid && (
            <button
              onClick={() => action(approveNoc, "NOC approved")}
              className="rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white"
            >
              Approve
            </button>
          )}
          {noc.status === "Approved" && (
            <button
              onClick={() => action(issueNoc, "NOC issued")}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
            >
              Issue NOC
            </button>
          )}
        </div>
      </section>
      {verifyUrl && (
        <section className="rounded-xl border border-success-200 bg-success-50 p-5">
          <p className="text-sm font-semibold text-success-800">
            Public verification link
          </p>
          <a
            href={verifyUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center gap-2 break-all text-sm text-success-700 underline"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {verifyUrl}
          </a>
        </section>
      )}
    </div>
  );
}
