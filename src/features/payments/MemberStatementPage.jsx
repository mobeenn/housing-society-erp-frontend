import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import StatusPill from "@/components/ui/StatusPill";
import { getMemberStatement } from "./paymentsApi";

export default function MemberStatementPage({ embedded = false }) {
  const { id } = useParams();
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getMemberStatement(id)
      .then(setStatement)
      .catch((error) =>
        toast.error(
          error.response?.data?.message || "Failed to load statement",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);
  if (loading)
    return (
      <div className="py-8 text-center text-sm text-neutral-500">
        Loading statement...
      </div>
    );
  if (!statement) return null;
  return (
    <div className={embedded ? "space-y-5" : "space-y-6"}>
      {!embedded && (
        <h1 className="text-2xl font-bold text-neutral-900">
          Member Statement
        </h1>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["Total charges", statement.totalCharges],
          ["Total payments", statement.totalPayments],
          ["Outstanding balance", statement.balance],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-neutral-900">
              {Number(value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Debit</th>
              <th className="px-5 py-3">Credit</th>
              <th className="px-5 py-3">Running total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {statement.ledger.map((entry) => (
              <tr key={`${entry.type}-${entry.reference}`}>
                <td className="px-5 py-3">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">{entry.type}</td>
                <td className="px-5 py-3 font-mono text-xs">
                  {entry.reference}
                </td>
                <td className="px-5 py-3">
                  {entry.debit ? Number(entry.debit).toLocaleString() : "—"}
                </td>
                <td className="px-5 py-3">
                  {entry.credit ? Number(entry.credit).toLocaleString() : "—"}
                </td>
                <td className="px-5 py-3 font-medium">
                  {Number(entry.runningTotal).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {embedded && (
        <Link
          to={`/members/${id}/statement`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Open full statement
        </Link>
      )}
    </div>
  );
}
