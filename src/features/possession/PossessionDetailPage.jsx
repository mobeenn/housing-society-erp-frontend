import { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import ApprovalStageTracker from "@/components/workflow/ApprovalStageTracker";
import { StatusPill } from "@/components/ui";
import {
  approvePossession,
  downloadPossessionLetter,
  getPossession,
  issuePossession,
  payPossessionCharges,
  verifyPossession,
} from "./possessionApi";
export default function PossessionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = () =>
    getPossession(id)
      .then(setApplication)
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            "Failed to load possession application",
        );
        navigate("/possession");
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
      toast.error(error.response?.data?.message || "Possession action failed");
    }
  };
  const download = async () => {
    try {
      const blob = await downloadPossessionLetter(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error.response?.data?.message || "Letter download failed");
    }
  };
  if (loading)
    return (
      <div className="py-16 text-center text-secondary">
        Loading possession...
      </div>
    );
  if (!application) return null;
  return (
    <div className="space-y-6" data-tour="possession-detail-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/possession")}
            className="rounded-control p-2 hover:bg-surface-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-h1 font-bold text-primary">
                Possession Application
              </h1>
              <StatusPill status={application.status} />
            </div>
            <p className="mt-1 text-body text-secondary">
              {application.memberRef?.name} · {application.plotRef?.plotNumber}
            </p>
          </div>
        </div>
        {application.status === "Possessed" && (
          <button
            onClick={download}
            className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
          >
            <Download className="h-4 w-4" /> Possession letter
          </button>
        )}
      </div>
      <section className="rounded-card border border-border bg-surface p-5 shadow-none" data-tour="possession-detail-workflow">
        <h2 className="mb-5 font-semibold text-primary">
          Possession stages
        </h2>
        <ApprovalStageTracker stages={application.approvalStages} />
        <div className="mt-6 flex flex-wrap gap-2">
          {application.status === "Applied" && (
            <button
              onClick={() => action(verifyPossession, "Possession verified")}
              className="rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
            >
              Verify eligibility
            </button>
          )}
          {application.status === "UnderVerification" &&
            !application.chargesPaid && (
              <button
                onClick={() =>
                  action(payPossessionCharges, "Possession charges paid")
                }
                className="rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
              >
                Pay charges
              </button>
            )}
          {application.status === "UnderVerification" &&
            application.chargesPaid && (
              <button
                onClick={() => action(approvePossession, "Possession approved")}
                className="rounded-control bg-success px-4 py-2 text-body font-medium text-on-accent"
              >
                Approve
              </button>
            )}
          {application.status === "Approved" && (
            <button
              onClick={() => action(issuePossession, "Possession issued")}
              className="rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
            >
              Issue possession
            </button>
          )}
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3" data-tour="possession-detail-checks">
        {[
          ["Eligibility verified", application.eligibilityVerified],
          ["Dues verified", application.duesVerified],
          ["Site readiness", application.siteReadinessVerified],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-card border border-border bg-surface p-4 shadow-none"
          >
            <p className="text-small text-secondary">{label}</p>
            <p className="mt-1 font-semibold text-primary">
              {value ? "Yes" : "No"}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
