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
      <div data-tour="documents-list" className="flex items-center gap-2 py-6 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading documents...
      </div>
    );
  return (
    <div data-tour="documents-list" className="space-y-3">
      {documents.length === 0 && (
        <p className="py-4 text-sm text-neutral-500">
          No documents uploaded yet.
        </p>
      )}
      {documents.map((document) => (
        <div
          key={document._id}
          className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${document.isSuperseded ? "border-neutral-200 bg-neutral-50 opacity-70" : "border-neutral-200 bg-white"}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-primary-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                {document.type} · {document.fileName}
              </p>
              <p className="text-xs text-neutral-500">
                Version {document.version} · {(document.size / 1024).toFixed(1)}{" "}
                KB{document.isSuperseded ? " · Superseded" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${document.verificationStatus === "Verified" ? "bg-success-100 text-success-700" : document.verificationStatus === "Rejected" ? "bg-danger-100 text-danger-700" : "bg-warning-100 text-warning-700"}`}
            >
              {document.verificationStatus}
            </span>
            <button
              disabled={workingId === document._id}
              onClick={() => download(document)}
              title="Secure download"
              className="rounded p-1.5 text-primary-600 hover:bg-primary-50"
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
                    className="rounded p-1.5 text-success-600 hover:bg-success-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    data-tour="documents-verify"
                    disabled={workingId === document._id}
                    onClick={() => verify(document, "Rejected")}
                    className="rounded px-2 py-1 text-xs text-danger-600 hover:bg-danger-50"
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
