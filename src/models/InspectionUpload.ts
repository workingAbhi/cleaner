export type InspectionImageAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED';

export interface InspectionImageEditingHistory {
  action: InspectionImageAction;

  userId?: string;
  userName?: string;

  timestamp: string;

  previousLink?: string;
  newLink?: string;
}

export interface InspectionImageUpload {
  id: string;

  /**
   * Images belong to the RO, not the individual user.
   */
  roId: string;

  /**
   * Inspection task/item this image belongs to.
   */
  inspectionItem: string;

  /**
   * Mock backend-generated image URL.
   *
   * Example:
   * https://mock-image.com/image-1.png
   */
  link: string;

  /**
   * Local camera URI.
   *
   * Used only while we don't have real image storage.
   */
  imageUri: string;

  createdAt: string;
  updatedAt: string;

  createdBy?: string;
  updatedBy?: string;

  deletedAt?: string;

  editingHistory: InspectionImageEditingHistory[];
}

export interface InspectionImageUploadRequest {
  roId: string;

  inspectionItem: string;

  imageUri: string;

  userId?: string;
  userName?: string;
}

export interface InspectionImageUpdateRequest {
  roId: string;

  imageId: string;

  imageUri: string;

  userId?: string;
  userName?: string;
}

export interface InspectionImageDeleteRequest {
  roId: string;

  imageId: string;

  userId?: string;
  userName?: string;
}