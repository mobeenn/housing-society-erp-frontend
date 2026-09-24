const complaintsTour = {
  moduleKey: "complaints",
  tourTitle: "Complaints Tour",
  moduleSummary:
    "Complaints give staff one place to record an issue, assign it, track the service deadline, and close it with a resolution note. The workflow is complete when the complaint is filed, its status moves through the board, and the resolution is readable.",
  steps: [
    {
      id: "complaints-page",
      target: "[data-tour='complaints-page']",
      title: "Complaints board",
      purpose: "Use the board to see new, assigned, in-progress, and resolved complaints together.",
      completionCriteria: "The Complaints Board heading and description are visible.",
      requiredPermission: { module: "complaints", action: "view" },
    },
    {
      id: "complaints-new",
      target: "[data-tour='complaints-new']",
      title: "File a complaint",
      purpose: "Choose File complaint when a resident or staff member reports a new issue.",
      completionCriteria: "The complaint form opens with issue and reporter details; after submission, the complaint appears on the status board with a due date.",
      requiredPermission: { module: "complaints", action: "create" },
    },
    {
      id: "complaints-refresh",
      target: "[data-tour='complaints-refresh']",
      title: "Refresh the board",
      purpose: "Use Refresh when you need the latest complaint statuses and SLA information.",
      completionCriteria: "The board reloads and the visible complaint counts and status cards match the latest saved records.",
      requiredPermission: { module: "complaints", action: "view" },
    },
    {
      id: "complaints-status-board",
      target: "[data-tour='complaints-status-board']",
      title: "Move work through statuses",
      purpose: "Read each status column and use the card buttons to start, resolve, reopen, or close a complaint.",
      completionCriteria: "The status columns and complaint cards are visible with readable status labels.",
      requiredPermission: { module: "complaints", action: "view" },
    },
  ],
};

export default complaintsTour;
