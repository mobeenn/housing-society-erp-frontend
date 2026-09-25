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
      <div className="py-8 text-center text-body text-secondary">
        Loading statement...
      </div>
    );
  if (!statement) return null;
  return (
    <div className={embedded ? "space-y-5" : "space-y-6"}>
      {!embedded && (
        <h1 className="text-h1 font-bold text-primary">
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
            className="rounded-card border border-border bg-surface p-4 shadow-none"
          >
            <p className="text-small text-secondary">{label}</p>
            <p className="mt-1 text-h2 font-semibold text-primary">
              {Number(value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-none">
        <table className="w-full text-left text-body">
          <thead className="bg-canvas text-small text-secondary">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Debit</th>
              <th className="px-5 py-3">Credit</th>
              <th className="px-5 py-3">Running total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {statement.ledger.map((entry) => (
              <tr key={`${entry.type}-${entry.reference}`}>
                <td className="px-5 py-3">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">{entry.type}</td>
                <td className="px-5 py-3 font-mono text-small">
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
          className="text-body font-medium text-accent hover:text-accent"
        >
          Open full statement
        </Link>
      )}
    </div>
  );
}
