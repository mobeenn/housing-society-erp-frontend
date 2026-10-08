/**
 * Responsive form field grid: 1 col mobile → 2 tablet → 3 desktop.
 */
export default function FormGrid({ children, cols = 3, className = "" }) {
  const desktop =
    cols >= 3
      ? "lg:grid-cols-3"
      : cols === 2
        ? "lg:grid-cols-2"
        : "lg:grid-cols-1";
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${desktop} ${className}`}>
      {children}
    </div>
  );
}
