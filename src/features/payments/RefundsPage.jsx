import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import StatusPill from "@/components/ui/StatusPill";
import { useCan } from "@/hooks/useCan";
import {
  approveRefund,
  getRefunds,
  payRefund,
  rejectRefund,
} from "./paymentsApi";

export default function RefundsPage() {
  const canApprove = useCan("refunds", "approve");
  const canReject = useCan("refunds", "reject");
  const canRefund = useCan("refunds", "refund");
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () =>
    getRefunds()
      .then(setRefunds)
      .catch((error) =>
        toast.error(error.response?.data?.message || "Failed to load refunds"),
      )
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const action = async (handler, id, message) => {
    try {
      await handler(id);
      toast.success(message);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Refund action failed");
    }
  };
  if (loading)
    return (
      <div className="py-16 text-center text-secondary">
        Loading refunds...
      </div>
    );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-primary">Refunds</h1>
        <p className="mt-1 text-body text-secondary">
          Review and settle refund requests.
        </p>
      </div>
      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-none">
        <table className="w-full text-left text-body">
          <thead className="bg-canvas text-small text-secondary">
            <tr>
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Reason</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {refunds.map((refund) => (
              <tr key={refund._id}>
                <td className="px-5 py-3">{refund.member}</td>
                <td className="px-5 py-3">
                  {Number(refund.amount).toLocaleString()}
                </td>
                <td className="px-5 py-3">{refund.reason}</td>
                <td className="px-5 py-3">
                  <StatusPill status={refund.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    {refund.status === "Pending" && (canApprove || canReject) && (
                      <>
                        {canApprove && <button
                          onClick={() =>
                            action(approveRefund, refund._id, "Refund approved")
                          }
                          className="text-success"
                        >
                          Approve
                        </button>}
                        {canReject && <button
                          onClick={() =>
                            action(rejectRefund, refund._id, "Refund rejected")
                          }
                          className="text-danger"
                        >
                          Reject
                        </button>}
                      </>
                    )}
                    {refund.status === "Approved" && canRefund && (
                      <button
                        onClick={() =>
                          action(payRefund, refund._id, "Refund marked paid")
                        }
                        className="text-accent"
                      >
                        Mark paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {refunds.length === 0 && (
          <p className="p-8 text-center text-body text-secondary">
            No refunds found.
          </p>
        )}
      </div>
    </div>
  );
}
