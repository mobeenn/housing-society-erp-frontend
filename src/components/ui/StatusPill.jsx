import { useEffect, useRef, useState } from "react";
import { getStatusClass, getStatusDotClass } from "@/lib/statusStyles";

export default function StatusPill({ status, className = "", pulse = false }) {
  const value = String(status || "");
  const normalized = value.toLowerCase();
  const previousStatus = useRef(normalized);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (previousStatus.current && previousStatus.current !== normalized) {
      setIsChanging(true);
      const timer = window.setTimeout(() => setIsChanging(false), 420);
      previousStatus.current = normalized;
      return () => window.clearTimeout(timer);
    }
    previousStatus.current = normalized;
  }, [normalized]);

  const prefersReducedMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-badge px-2.5 py-0.5 text-small font-semibold capitalize ${getStatusClass(value)} ${(pulse || isChanging) && !prefersReducedMotion ? "erp-status-pulse" : ""} ${className}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${getStatusDotClass(value)}`} />
      {status}
    </span>
  );
}
