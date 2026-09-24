const expensesTour = {
  moduleKey: "expenses",
  tourTitle: "Expenses Tour",
  moduleSummary:
    "Expenses are submitted, approved, and settled from this page. The work is complete when a cost has its category, vendor, amount, and date, then can be followed through approval or payment status.",
  steps: [
    {
      id: "expenses-page-intro",
      target: "[data-tour='expenses-page-intro']",
      title: "Expenses workspace",
      purpose: "Use this list to review society costs, their vendors, amounts, and current approval or paid status.",
      completionCriteria: "This step is done when the Expenses page is open and the expense list or its empty-state message is visible.",
      requiredPermission: { module: "expenses", action: "view" },
    },
    {
      id: "expenses-add",
      target: "[data-tour='expenses-add']",
      title: "Add an expense",
      purpose: "Use Add expense to submit a cost for approval with its category, vendor, amount, and date.",
      completionCriteria: "The expense form opens with category, vendor, amount, and date fields; after saving, a Pending expense row appears.",
      requiredPermission: { module: "expenses", action: "create" },
    },
    {
      id: "expenses-heading",
      target: "[data-tour='expenses-heading']",
      title: "Review expense records",
      purpose: "Use the expense list heading as the starting point for checking vendors, amounts, dates, and current status values.",
      completionCriteria: "This step is done when the Expenses heading and the list below it are visible with readable rows or an empty-state message.",
      requiredPermission: { module: "expenses", action: "view" },
    },
    {
      id: "expenses-row-actions",
      target: "[data-tour='expenses-row-actions']",
      title: "Approve or pay an expense",
      purpose: "Only users assigned Expense Approve permission can approve, reject, or mark an expense paid. Use the row action for the pending or approved cost.",
      completionCriteria: "After approval, rejection, or payment, a success message appears and the row status changes accordingly.",
      requiredPermission: { module: "expenses", action: "approve" },
    },
  ],
};

export default expensesTour;
