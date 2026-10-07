import {
  getTour,
  getTourModuleForPath,
  TOUR_ROUTE_BY_MODULE,
} from "@/tours/registry";

/**
 * Build route-aware help content from the tour registry (no external LLM).
 */
export function getAskAiHelpForPath(pathname) {
  const moduleKey = getTourModuleForPath(pathname);
  const tour = moduleKey ? getTour(moduleKey) : null;

  if (!tour) {
    return {
      moduleKey: null,
      title: "Ask AI — Civica help",
      summary:
        "Select a module from the sidebar, then open Ask AI again for step-by-step guidance based on that screen’s guided tour.",
      steps: [
        {
          title: "Navigate to a module",
          purpose: "Open any operational screen (members, plots, invoices, etc.).",
        },
        {
          title: "Start a Guided Tour",
          purpose: "Use Help / Tour in the header for an interactive walkthrough.",
        },
      ],
      relatedRoute: "/dashboard",
    };
  }

  return {
    moduleKey: tour.moduleKey,
    title: tour.tourTitle || tour.moduleKey,
    summary: tour.moduleSummary || "",
    steps: (tour.steps || []).map((step) => ({
      id: step.id,
      title: step.title,
      purpose: step.purpose,
      completionCriteria: step.completionCriteria,
    })),
    relatedRoute: TOUR_ROUTE_BY_MODULE[tour.moduleKey] || null,
  };
}
