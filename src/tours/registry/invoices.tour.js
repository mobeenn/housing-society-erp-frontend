const invoicesTour = {
  moduleKey: "invoices",
  tourTitle: "Invoices Tour",
  moduleSummary:
    "The invoice registry stores generated society documents so staff can find, open, reprint, or cancel them when needed. The work is complete when the right document can be found with the filters and its original file is opened from the list.",
  steps: [
    {
      id: "invoices-page-intro",
      target: "[data-tour='invoices-page-intro']",
      title: "Invoices workspace",
      purpose: "Start here to search the registry of generated booking, installment, transfer, and other society documents.",
      completionCriteria: "This step is done when the Invoices page is open and the registry heading and filter area are visible.",
      requiredPermission: { module: "invoices", action: "view" },
    },
    {
      id: "invoices-filters",
      target: "[data-tour='invoices-filters']",
      title: "Filter the registry",
      purpose: "Use the type, member, dealer, plot, date, and status fields to narrow the documents to the transaction you need.",
      completionCriteria: "This step is done when the filter values are visible and the invoice results refresh for the selected criteria.",
      requiredPermission: { module: "invoices", action: "view" },
    },
    {
      id: "invoices-clear-filters",
      target: "[data-tour='invoices-clear-filters']",
      title: "Clear the filters",
      purpose: "Use Clear filters when you want to return to the full invoice registry and start a different search.",
      completionCriteria: "This step is done when the filter fields return to their empty choices and the full list reloads.",
      requiredPermission: { module: "invoices", action: "view" },
    },
    {
      id: "invoices-table",
      target: "[data-tour='invoices-table']",
      title: "Review invoice rows",
      purpose: "Check the invoice number, type, member, dealer, plot, amount, date, and status shown for each document.",
      completionCriteria: "This step is done when a matching invoice row is visible with a readable number, amount, date, and status.",
      requiredPermission: { module: "invoices", action: "view" },
    },
    {
      id: "invoices-open-document",
      target: "[data-tour='invoices-open-document']",
      title: "Open the original invoice",
      purpose: "Use View/Reprint to open the source PDF for an invoice or other registered society document.",
      completionCriteria: "This step is done when the original document opens in a browser tab or PDF viewer.",
      requiredPermission: { module: "invoices", action: "view" },
    },
    {
      id: "invoices-cancel",
      target: "[data-tour='invoices-cancel']",
      title: "Cancel an active invoice",
      purpose: "This option is only for Society Admin users who have Invoice Delete permission. Use Cancel to mark an active invoice cancelled; the source file is not deleted.",
      completionCriteria: "This step is done when the cancel confirmation appears and, after confirmation, a success message appears with the row status changed to Cancelled.",
      requiredPermission: { module: "invoices", action: "delete" },
    },
  ],
};

export default invoicesTour;
