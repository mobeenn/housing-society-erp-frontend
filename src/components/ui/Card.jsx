export default function Card({ title, children, actions, className = "" }) {
  return (
    <section className={`rounded-card border border-border bg-surface ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          {title && <h2 className="text-h2 text-primary">{title}</h2>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
