import { useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadDocument } from "@/features/documents/documentsApi";

const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx";

export default function DocumentUploader({
  relatedEntityType,
  relatedEntityId,
  onUploaded,
}) {
  const [form, setForm] = useState({
    type: "CNIC",
    number: "",
    issueDate: "",
    expiryDate: "",
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const submit = async (event) => {
    event.preventDefault();
    if (!file) return toast.error("Select a document file first");
    setSaving(true);
    try {
      await uploadDocument({
        file,
        relatedEntityType,
        relatedEntityId,
        ...form,
      });
      toast.success("Document uploaded");
      setFile(null);
      setForm({ type: "CNIC", number: "", issueDate: "", expiryDate: "" });
      event.target.reset();
      onUploaded?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Document upload failed");
    } finally {
      setSaving(false);
    }
  };
  return (
    <form
      data-tour="documents-uploader"
      onSubmit={submit}
      className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-sm font-medium text-neutral-700">
          Document type
          <select
            name="type"
            value={form.type}
            onChange={change}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-normal"
          >
            <option>CNIC</option>
            <option>Ownership proof</option>
            <option>Agreement</option>
            <option>Receipt</option>
            <option>Other</option>
          </select>
        </label>
        <label className="text-sm font-medium text-neutral-700">
          Document number
          <input
            name="number"
            value={form.number}
            onChange={change}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-medium text-neutral-700">
          Issue date
          <input
            type="date"
            name="issueDate"
            value={form.issueDate}
            onChange={change}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-medium text-neutral-700">
          Expiry date
          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={change}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-normal"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <input
          data-tour="documents-file"
          required
          type="file"
          accept={ACCEPTED}
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="block max-w-full text-sm text-neutral-600"
        />
        <button
          data-tour="documents-upload"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}{" "}
          Upload document
        </button>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        PDF, JPG, PNG, WEBP, DOC, or DOCX up to 10 MB.
      </p>
    </form>
  );
}
