import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMembers } from "@/features/members/membersApi";

/**
 * Typeahead member picker — searches with limit 20 instead of dumping 500–1000 rows into a select.
 */
export default function AsyncMemberSelect({
  value = "",
  onChange,
  placeholder = "Search member by name or ID…",
  status = "Active",
  className = "",
  disabled = false,
  allowEmpty = true,
  emptyLabel = "— Select member —",
  name,
  id,
}) {
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(input.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [input]);

  const { data, isFetching } = useQuery({
    queryKey: ["members-picker", debounced, status],
    queryFn: () => getMembers({ page: 1, limit: 20, search: debounced, status: status || undefined }),
    enabled: open || Boolean(value),
    staleTime: 60_000,
  });

  const members = data?.data || data || [];
  const selected = members.find((m) => m._id === value);

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        name={name}
        type="text"
        disabled={disabled}
        placeholder={selected ? `${selected.name} (${selected.memberId || selected._id})` : placeholder}
        value={open ? input : selected ? `${selected.name} (${selected.memberId || ""})` : input}
        onFocus={() => {
          setOpen(true);
          setInput("");
        }}
        onChange={(event) => {
          setOpen(true);
          setInput(event.target.value);
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        className="w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-body text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        autoComplete="off"
      />
      {allowEmpty && value && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-small text-muted hover:text-primary"
          onMouseDown={(event) => {
            event.preventDefault();
            onChange?.("");
            setInput("");
          }}
        >
          Clear
        </button>
      )}
      {open && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-control border border-border bg-surface-raised shadow-none">
          {allowEmpty && (
            <li>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-small text-muted hover:bg-surface-muted"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange?.("");
                  setInput("");
                  setOpen(false);
                }}
              >
                {emptyLabel}
              </button>
            </li>
          )}
          {isFetching && <li className="px-3 py-2 text-small text-muted">Searching…</li>}
          {!isFetching && members.length === 0 && (
            <li className="px-3 py-2 text-small text-muted">No members found</li>
          )}
          {members.map((member) => (
            <li key={member._id}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-body hover:bg-surface-muted"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange?.(member._id, member);
                  setInput("");
                  setOpen(false);
                }}
              >
                <span className="font-medium text-primary">{member.name}</span>
                <span className="ml-2 text-small text-muted">{member.memberId}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
