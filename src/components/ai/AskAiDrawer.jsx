import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bot, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useTour } from "@/tours/useTour";
import { getAskAiHelpForPath } from "./askAiContent";

export default function AskAiDrawer() {
  const location = useLocation();
  const { startTour } = useTour();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const help = getAskAiHelpForPath(location.pathname);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleStartTour = () => {
    if (!help.moduleKey) return;
    setOpen(false);
    window.setTimeout(() => startTour(help.moduleKey), 80);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="erp-ask-ai-fab fixed bottom-4 right-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2.5 text-body font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 sm:bottom-6 sm:right-6 sm:px-4 sm:py-3"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bot className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Ask AI</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-overlay"
            aria-label="Close Ask AI"
            onClick={() => setOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="animate-drawer-in relative flex h-full w-full max-w-md flex-col border-l border-slate-100 bg-white shadow-overlay"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-small font-semibold uppercase tracking-wide text-accent">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Ask AI
                </p>
                <h2 id={titleId} className="mt-1 text-h2 font-bold text-primary">
                  {help.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted hover:bg-slate-50 hover:text-primary"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <p className="text-body text-secondary">{help.summary}</p>

              <div>
                <h3 className="mb-3 text-body font-semibold text-primary">How to use this screen</h3>
                <ol className="space-y-3">
                  {help.steps.map((step, index) => (
                    <li
                      key={step.id || step.title || index}
                      className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                    >
                      <p className="text-body font-semibold text-primary">
                        <span className="mr-2 text-accent">{index + 1}.</span>
                        {step.title}
                      </p>
                      {step.purpose && (
                        <p className="mt-1 text-small text-secondary">{step.purpose}</p>
                      )}
                      {step.completionCriteria && (
                        <p className="mt-1.5 text-small text-muted">
                          Done when: {step.completionCriteria}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4">
              {help.moduleKey && (
                <Button type="button" className="w-full" onClick={handleStartTour}>
                  Start Guided Tour
                </Button>
              )}
              {help.relatedRoute && (
                <Link
                  to={help.relatedRoute}
                  onClick={() => setOpen(false)}
                  className="erp-button inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border-strong bg-transparent px-4 py-2.5 text-body font-semibold text-primary hover:border-accent hover:bg-[#ECFDF5]"
                >
                  Open related page
                </Link>
              )}
              {!help.moduleKey && (
                <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(false)}>
                  Close
                </Button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
