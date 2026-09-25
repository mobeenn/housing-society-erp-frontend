import { useEffect, useState } from "react";
import { CheckCircle2, Download, FileText, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCan } from "@/hooks/useCan";
import {
  downloadDocument,
  listDocuments,
  verifyDocument,
} from "@/features/documents/documentsApi";

export default function DocumentList({
  relatedEntityType,
  relatedEntityId,
  refreshKey = 0,
}) {
  const canVerify = useCan("documents", "approve");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const load = async () => {
    setLoading(true);
    try {
      setDocuments(await listDocuments(relatedEntityType, relatedEntityId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [relatedEntityType, relatedEntityId, refreshKey]);
  const download = async (document) => {
    setWorkingId(document._id);
    try {
      const blob = await downloadDocument(document._id);
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = document.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Download failed");
    } finally {
      setWorkingId(null);
    }
  };
  const verify = async (document, status) => {
    setWorkingId(document._id);
    try {
      await verifyDocument(document._id, status);
      toast.success(`Document ${status.toLowerCase()}`);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setWorkingId(null);
    }
  };
  if (loading)
    return (
      <div data-tour="documents-list" className="flex items-center gap-2 py-6 text-body text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading documents...
      </div>
    );
  return (
    <div data-tour="documents-list" className="space-y-3">
      {documents.length === 0 && (
        <p className="py-4 text-body text-secondary">
          No documents uploaded yet.
        </p>
      )}
      {documents.map((document) => (
        <div
          key={document._id}
          className={`flex flex-wrap items-center justify-between gap-3 rounded-control border p-3 ${document.isSuperseded ? "border-border bg-canvas opacity-70" : "border-border bg-surface"}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="truncate text-body font-medium text-primary">
                {document.type} · {document.fileName}
              </p>
              <p className="text-small text-secondary">
                Version {document.version} · {(document.size / 1024).toFixed(1)}{" "}
                KB{document.isSuperseded ? " · Superseded" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-small font-medium ${document.verificationStatus === "Verified" ? "bg-success-soft text-success" : document.verificationStatus === "Rejected" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"}`}
            >
              {document.verificationStatus}
            </span>
            <button
              disabled={workingId === document._id}
              onClick={() => download(document)}
              title="Secure download"
              className="rounded-control p-1.5 text-accent hover:bg-gold-soft"
            >
              <Download className="h-4 w-4" />
            </button>
            {canVerify &&
              document.verificationStatus === "Pending" && (
                <>
                  <button
                    data-tour="documents-verify"
                    disabled={workingId === document._id}
                    onClick={() => verify(document, "Verified")}
                    title="Verify document"
                    className="rounded-control p-1.5 text-success hover:bg-success-soft"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    data-tour="documents-verify"
                    disabled={workingId === document._id}
                    onClick={() => verify(document, "Rejected")}
                    className="rounded-control px-2 py-1 text-small text-danger hover:bg-danger-soft"
                  >
                    Reject
                  </button>
                </>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
