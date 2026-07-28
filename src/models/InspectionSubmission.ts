export interface InspectionSubmissionItem {
  itemId: string;

  imageUri?: string;
}

export interface InspectionSubmission {
  roNumber: string;

  submittedAt: string;

  items: InspectionSubmissionItem[];
}