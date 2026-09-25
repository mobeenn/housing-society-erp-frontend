export default function ApprovalStageTracker({ stages = [] }) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      {stages.map((stage, index) => (
        <div
          key={`${stage.stage}-${index}`}
          className="flex min-w-37.5 flex-1 items-start gap-3"
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-body font-semibold ${stage.status === "Completed" ? "bg-success text-on-accent" : stage.status === "Rejected" ? "bg-danger text-on-accent" : "bg-surface-muted text-secondary"}`}
          >
            {index + 1}
          </div>
          <div>
            <p className="text-body font-semibold text-primary">
              {stage.stage}
            </p>
            <p className="text-small text-secondary">{stage.status}</p>
            {stage.remarks && (
              <p className="mt-1 text-small text-secondary">{stage.remarks}</p>
            )}
          </div>
          {index < stages.length - 1 && (
            <div className="mt-4 hidden h-px flex-1 bg-surface-muted md:block" />
          )}
        </div>
      ))}
    </div>
  );
}
