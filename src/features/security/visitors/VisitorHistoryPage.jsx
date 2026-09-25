import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Clock, Search, Filter, Download } from "lucide-react";
import { listVisitorEntries } from "./visitorsApi";

export default function VisitorHistoryPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    gate: "",
  });

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const params = { q: search, limit: 200 };
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.gate) params.gate = filters.gate;

      const result = await listVisitorEntries(params);
      setVisitors(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      toast.error("Failed to fetch visitor history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchVisitors();
  };

  const clearFilters = () => {
    setFilters({ from: "", to: "", gate: "" });
    setSearch("");
  };

  const formatTime = (iso) => {
    if (!iso) return "—";
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (entry, exit) => {
    if (!entry || !exit) return "—";
    const diff = new Date(exit) - new Date(entry);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6" data-tour="visitors-history-page">
      <div className="mb-6">
        <h1 className="text-display font-bold text-primary flex items-center gap-2" data-tour="visitors-history-heading">
          <Clock className="w-8 h-8" />
          Visitor History
        </h1>
        <p className="text-secondary mt-1">Search and filter past visitor entries</p>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-control shadow-none p-4 mb-4 space-y-4" data-tour="visitors-history-filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-body font-medium text-primary mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, phone, CNIC, vehicle..."
                className="w-full pl-10 pr-4 py-2 border rounded-control focus:ring-2 focus:ring-info"
              />
            </div>
          </div>
          <div>
            <label className="block text-body font-medium text-primary mb-1">From Date</label>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
            />
          </div>
          <div>
            <label className="block text-body font-medium text-primary mb-1">To Date</label>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-on-accent rounded-control hover:bg-accent-hover"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-surface-muted text-primary rounded-control hover:bg-surface-muted"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-secondary">Loading...</div>
      ) : visitors.length === 0 ? (
        <div className="bg-surface rounded-control shadow-none p-12 text-center">
          <Clock className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="text-secondary text-h2">No visitor entries found</p>
        </div>
      ) : (
        <div className="bg-surface rounded-control shadow-none overflow-hidden" data-tour="visitors-history-results">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left text-small font-medium text-secondary">Visitor</th>
                <th className="px-4 py-3 text-left text-small font-medium text-secondary">Host</th>
                <th className="px-4 py-3 text-left text-small font-medium text-secondary">Entry</th>
                <th className="px-4 py-3 text-left text-small font-medium text-secondary">Exit</th>
                <th className="px-4 py-3 text-left text-small font-medium text-secondary">Duration</th>
                <th className="px-4 py-3 text-left text-small font-medium text-secondary">Gate</th>
                <th className="px-4 py-3 text-left text-small font-medium text-secondary">Vehicle</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {visitors.map((v) => (
                <tr key={v._id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <div className="font-medium text-primary">{v.visitorName}</div>
                    <div className="text-small text-secondary">
                      {v.phone && <span className="mr-2">{v.phone}</span>}
                      {v.cnic && <span>{v.cnic}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-body text-primary">
                    {v.hostMemberRef?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-body text-primary">{formatTime(v.entryTime)}</td>
                  <td className="px-4 py-3 text-body text-primary">
                    {v.exitTime ? formatTime(v.exitTime) : <span className="text-success font-medium">Inside</span>}
                  </td>
                  <td className="px-4 py-3 text-body text-primary">
                    {calculateDuration(v.entryTime, v.exitTime)}
                  </td>
                  <td className="px-4 py-3 text-body text-primary">{v.gate}</td>
                  <td className="px-4 py-3 text-body text-primary">{v.vehicleNumber || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-surface-muted text-body text-secondary border-t">
            Showing {visitors.length} {visitors.length === 1 ? "entry" : "entries"}
          </div>
        </div>
      )}
    </div>
  );
}
