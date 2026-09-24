const auditTour = {
  moduleKey: "audit",
  tourTitle: "Audit Logs Tour",
  moduleSummary:
    "Audit logs show who changed a record and when. The work is complete when staff can narrow the log to the event they need and see the user, action, entity, and change details.",
  steps: [
    {
      id: "audit-page-intro",
      target: "[data-tour='audit-page-intro']",
      title: "Audit workspace",
      purpose: "Use this page to follow changes made by staff and see whether each recorded action succeeded.",
      completionCriteria: "This step is done when the Audit Logs page is open and the log list or its no-results message is visible.",
      requiredPermission: { module: "audit", action: "view" },
    },
    {
      id: "audit-filters",
      target: "[data-tour='audit-filters']",
      title: "Use the filters",
      purpose: "Choose the record type and action you want to investigate before checking the date range.",
      completionCriteria: "This step is done when the filter choices are visible and the log count refreshes for the selected choices.",
      requiredPermission: { module: "audit", action: "view" },
    },
    {
      id: "audit-search",
      target: "[data-tour='audit-search']",
      title: "Search the log",
      purpose: "Search by an entity ID, user name, email, or IP address to narrow the activity list.",
      completionCriteria: "This step is done when a search term is entered and matching entries, or a clear no-match result, is shown.",
      requiredPermission: { module: "audit", action: "view" },
    },
    {
      id: "audit-date-range",
      target: "[data-tour='audit-date-range']",
      title: "Set the date range",
      purpose: "Use the start and end dates to review activity from a particular day or reporting period.",
      completionCriteria: "This step is done when both date fields are readable and the displayed log results match the chosen range.",
      requiredPermission: { module: "audit", action: "view" },
    },
    {
      id: "audit-log-table",
      target: "[data-tour='audit-log-table']",
      title: "Read the activity",
      purpose: "Review the timestamp, user, action, entity, IP address, and result. Use the details control when change data is available.",
      completionCriteria: "This step is done when a log row shows a readable user, action, entity, and result, and its details can be opened when available.",
      requiredPermission: { module: "audit", action: "view" },
    },
  ],
};

export default auditTour;
