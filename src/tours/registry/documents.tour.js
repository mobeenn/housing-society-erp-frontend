const documentsTour = {
  moduleKey: "documents",
  tourTitle: "Documents Tour",
  moduleSummary:
    "Documents are managed inside the related member, plot, booking, or transfer record rather than on a separate documents page. Staff can upload a supporting file, add its type and reference details, and review or verify the saved version. The work is complete when the upload success message appears and the new document is visible in the related record's document list.",
  steps: [
    {
      id: "documents-entry",
      target: "[data-tour='members-page-intro']",
      title: "Open a related record",
      purpose: "Start from a member, plot, booking, or transfer record because documents are always attached to the record they belong to.",
      completionCriteria: "The related record page and its Documents section are open.",
      requiredPermission: { module: "documents", action: "view" },
    },
    {
      id: "documents-open-record",
      target: "[data-tour='members-row-actions']",
      title: "Open the record's Documents section",
      purpose: "Use the member's View action to open the full record. The document upload and saved-document controls are inside that record.",
      completionCriteria: "The selected member's full record opens with a Documents section.",
      requiredPermission: { module: "documents", action: "view" },
    },
    {
      id: "documents-uploader",
      target: "[data-tour='documents-uploader']",
      title: "Fill document details",
      purpose: "Choose the document type and enter its number and dates when those details are available. Check the related record before uploading.",
      completionCriteria: "The document type, reference, and date fields show the intended values.",
      requiredPermission: { module: "documents", action: "create" },
    },
    {
      id: "documents-file",
      target: "[data-tour='documents-file']",
      title: "Choose the file",
      purpose: "Select the correct PDF, image, or Word file from the device. The accepted file types and size are shown below the upload form.",
      completionCriteria: "The selected file name is visible next to the file control.",
      requiredPermission: { module: "documents", action: "create" },
    },
    {
      id: "documents-upload",
      target: "[data-tour='documents-upload']",
      title: "Upload the document",
      purpose: "Use Upload document after checking the file and details. The system saves a new document version under the current record.",
      completionCriteria: "A Document uploaded success message appears and the document list refreshes.",
      requiredPermission: { module: "documents", action: "create" },
    },
    {
      id: "documents-review",
      target: "[data-tour='documents-list']",
      title: "Review the saved version",
      purpose: "Check the document type, file name, version, and verification status. Use the download icon when the original file is needed.",
      completionCriteria: "The saved document is visible with its file name, version, and current status.",
      requiredPermission: { module: "documents", action: "view" },
    },
    {
      id: "documents-verify",
      target: "[data-tour='documents-verify']",
      title: "Verify a pending document",
      purpose: "Only users assigned the document Approve permission can verify or reject a pending file. Use these controls after checking the original document.",
      completionCriteria: "The document status changes to Verified or Rejected and the refreshed list shows the new badge.",
      requiredPermission: { module: "documents", action: "approve" },
    },
  ],
};

export default documentsTour;
