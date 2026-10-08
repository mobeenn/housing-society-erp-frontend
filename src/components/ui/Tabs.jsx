import { useEffect, useId, useRef } from "react";
import useBreakpoint from "@/hooks/useBreakpoint";

/**
 * Responsive tabs: horizontal scroll on mobile; select dropdown when many tabs on xs.
 */
export default function Tabs({
  tabs = [],
  value,
  onChange,
  className = "",
  selectBelowCount = 5,
}) {
  const listRef = useRef(null);
  const { isXs } = useBreakpoint();
  const labelId = useId();
  const useSelect = isXs && tabs.length >= selectBelowCount;

  useEffect(() => {
    if (useSelect || !listRef.current) return;
    const active = listRef.current.querySelector("[data-active='true']");
    active?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [value, useSelect]);

  if (!tabs.length) return null;

  if (useSelect) {
    return (
      <div className={className}>
        <label htmlFor={labelId} className="sr-only">
          Section
        </label>
        <select
          id={labelId}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="min-h-11 w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-body text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`-mx-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      <div ref={listRef} className="flex min-w-0 gap-1 px-1" role="tablist">
        {tabs.map((tab) => {
          const active = tab.id === value;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-active={active ? "true" : "false"}
              onClick={() => onChange?.(tab.id)}
              className={`min-h-11 shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-body font-medium transition-colors ${
                active
                  ? "bg-gold-soft text-accent"
                  : "text-secondary hover:bg-surface-muted hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
