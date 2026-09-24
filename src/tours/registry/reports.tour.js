const reportsTour = {
  moduleKey: "reports",
  tourTitle: "Reports Tour",
  moduleSummary:
    "The Reports Hub brings cross-module reports into one place. The workflow is complete when the chosen report and date range generate a visible row count and result table, with a PDF or Excel file downloaded when an export copy is needed.",
  steps: [
    {
      id: "reports-page",
      target: "[data-tour='reports-page']",
      title: "Reports Hub",
      purpose: "Use this page to choose an operational, finance, property, or people report.",
      completionCriteria: "The Reports Hub heading and description are visible.",
      requiredPermission: { module: "reports", action: "view" },
    },
    {
      id: "reports-catalog",
      target: "[data-tour='reports-catalog']",
      title: "Choose a report",
      purpose: "Select a report card or the report list to see what data the report covers.",
      completionCriteria: "The report catalog cards are visible with report names and descriptions.",
      requiredPermission: { module: "reports", action: "view" },
    },
    {
      id: "reports-filters",
      target: "[data-tour='reports-filters']",
      title: "Set the date range",
      purpose: "Choose the report, From date, and To date, then use Generate to load the rows.",
      completionCriteria: "The report, date, and Generate controls are visible and readable.",
      requiredPermission: { module: "reports", action: "view" },
    },
    {
      id: "reports-results",
      target: "[data-tour='reports-results']",
      title: "Read the report results",
      purpose: "Check the row count and read the returned columns before sharing or exporting the result.",
      completionCriteria: "The generated report table is visible with its row count and values.",
      requiredPermission: { module: "reports", action: "view" },
    },
    {
      id: "reports-export",
      target: "[data-tour='reports-export']",
      title: "Export the report",
      purpose: "Use PDF or Excel when you need a file copy of the current report.",
      completionCriteria: "The selected PDF or Excel download starts and the file is saved with the report name.",
      requiredPermission: { module: "reports", action: "export" },
    },
  ],
};

export default reportsTour;
