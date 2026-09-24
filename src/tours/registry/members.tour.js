const membersTour = {
  moduleKey: "members",
  tourTitle: "Members Tour",
  moduleSummary:
    "Members page lets office staff keep member identity, contact, and status details up to date. The workflow is complete when a member has a saved record, appears in the member list with the correct status, and their profile can be opened when more details are needed.",
  steps: [
    {
      id: "members-page-intro",
      target: "[data-tour='members-page-intro']",
      title: "Members workspace",
      purpose: "This page is the central list of people connected to the society. Use it to search, review status, and open a member record.",
      completionCriteria: null,
      requiredPermission: { module: "members", action: "view" },
    },
    {
      id: "members-add",
      target: "[data-tour='members-add']",
      title: "Add a member",
      purpose: "Use Add Member when a new person needs a society record. Save the basic identity and contact details after checking them once.",
      completionCriteria: "This step is done when a success message appears and the new member is visible in the list.",
      requiredPermission: { module: "members", action: "create" },
    },
    {
      id: "members-status-filter",
      target: "[data-tour='members-status-filter']",
      title: "Filter by status",
      purpose: "Use these buttons to show only active, inactive, or blacklisted members. This helps you find the right person without reading the whole list.",
      completionCriteria: "This step is done when the selected status tab is highlighted and the list shows only that status.",
      requiredPermission: { module: "members", action: "view" },
    },
    {
      id: "members-table",
      target: "[data-tour='members-table']",
      title: "Member list",
      purpose: "The list shows each member's ID, contact details, status, and registration date. Click a row to open the full member profile.",
      completionCriteria: "This step is done when the member you need is visible with a readable status badge.",
      requiredPermission: { module: "members", action: "view" },
    },
    {
      id: "members-row-actions",
      target: "[data-tour='members-row-actions']",
      title: "Open or update a record",
      purpose: "Use the row actions to open the member profile, edit details, or mark a record inactive. Editing is limited to users who have member edit access.",
      completionCriteria: "This step is done when the profile opens, an edit save shows success, or the inactive confirmation appears.",
      requiredPermission: { module: "members", action: "edit" },
    },
  ],
};

export default membersTour;
