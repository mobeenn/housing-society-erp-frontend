export default function ApprovalStageTracker({ stages = [] }) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      {stages.map((stage, index) => (
        <div
          key={`${stage.stage}-${index}`}
          className="flex min-w-37.5 flex-1 items-start gap-3"
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${stage.status === "Completed" ? "bg-success-600 text-white" : stage.status === "Rejected" ? "bg-danger-600 text-white" : "bg-neutral-200 text-neutral-600"}`}
          >
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">
              {stage.stage}
            </p>
            <p className="text-xs text-neutral-500">{stage.status}</p>
            {stage.remarks && (
              <p className="mt-1 text-xs text-neutral-500">{stage.remarks}</p>
            )}
          </div>
          {index < stages.length - 1 && (
            <div className="mt-4 hidden h-px flex-1 bg-neutral-200 md:block" />
          )}
        </div>
      ))}
    </div>
  );
}
