const dashboardsTour = {
  moduleKey: "dashboards",
  tourTitle: "Dashboards Tour",
  moduleSummary:
    "The role dashboard gives staff a live operational overview with key numbers, trends, distribution charts, and follow-up lists. The review is complete when the updated time is visible, the relevant totals and charts can be read, and any follow-up item opens the matching record.",
  steps: [
    {
      id: "dashboards-page",
      target: "[data-tour='dashboards-page']",
      title: "Role dashboard",
      purpose: "Start here to see the live overview for your role and confirm when the data was updated.",
      completionCriteria: "The dashboard shows its updated time, readable totals, and at least one follow-up item or empty-state message.",
      requiredPermission: { module: "dashboards", action: "view" },
    },
    {
      id: "dashboards-stats",
      target: "[data-tour='dashboards-stats']",
      title: "Read the key numbers",
      purpose: "Scan the summary cards for the counts and totals that matter most to your work today.",
      completionCriteria: "The relevant dashboard total is readable and can be traced to the related list or record.",
      requiredPermission: { module: "dashboards", action: "view" },
    },
    {
      id: "dashboards-charts",
      target: "[data-tour='dashboards-charts']",
      title: "Check trends and distribution",
      purpose: "Use the trend and distribution charts to see how the current situation is changing or split.",
      completionCriteria: "The chart labels, values, and period are readable for the trend or distribution being reviewed.",
      requiredPermission: { module: "dashboards", action: "view" },
    },
    {
      id: "dashboards-lists",
      target: "[data-tour='dashboards-lists']",
      title: "Follow up from the lists",
      purpose: "Read the linked records and low-stock or quick-link area, then open an item when follow-up is required.",
      completionCriteria: "The required follow-up row is visible and opens the matching record when follow-up is required.",
      requiredPermission: { module: "dashboards", action: "view" },
    },
  ],
};

export default dashboardsTour;
