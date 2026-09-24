const recoveryTour = {
  moduleKey: "recovery",
  tourTitle: "Recovery Tour",
  moduleSummary:
    "Recovery helps staff work overdue installments, coordinate calls, and monitor collection progress. The work is complete when the right overdue work area is open, the available actions are clear, and progress or commitments can be reviewed.",
  steps: [
    {
      id: "recovery-page-intro",
      target: "[data-tour='recovery-page-intro']",
      title: "Recovery workspace",
      purpose: "Start here to review the recovery area available to you, whether it is the administration view, the agent portal, or overdue work.",
      completionCriteria: "This step is done when the Recovery page is open and its heading and main workspace are visible.",
      requiredPermission: { module: "recovery", action: "view" },
    },
    {
      id: "recovery-title",
      target: "[data-tour='recovery-title']",
      title: "Know the current view",
      purpose: "Read the page title and summary to confirm whether you are coordinating the team, checking your own work, or reviewing overdue installments.",
      completionCriteria: "This step is done when the recovery title and its short description match the work you need to do.",
      requiredPermission: { module: "recovery", action: "view" },
    },
    {
      id: "recovery-actions",
      target: "[data-tour='recovery-actions']",
      title: "Use page actions",
      purpose: "Use the header actions for the real actions available in this view, such as refreshing data, opening overdue installments, or exporting a list.",
      completionCriteria: "This step is done when the header actions are visible and the chosen action opens its page or confirms it ran.",
      requiredPermission: { module: "recovery", action: "view" },
    },
    {
      id: "recovery-work-area",
      target: "[data-tour='recovery-work-area']",
      title: "Work from the recovery area",
      purpose: "Use the tabs, filters, and cards in the main area to find overdue plots, assignments, calls, commitments, or performance information.",
      completionCriteria: "This step is done when the main recovery area is visible and the relevant tab or filter shows the work item you selected.",
      requiredPermission: { module: "recovery", action: "view" },
    },
  ],
};

export default recoveryTour;
