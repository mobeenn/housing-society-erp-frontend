import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { LogOut, RefreshCw, Search, UserCheck } from "lucide-react";
import { Button, Card, ConfirmDialog, Input, PageSkeleton } from "@/components/ui";
import { listVisitorEntries, markExit } from "./visitorsApi";

const formatTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PK", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ActiveVisitorsPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState({ isOpen: false, visitor: null, loading: false });

  const fetchActiveVisitors = async () => {
    setLoading(true);
    try {
      const result = await listVisitorEntries({ activeOnly: true, limit: 100 });
      setVisitors(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      toast.error("Failed to fetch active visitors");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveVisitors();
  }, []);

  const handleConfirmExit = async () => {
    if (!confirm.visitor) return;
    setConfirm((prev) => ({ ...prev, loading: true }));
    try {
      await markExit(confirm.visitor._id, {});
      toast.success("Exit marked");
      setConfirm({ isOpen: false, visitor: null, loading: false });
      fetchActiveVisitors();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark exit");
      setConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const q = search.toLowerCase();
    return (
      visitor.visitorName?.toLowerCase().includes(q)
      || visitor.phone?.toLowerCase().includes(q)
      || visitor.cnic?.toLowerCase().includes(q)
      || visitor.vehicleNumber?.toLowerCase().includes(q)
      || visitor.hostMemberRef?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6" data-tour="visitors-active-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-h1 font-bold text-primary" data-tour="visitors-active-heading">
            Active Visitors
          </h1>
          <p className="mt-1 text-body text-secondary">Currently inside the society</p>
        </div>
        <Button data-tour="visitors-active-refresh" variant="outline" onClick={fetchActiveVisitors}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="relative" data-tour="visitors-active-search">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, phone, CNIC, vehicle..."
          className="pl-10"
        />
      </div>

      {loading ? (
        <PageSkeleton variant="list" label="Loading active visitors" />
      ) : filteredVisitors.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <UserCheck className="mx-auto mb-3 h-10 w-10 text-muted" />
            <p className="text-body text-secondary">
              {search ? "No matching visitors" : "No active visitors"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4" data-tour="visitors-active-list">
          {filteredVisitors.map((visitor) => (
            <Card key={visitor._id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <h3 className="text-h2 font-semibold text-primary">{visitor.visitorName}</h3>
                  <p className="text-body text-secondary">
                    <span className="font-medium text-primary">Host:</span>{" "}
                    {visitor.hostMemberRef?.name || "—"}
                  </p>
                  {visitor.purpose && (
                    <p className="text-body text-secondary">
                      <span className="font-medium text-primary">Purpose:</span> {visitor.purpose}
                    </p>
                  )}
                  {visitor.vehicleNumber && (
                    <p className="text-body text-secondary">
                      <span className="font-medium text-primary">Vehicle:</span> {visitor.vehicleNumber}
                    </p>
                  )}
                  {visitor.phone && (
                    <p className="text-body text-secondary">
                      <span className="font-medium text-primary">Phone:</span> {visitor.phone}
                    </p>
                  )}
                  <p className="text-body text-secondary">
                    <span className="font-medium text-primary">Entry:</span>{" "}
                    {formatTime(visitor.entryTime)} at {visitor.gate}
                  </p>
                </div>
                <Button
                  data-tour="visitors-mark-exit"
                  variant="danger"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => setConfirm({ isOpen: true, visitor, loading: false })}
                >
                  <LogOut className="h-4 w-4" />
                  Mark Exit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={() => !confirm.loading && setConfirm({ isOpen: false, visitor: null, loading: false })}
        onConfirm={handleConfirmExit}
        title="Mark visitor exit?"
        message={`Mark exit for ${confirm.visitor?.visitorName || "this visitor"}?`}
        confirmLabel="Mark Exit"
        isLoading={confirm.loading}
      />
    </div>
  );
}
