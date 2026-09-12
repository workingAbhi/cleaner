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
   * App checklist: washroom, basin, ...
   * Sample photos: ladies, gents, urinal, pq, bathroom.
   */
  inspectionItem: string;

  /**
   * Washroom facility for field photos.
   * Null for normal app checklist captures.
   */
  facility?: 'ladies' | 'gents' | 'urinal' | 'pq' | 'bathroom';

  /**
   * inspection = captured in the app (User Home)
   * sample = Provided_RO_Pics (AI eval only)
   */
  kind?: 'inspection' | 'sample';

  /**
   * Backend image URL.
   *
   * Mock: https://image1.png
   * Supabase: public storage URL
   */
  link: string;

  /**
   * Local camera URI while using AsyncStorage mocks.
   * With Supabase this is usually the same as link.
   */
  imageUri: string;

  /**
   * Supabase Storage object path.
   * Empty while using the mock store.
   */
  storagePath?: string;

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

  storagePath?: string;

  userId?: string;
  userName?: string;
}

export interface InspectionImageDeleteRequest {
  roId: string;

  imageId: string;

  userId?: string;
  userName?: string;
}