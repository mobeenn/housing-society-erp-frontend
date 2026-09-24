const hrPayrollTour = {
  moduleKey: "hr-payroll",
  tourTitle: "HR Payroll Tour",
  moduleSummary:
    "HR Payroll covers salary structures, statutory setup, payroll runs, employee loans, approvals, pay status, and exports. The workflow is complete when the selected period has a reviewed and approved run, its final status is visible, and any linked loan reduction is reflected on the employee loan.",
  steps: [
    {
      id: "hr-payroll-page",
      target: "[data-tour='hr-payroll-page']",
      title: "Payroll workspace",
      purpose: "Start here to review payroll runs, employee totals, and the next payroll action.",
      completionCriteria: "The Payroll & Employee Finance heading and description are visible.",
      requiredPermission: { module: "hr-payroll", action: "view" },
    },
    {
      id: "hr-payroll-period",
      target: "[data-tour='hr-payroll-period']",
      title: "Choose the payroll period",
      purpose: "Select the month and year before generating or reviewing a payroll run.",
      completionCriteria: "The payroll month and year controls are visible and readable.",
      requiredPermission: { module: "hr-payroll", action: "view" },
    },
    {
      id: "hr-payroll-generate",
      target: "[data-tour='hr-payroll-generate']",
      title: "Generate a draft",
      purpose: "Use Generate Draft to calculate earnings, deductions, tax, and loan amounts for the selected period.",
      completionCriteria: "A draft payroll run appears with employee totals, and its status shows that it is waiting for review.",
      requiredPermission: { module: "hr-payroll", action: "create" },
    },
    {
      id: "hr-payroll-history",
      target: "[data-tour='hr-payroll-history']",
      title: "Select a payroll run",
      purpose: "Read the run history and choose the period that needs review or payment action.",
      completionCriteria: "The payroll history list is visible with run status and net pay information.",
      requiredPermission: { module: "hr-payroll", action: "view" },
    },
    {
      id: "hr-payroll-review",
      target: "[data-tour='hr-payroll-review']",
      title: "Review and approve",
      purpose: "Only users assigned Payroll Approve permission (normally Society Admin) can approve, post, or mark the run paid. Check employee entries and totals first.",
      completionCriteria: "After approval or payment, a success message appears and the run status and payment values update in the history list.",
      requiredPermission: { module: "hr-payroll", action: "approve" },
    },
  ],
};

export default hrPayrollTour;
