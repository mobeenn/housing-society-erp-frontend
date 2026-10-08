import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import useBreakpoint from "@/hooks/useBreakpoint";

/**
 * Server-side table with hybrid responsive presentation:
 * - < sm: stacked cards
 * - sm–md: horizontal scroll + sticky first column
 * - lg+: full table
 *
 * Column options: hideBelow ("sm"|"md"|"lg"), cardLabel, priority
 */
export default function Table({
  columns,
  fetchFn,
  fetchData: legacyFetchFn,
  filters = {},
  onRowClick,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
}) {
  const { sm, lg } = useBreakpoint();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch((previous) => {
        if (previous === searchInput) return previous;
        setPagination((pageState) => ({ ...pageState, page: 1 }));
        return searchInput;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataFetcher = fetchFn || legacyFetchFn;
      if (typeof dataFetcher !== "function") throw new Error("Table requires a fetchFn function");

      const result = await dataFetcher({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        sortBy,
        sortOrder,
        ...filters,
      });
      const payload = result?.data?.data ?? result?.data ?? result;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : payload?.users || payload?.roles || [];
      const nextPagination = result?.pagination || result?.data?.pagination || payload?.pagination;
      setData(rows);
      setPagination(nextPagination || pagination);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch when query inputs change
  }, [pagination.page, pagination.limit, debouncedSearch, sortBy, sortOrder, filtersKey]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("desc");
    }
    setPagination((previous) => ({ ...previous, page: 1 }));
  };

  const handlePageChange = (newPage) => setPagination((previous) => ({ ...previous, page: newPage }));

  const visibleColumns = useMemo(() => {
    if (lg) return columns;
    return columns.filter((column) => {
      if (!column.hideBelow) return true;
      if (column.hideBelow === "lg") return false;
      if (column.hideBelow === "md" && !lg) return false;
      return true;
    });
  }, [columns, lg]);

  const cellValue = (column, row) => (column.render ? column.render(row) : row[column.key]);

  if (error) {
    return (
      <div className="rounded-card border border-danger bg-danger-soft p-4 text-center">
        <p className="text-small text-danger">{error}</p>
        <button type="button" onClick={fetchData} className="mt-2 min-h-11 text-small font-semibold text-danger underline hover:no-underline">
          Retry
        </button>
      </div>
    );
  }

  const useCards = !sm;

  return (
    <div className="min-w-0 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="min-h-11 w-full rounded-control border border-border-strong bg-surface-raised py-2.5 pl-10 pr-4 text-body text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
      </div>

      {loading && data.length === 0 ? (
        <div className="space-y-3 rounded-card border border-border bg-surface p-4" aria-label="Loading records" role="status">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="erp-skeleton h-10 rounded-control" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-card border border-border bg-surface py-12 text-center text-small text-muted">
          <p>{emptyMessage}</p>
        </div>
      ) : useCards ? (
        <div className="space-y-3">
          {data.map((row, index) => {
            const primaryCol = columns[0];
            const restCols = columns.slice(1);
            return (
              <article
                key={row._id || index}
                className={`rounded-card border border-border bg-surface p-4 shadow-sm ${
                  onRowClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""
                }`}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(event) => {
                  if (onRowClick && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onRowClick(row);
                  }
                }}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {primaryCol && (
                  <div className="mb-3 border-b border-slate-100 pb-3">
                    <p className="text-label font-medium uppercase tracking-wide text-muted">
                      {primaryCol.cardLabel || primaryCol.label}
                    </p>
                    <div className="mt-1 text-body font-semibold text-primary">
                      {cellValue(primaryCol, row)}
                    </div>
                  </div>
                )}
                <dl className="grid grid-cols-1 gap-3">
                  {restCols.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-start justify-between gap-3 border-b border-slate-50 pb-2 last:border-0 last:pb-0"
                    >
                      <dt className="shrink-0 text-label font-medium text-muted">
                        {column.cardLabel || column.label}
                      </dt>
                      <dd
                        className={`min-w-0 text-right text-body text-primary ${
                          column.numeric ? "font-tabular" : ""
                        }`}
                      >
                        {cellValue(column, row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem]">
              <thead className="border-b border-border bg-surface-muted">
                <tr>
                  {visibleColumns.map((column, colIndex) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={`px-4 py-3 text-left text-label font-semibold text-secondary lg:px-6 ${
                        column.sortable !== false ? "cursor-pointer select-none" : ""
                      } ${colIndex === 0 ? "sticky left-0 z-10 bg-surface-muted shadow-[2px_0_6px_-2px_rgba(15,23,42,0.08)] lg:static lg:shadow-none" : ""}`}
                      onClick={() => column.sortable !== false && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.label}</span>
                        {column.sortable !== false && sortBy === column.key && (
                          <span>{sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((row, index) => (
                  <tr
                    key={row._id || index}
                    className={`erp-table-row group ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {visibleColumns.map((column, colIndex) => (
                      <td
                        key={column.key}
                        className={`whitespace-nowrap px-4 py-3 text-body text-secondary lg:px-6 lg:py-4 ${
                          column.numeric ? "text-right font-tabular" : ""
                        } ${colIndex === 0 ? "sticky left-0 z-10 bg-surface group-hover:bg-surface-muted shadow-[2px_0_6px_-2px_rgba(15,23,42,0.08)] lg:static lg:bg-transparent lg:shadow-none" : ""}`}
                      >
                        {cellValue(column, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-secondary">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1 || loading} className="min-h-11 rounded-control border border-border px-3 py-2 text-small text-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50">
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, index) => index + 1)
              .filter((page) => page === 1 || page === pagination.pages || Math.abs(page - pagination.page) <= 1)
              .map((page, index, array) => {
                if (index > 0 && page - array[index - 1] > 1) return <span key={`ellipsis-${page}`} className="px-2 py-2 text-muted">...</span>;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`min-h-11 min-w-11 rounded-control border px-3 py-2 text-small ${page === pagination.page ? "border-accent bg-accent text-on-accent" : "border-border text-primary hover:bg-surface-muted"} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {page}
                  </button>
                );
              })}
            <button type="button" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages || loading} className="min-h-11 rounded-control border border-border px-3 py-2 text-small text-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
