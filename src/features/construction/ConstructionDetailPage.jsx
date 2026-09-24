import { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import ApprovalStageTracker from "@/components/workflow/ApprovalStageTracker";
import StatusPill from "@/components/ui/StatusPill";
import {
  addInspection,
  approveConstruction,
  downloadCompletionCertificate,
  getConstructionApplication,
  rejectConstruction,
  reviewConstruction,
  updateInspection,
} from "./constructionApi";
export default function ConstructionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState({
    findings: "",
    violations: "",
    correctiveActionsRequired: false,
    reinspectionRequired: false,
    reinspectionDate: "",
  });
  const load = () =>
    getConstructionApplication(id)
      .then(setApplication)
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "Failed to load application",
        );
        navigate("/construction");
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
      toast.error(
        error.response?.data?.message || "Construction action failed",
      );
    }
  };
  const logInspection = async (event) => {
    event.preventDefault();
    try {
      await addInspection(id, {
        ...inspection,
        violations: inspection.violations
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      toast.success("Inspection logged");
      setInspection({
        findings: "",
        violations: "",
        correctiveActionsRequired: false,
        reinspectionRequired: false,
        reinspectionDate: "",
      });
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Inspection failed");
    }
  };
  const correct = async (item) => {
    try {
      await updateInspection(id, item._id, {
        correctiveActionsRequired: false,
        reinspectionRequired: false,
        violations: [],
      });
      toast.success("Corrective action marked complete");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };
  const certificate = async () => {
    try {
      const blob = await downloadCompletionCertificate(id);
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
        Loading construction application...
      </div>
    );
  if (!application) return null;
  return (
    <div className="space-y-6" data-tour="construction-detail-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/construction")}
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">
                Construction Application
              </h1>
              <StatusPill status={application.status} />
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              {application.applicationType} · {application.memberRef?.name} ·{" "}
              {application.plotRef?.plotNumber}
            </p>
          </div>
        </div>
        {application.status === "Approved" && (
          <button
            onClick={certificate}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Download className="h-4 w-4" /> Completion certificate
          </button>
        )}
      </div>
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm" data-tour="construction-detail-workflow">
        <h2 className="mb-5 font-semibold text-neutral-900">Review stages</h2>
        <ApprovalStageTracker
          stages={[
            {
              stage: "Review",
              status:
                application.status === "Applied" ? "Pending" : "Completed",
            },
            {
              stage: "Inspection",
              status:
                application.inspections?.length &&
                application.inspections.every(
                  (item) =>
                    !item.violations?.length && !item.reinspectionRequired,
                )
                  ? "Completed"
                  : "Pending",
            },
            {
              stage: "Approval",
              status:
                application.status === "Approved" ? "Completed" : "Pending",
            },
          ]}
        />
        <div className="mt-6 flex gap-2">
          {application.status === "Applied" && (
            <button
              onClick={() =>
                action(reviewConstruction, "Application under review")
              }
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
            >
              Start review
            </button>
          )}
          {application.status === "UnderReview" && (
            <>
              <button
                onClick={() =>
                  action(approveConstruction, "Construction approved")
                }
                className="rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  const remarks = window.prompt("Rejection remarks");
                  if (remarks)
                    rejectConstruction(id, remarks).then(() => {
                      toast.success("Application rejected");
                      load();
                    });
                }}
                className="rounded-lg border border-danger-200 px-4 py-2 text-sm text-danger-700"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </section>
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2" data-tour="construction-detail-inspections">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-neutral-900">Inspections</h2>
          <div className="space-y-3">
            {(application.inspections || []).map((item) => (
              <div key={item._id} className="rounded-lg bg-neutral-50 p-3">
                <p className="text-sm font-medium">
                  {new Date(item.date).toLocaleDateString()} · {item.findings}
                </p>
                {item.violations?.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-danger-700">
                    {item.violations.map((violation) => (
                      <li key={violation}>{violation}</li>
                    ))}
                  </ul>
                )}
                {item.reinspectionRequired && item.reinspectionDate && (
                  <p className="mt-2 text-xs font-medium text-warning-700">
                    Re-inspection scheduled:{" "}
                    {new Date(item.reinspectionDate).toLocaleDateString()}
                  </p>
                )}
                {item.correctiveActionsRequired || item.reinspectionRequired ? (
                  <button
                    onClick={() => correct(item)}
                    className="mt-3 rounded-lg bg-success-600 px-3 py-2 text-xs font-medium text-white"
                  >
                    Mark corrective action done
                  </button>
                ) : (
                  <p className="mt-2 text-xs text-success-700">Passed</p>
                )}
              </div>
            ))}
          </div>
          <form
            onSubmit={logInspection}
            className="mt-5 space-y-3 border-t border-neutral-200 pt-5"
          >
            <h3 className="text-sm font-semibold">
              Log inspection / reinspection
            </h3>
            <textarea
              required
              value={inspection.findings}
              onChange={(event) =>
                setInspection((current) => ({
                  ...current,
                  findings: event.target.value,
                }))
              }
              placeholder="Findings"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <textarea
              value={inspection.violations}
              onChange={(event) =>
                setInspection((current) => ({
                  ...current,
                  violations: event.target.value,
                }))
              }
              placeholder="Violations, one per line"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={inspection.correctiveActionsRequired}
                onChange={(event) =>
                  setInspection((current) => ({
                    ...current,
                    correctiveActionsRequired: event.target.checked,
                  }))
                }
              />{" "}
              Corrective action required
            </label>
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={inspection.reinspectionRequired}
                onChange={(event) =>
                  setInspection((current) => ({
                    ...current,
                    reinspectionRequired: event.target.checked,
                  }))
                }
              />{" "}
              Reinspection required
            </label>
            {inspection.reinspectionRequired && (
              <label className="block text-sm">
                Reinspection date
                <input
                  type="date"
                  value={inspection.reinspectionDate}
                  onChange={(event) =>
                    setInspection((current) => ({
                      ...current,
                      reinspectionDate: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </label>
            )}
            <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">
              Save inspection
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
