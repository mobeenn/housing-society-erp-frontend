const financeGlTour = {
  moduleKey: "finance-gl",
  tourTitle: "Finance & GL Review Tour",
  moduleSummary:
    "This build does not provide a separate general-ledger journal screen. Finance and GL-backed figures are reviewed through the Finance reports and the invoice documents produced by payments, expenses, payroll, and lifecycle actions. The review is complete when a finance report for the chosen dates has generated and its rows and totals can be checked against the related documents.",
  steps: [
    {
      id: "finance-gl-reports",
      target: "[data-tour='reports-page']",
      title: "Open Finance reports",
      purpose: "Use the Reports Hub as the visible finance-review area in this build. It brings collection, dues, income-versus-expense, and other finance figures into one place.",
      completionCriteria: "The Reports Hub heading and the finance report choices are visible.",
      requiredPermission: { module: "finance-gl", action: "view" },
    },
    {
      id: "finance-gl-catalog",
      target: "[data-tour='reports-catalog']",
      title: "Choose the finance figure",
      purpose: "Select the finance report that answers your question, such as collections, dues, or income versus expense.",
      completionCriteria: "The required finance report is selected and its card is highlighted.",
      requiredPermission: { module: "finance-gl", action: "view" },
    },
    {
      id: "finance-gl-dates",
      target: "[data-tour='reports-filters']",
      title: "Set the review period",
      purpose: "Choose the From and To dates, then use Generate so the figures cover the period you intend to review.",
      completionCriteria: "The selected dates are readable and the report refreshes for that period.",
      requiredPermission: { module: "finance-gl", action: "view" },
    },
    {
      id: "finance-gl-results",
      target: "[data-tour='reports-results']",
      title: "Check the generated figures",
      purpose: "Read the result rows and row count. Compare them with the relevant invoice, payment, expense, or payroll record before relying on the figure.",
      completionCriteria: "The results table is visible with a row count and the expected finance values.",
      requiredPermission: { module: "finance-gl", action: "view" },
    },
    {
      id: "finance-gl-export",
      target: "[data-tour='reports-export']",
      title: "Keep a finance copy",
      purpose: "Only users with Finance GL export permission can use PDF or Excel. Use the chosen format when a file copy of the current finance report is needed.",
      completionCriteria: "The chosen PDF or Excel download starts and the file is saved.",
      requiredPermission: { module: "finance-gl", action: "export" },
    },
  ],
};

export default financeGlTour;
