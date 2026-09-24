const dealersTour = {
  moduleKey: "dealers",
  tourTitle: "Dealer & Commission Documents Tour",
  moduleSummary:
    "Dealer and commission information is visible in the invoice registry in this build; there is no separate dealer maintenance page here. Staff can find a VendorCommission invoice, confirm the dealer or vendor reference, and open the generated document. The workflow is complete when the commission record is found in the registry and its PDF can be opened.",
  steps: [
    {
      id: "dealers-invoice-workspace",
      target: "[data-tour='invoices-page-intro']",
      title: "Open dealer documents",
      purpose: "Use the Invoice document registry to review dealer or vendor records that have already been generated.",
      completionCriteria: "The invoice registry heading and filters are visible.",
      requiredPermission: { module: "dealers", action: "view" },
    },
    {
      id: "dealers-type",
      target: "[data-tour='dealers-type-filter']",
      title: "Filter commission invoices",
      purpose: "Choose VendorCommission in the Type filter when you are looking specifically for a dealer commission document.",
      completionCriteria: "VendorCommission is selected and the invoice list refreshes to matching rows.",
      requiredPermission: { module: "dealers", action: "view" },
    },
    {
      id: "dealers-reference",
      target: "[data-tour='dealers-reference-filter']",
      title: "Find the dealer reference",
      purpose: "Enter the dealer or vendor ID when you know it. This narrows the registry to documents linked to that business.",
      completionCriteria: "The dealer or vendor reference is entered and matching invoice rows are shown.",
      requiredPermission: { module: "dealers", action: "view" },
    },
    {
      id: "dealers-row",
      target: "[data-tour='invoices-table']",
      title: "Check the commission row",
      purpose: "Read the invoice number, VendorCommission type, dealer or vendor name, amount, date, and status before opening the file.",
      completionCriteria: "The required commission row is visible with a readable dealer, amount, date, and status.",
      requiredPermission: { module: "dealers", action: "view" },
    },
    {
      id: "dealers-open",
      target: "button[title='View or reprint original document']",
      title: "Open the commission document",
      purpose: "Use View/Reprint to open the original generated commission document. Cancelling an invoice is a separate permissioned action and is not part of this dealer review.",
      completionCriteria: "The original commission document opens in a new browser tab or PDF viewer.",
      requiredPermission: { module: "dealers", action: "view" },
    },
  ],
};

export default dealersTour;
