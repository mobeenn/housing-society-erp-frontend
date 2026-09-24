const plotMergeTour = {
  moduleKey: "plot-merge",
  tourTitle: "Plot Merge Tour",
  moduleSummary:
    "Plot Merge is a permanent lifecycle action for combining plots into one resulting unit. Staff select eligible plots, record adjustments, and complete the fixed confirmation. The workflow is complete when Merge History shows Completed, the source plots are Merged, the resulting plot is retained, and the invoice is available.",
  steps: [
    {
      id: "plot-merge-page",
      target: "[data-tour='plot-merge-page']",
      title: "Plot Merge workspace",
      purpose: "This page is the controlled place to prepare a plot merge and review earlier merges.",
      completionCriteria: "The Plot Merge workspace is visible.",
      requiredPermission: { module: "plot-merge", action: "view" },
    },
    {
      id: "plot-merge-warning",
      target: "[data-tour='plot-merge-warning']",
      title: "Read the permanent-action warning",
      purpose: "Read the warning before changing any plot because a merge cannot be undone.",
      completionCriteria: "The irreversible-action warning is readable.",
      requiredPermission: { module: "plot-merge", action: "view" },
    },
    {
      id: "plot-merge-plot-selection",
      target: "[data-tour='plot-merge-plot-selection']",
      title: "Select the plots",
      purpose: "Choose at least two eligible plots and check that the list matches the intended unit records.",
      completionCriteria: "The plot selection list is visible and the selected plots are readable in the workspace.",
      requiredPermission: { module: "plot-merge", action: "view" },
    },
    {
      id: "plot-merge-result",
      target: "[data-tour='plot-merge-result']",
      title: "Choose the resulting plot",
      purpose: "Select the plot that will be retained as the resulting unit after the merge.",
      completionCriteria: "The resulting-plot choice is visible and can be confirmed.",
      requiredPermission: { module: "plot-merge", action: "view" },
    },
    {
      id: "plot-merge-review",
      target: "[data-tour='plot-merge-review']",
      title: "Review before confirming",
      purpose: "Only Society Admin users with Plot Merge create permission can use Review irreversible merge. Check the selection and adjustments before opening the final confirmation.",
      completionCriteria: "The irreversible merge confirmation opens with the selected plots, resulting plot, and required fixed confirmation phrase.",
      requiredPermission: { module: "plot-merge", action: "create" },
    },
    {
      id: "plot-merge-history",
      target: "[data-tour='plot-merge-history']",
      title: "Check merge history",
      purpose: "Use Merge History to confirm the resulting plot, source plots, status, and invoice record.",
      completionCriteria: "The merge history table is visible with its status and invoice information.",
      requiredPermission: { module: "plot-merge", action: "view" },
    },
  ],
};

export default plotMergeTour;
