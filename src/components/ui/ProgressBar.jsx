/**
 * Animated progress bar with ocean→mint gradient fill.
 * @param {number} value 0–100
 */
export default function ProgressBar({ value = 0, className = "", label }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={className}>
      {label != null && (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-small">
          <span className="text-muted">{label}</span>
          <span className="font-semibold tabular-nums text-primary">{clamped.toFixed(1)}%</span>
        </div>
      )}
      <div className="erp-progress-track" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <div className="erp-progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
