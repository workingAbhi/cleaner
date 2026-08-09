export interface InspectionImageUpload {
  id: string;
  roNumber: string;
  itemId: string;
  imageUri: string;
  uploadedAt: string;
}

export interface InspectionImageUploadRequest {
  roNumber: string;
  itemId: string;
  imageUri: string;
}