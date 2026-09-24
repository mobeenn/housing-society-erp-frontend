const paymentsTour = {
  moduleKey: "payments",
  tourTitle: "Payments Tour",
  moduleSummary:
    "The payments area records receipts and shows how each amount is allocated to outstanding installments. The work is complete when a receipt is recorded for the right member, the allocation is visible, and the receipt can be printed when needed.",
  steps: [
    {
      id: "payments-page-intro",
      target: "[data-tour='payments-page-intro']",
      title: "Payments workspace",
      purpose: "Use this list to review receipt numbers, members, plots, amounts, methods, and payment status.",
      completionCriteria: "This step is done when the Payments page is open and the payment list or its empty-state message is visible.",
      requiredPermission: { module: "payments", action: "view" },
    },
    {
      id: "payments-record",
      target: "[data-tour='payments-record']",
      title: "Record a payment",
      purpose: "Use Record payment to choose a member, optionally a plot, enter the amount and method, and check the allocation preview.",
      completionCriteria: "The payment form opens with member, amount, and method fields; after saving, a receipt number appears in the payment list.",
      requiredPermission: { module: "payments", action: "create" },
    },
    {
      id: "payments-receipt",
      target: "[data-tour='payments-receipt']",
      title: "Find the receipt",
      purpose: "Use the receipt number to identify the payment you need before opening its details or printing it.",
      completionCriteria: "This step is done when the receipt number is visible and the member, plot, amount, method, and status can be read beside it.",
      requiredPermission: { module: "payments", action: "view" },
    },
    {
      id: "payments-row-actions",
      target: "[data-tour='payments-row-actions']",
      title: "Open or print a receipt",
      purpose: "Use the row controls to open the payment record or print its receipt for the member.",
      completionCriteria: "This step is done when the view and print controls are visible beside a payment, and the receipt opens in a new tab when printed.",
      requiredPermission: { module: "payments", action: "view" },
    },
  ],
};

export default paymentsTour;
