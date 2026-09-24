const buybackTour = {
  moduleKey: "buyback",
  tourTitle: "Buyback / Cancel Tour",
  moduleSummary:
    "Buyback and Cancel are permanent booking lifecycle actions. Staff choose the active booking, record the settlement, and complete the fixed confirmation. The workflow is complete when Action History shows the final result, the booking is archived, the plot has the correct Available or Cancelled status, and the invoice is available.",
  steps: [
    {
      id: "buyback-page",
      target: "[data-tour='buyback-page']",
      title: "Buyback / Cancel workspace",
      purpose: "Use this controlled page to prepare a booking buyback or cancellation and review prior actions.",
      completionCriteria: "The Buyback / Cancel workspace is visible.",
      requiredPermission: { module: "buyback", action: "view" },
    },
    {
      id: "buyback-warning",
      target: "[data-tour='buyback-warning']",
      title: "Read the permanent-action warning",
      purpose: "Read this warning because the booking will be archived and the plot status will change permanently.",
      completionCriteria: "The irreversible buyback and cancellation warning is readable.",
      requiredPermission: { module: "buyback", action: "view" },
    },
    {
      id: "buyback-booking",
      target: "[data-tour='buyback-booking']",
      title: "Choose the active booking",
      purpose: "Select the booking that should be returned or cancelled, then check the plot and booking number.",
      completionCriteria: "The active booking selection and its details are visible.",
      requiredPermission: { module: "buyback", action: "view" },
    },
    {
      id: "buyback-action",
      target: "[data-tour='buyback-action']",
      title: "Choose the lifecycle action",
      purpose: "Select BuyBack or Cancel and enter the payment, deduction, settlement, and remarks that apply.",
      completionCriteria: "The action choice and settlement fields are visible and ready to review.",
      requiredPermission: { module: "buyback", action: "view" },
    },
    {
      id: "buyback-review",
      target: "[data-tour='buyback-review']",
      title: "Review the irreversible action",
      purpose: "Only Society Admin users with Buyback create permission can use Review irreversible action. Check the booking and settlement before opening the final confirmation.",
      completionCriteria: "The final confirmation opens with the selected booking, settlement, and the required fixed confirmation phrase.",
      requiredPermission: { module: "buyback", action: "create" },
    },
    {
      id: "buyback-history",
      target: "[data-tour='buyback-history']",
      title: "Check action history",
      purpose: "Use Action History to verify the date, plot, booking, settlement, status, and invoice record.",
      completionCriteria: "The action history table is visible with its status and invoice information.",
      requiredPermission: { module: "buyback", action: "view" },
    },
  ],
};

export default buybackTour;
