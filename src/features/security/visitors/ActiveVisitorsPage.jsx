import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { UserCheck, LogOut, Search, RefreshCw } from "lucide-react";
import { listVisitorEntries, markExit } from "./visitorsApi";

export default function ActiveVisitorsPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchActiveVisitors();
  }, []);

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

  const handleMarkExit = async (id, visitorName) => {
    if (!confirm(`Mark exit for ${visitorName}?`)) return;

    try {
      await markExit(id, {});
      toast.success("Exit marked");
      fetchActiveVisitors();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark exit");
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.visitorName?.toLowerCase().includes(q) ||
      v.phone?.toLowerCase().includes(q) ||
      v.cnic?.toLowerCase().includes(q) ||
      v.vehicleNumber?.toLowerCase().includes(q) ||
      v.hostMemberRef?.name?.toLowerCase().includes(q)
    );
  });

  const formatTime = (iso) => {
    if (!iso) return "—";
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6" data-tour="visitors-active-page">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2" data-tour="visitors-active-heading">
            <UserCheck className="w-8 h-8" />
            Active Visitors
          </h1>
          <p className="text-gray-600 mt-1">Currently inside the society</p>
        </div>
        <button
          data-tour="visitors-active-refresh"
          onClick={fetchActiveVisitors}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-4" data-tour="visitors-active-search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, CNIC, vehicle..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Visitors List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filteredVisitors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {search ? "No matching visitors" : "No active visitors"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4" data-tour="visitors-active-list">
          {filteredVisitors.map((visitor) => (
            <div key={visitor._id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{visitor.visitorName}</h3>
                <div className="mt-1 space-y-1 text-sm text-gray-600">
                  {visitor.hostMemberRef && (
                    <p>
                      <span className="font-medium">Host:</span> {visitor.hostMemberRef.name}
                    </p>
                  )}
                  {visitor.purpose && (
                    <p>
                      <span className="font-medium">Purpose:</span> {visitor.purpose}
                    </p>
                  )}
                  {visitor.vehicleNumber && (
                    <p>
                      <span className="font-medium">Vehicle:</span> {visitor.vehicleNumber}
                    </p>
                  )}
                  {visitor.phone && (
                    <p>
                      <span className="font-medium">Phone:</span> {visitor.phone}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Entry:</span> {formatTime(visitor.entryTime)} at {visitor.gate}
                  </p>
                </div>
              </div>
              <button
                data-tour="visitors-mark-exit"
                onClick={() => handleMarkExit(visitor._id, visitor.visitorName)}
                className="ml-4 flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
              >
                <LogOut className="w-5 h-5" />
                Mark Exit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
