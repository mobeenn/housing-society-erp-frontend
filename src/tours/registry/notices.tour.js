const noticesTour = {
  moduleKey: "notices",
  tourTitle: "Notices Tour",
  moduleSummary:
    "The Notice Board keeps society announcements visible to the right audience. The workflow is complete when the notice has its message, audience, and dates, then appears on the board with Published or Draft status and the correct expiry information.",
  steps: [
    {
      id: "notices-page",
      target: "[data-tour='notices-page']",
      title: "Notice Board workspace",
      purpose: "Use this page to read current society announcements and see how many are published.",
      completionCriteria: "The Notice Board heading and announcement description are visible.",
      requiredPermission: { module: "notices", action: "view" },
    },
    {
      id: "notices-new",
      target: "[data-tour='notices-new']",
      title: "Start a new notice",
      purpose: "Choose New Notice when you need to share an announcement with all users, a role, or selected members.",
      completionCriteria: "The notice form opens with message, audience, and dates; after publishing, the notice appears in the board with its status.",
      requiredPermission: { module: "notices", action: "create" },
    },
    {
      id: "notices-refresh",
      target: "[data-tour='notices-refresh']",
      title: "Refresh published notices",
      purpose: "Use Refresh when you need the latest notice list and publication count.",
      completionCriteria: "The board reloads and its published count and notice cards match the latest saved notices.",
      requiredPermission: { module: "notices", action: "view" },
    },
    {
      id: "notices-list",
      target: "[data-tour='notices-list']",
      title: "Read published announcements",
      purpose: "Read each notice's message, publication date, expiry date, audience, and status.",
      completionCriteria: "The notice cards are visible with message and audience information.",
      requiredPermission: { module: "notices", action: "view" },
    },
  ],
};

export default noticesTour;
