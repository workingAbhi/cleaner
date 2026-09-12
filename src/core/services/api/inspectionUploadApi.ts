import {
  InspectionImageUpload,
  InspectionImageUploadRequest,
  InspectionImageUpdateRequest,
  InspectionImageDeleteRequest,
} from '../../../models/InspectionUpload';

import {
  addInspectionUpload as addMockUpload,
  getInspectionUploads as getMockUploads,
  getAllInspectionUploads as getAllMockUploads,
  findInspectionUpload as findMockUpload,
  updateInspectionUpload as updateMockUpload,
  deleteInspectionUpload as deleteMockUpload,
} from '../../../data/inspection/uploads.mock';

import {
  addInspectionUpload as addSupabaseUpload,
  getInspectionUploads as getSupabaseUploads,
  getAllInspectionUploads as getAllSupabaseUploads,
  findInspectionUpload as findSupabaseUpload,
  updateInspectionUpload as updateSupabaseUpload,
  deleteInspectionUpload as deleteSupabaseUpload,
  uploadInspectionFile,
  requestImageAnalysis,
} from '../../../data/inspection/uploads.supabase';

import ImageUrlGeneratorApi from './imageUrlGeneratorApi';

import {
  AppConfig,
  isSupabaseConfigured,
} from '../../config/appConfig';

/**
 * --------------------------------------------------
 * IMAGE EDIT WINDOW
 * --------------------------------------------------
 *
 * Default edit window = 2 hours.
 *
 * This can be overridden through AppConfig.
 */
const DEFAULT_EDIT_WINDOW_HOURS = 2;

const getEditWindowHours = () => {
  const configuredValue = Number(
    AppConfig.imageEditWindowHours,
  );

  if (
    Number.isFinite(
      configuredValue,
    ) &&
    configuredValue > 0
  ) {
    return configuredValue;
  }

  return DEFAULT_EDIT_WINDOW_HOURS;
};

const getEditWindowMs = () => {
  return (
    getEditWindowHours() *
    60 *
    60 *
    1000
  );
};

const persist = () =>
  isSupabaseConfigured()
    ? {
        add: addSupabaseUpload,
        get: getSupabaseUploads,
        getAll: getAllSupabaseUploads,
        find: findSupabaseUpload,
        update: updateSupabaseUpload,
        remove: deleteSupabaseUpload,
      }
    : {
        add: addMockUpload,
        get: getMockUploads,
        getAll: getAllMockUploads,
        find: findMockUpload,
        update: updateMockUpload,
        remove: deleteMockUpload,
      };

const createImageUrl = async (
  roId: string,
  inspectionItem: string,
  imageUri: string,
): Promise<{ link: string; storagePath?: string }> => {
  if (isSupabaseConfigured()) {
    const uploaded = await uploadInspectionFile(
      roId,
      inspectionItem,
      imageUri,
    );

    return {
      link: uploaded.publicUrl,
      storagePath: uploaded.storagePath,
    };
  }

  const link = await ImageUrlGeneratorApi.generateUrl(
    imageUri,
  );

  return { link };
};

const isWithinEditWindow = (
  upload: InspectionImageUpload,
) => {
  const createdAt =
    new Date(
      upload.createdAt,
    ).getTime();

  const now =
    Date.now();

  return (
    now - createdAt <=
    getEditWindowMs()
  );
};

class InspectionUploadApi {

  /**
   * --------------------------------------------------
   * UPLOAD IMAGE
   * --------------------------------------------------
   *
   * UI
   * ↓
   * Upload API
   * ↓
   * Image URL Generator
   * ↓
   * Mock URL
   * ↓
   * Persist in AsyncStorage
   *
   * IMPORTANT:
   *
   * Every upload is persisted immediately.
   *
   * Persistence is based on RO ID + inspection item.
   */
  async uploadImage(
    request: InspectionImageUploadRequest,
  ): Promise<InspectionImageUpload> {

    /**
     * Generate the mock backend image URL.
     *
     * Example:
     *
     * https://image1.png
     */
    const storedImage =
      await createImageUrl(
        request.roId,
        request.inspectionItem,
        request.imageUri,
      );

    const now =
      new Date().toISOString();

    /**
     * Check whether this RO already
     * has an image for this inspection item.
     *
     * IMPORTANT:
     *
     * getInspectionUploads() is async
     * because it reads AsyncStorage or Supabase.
     */
    const existingImages =
      await persist().get(
        request.roId,
      );

    const existing =
      existingImages.find(
        item =>
          item.inspectionItem ===
          request.inspectionItem,
      );

    /**
     * If the inspection item already has an active image:
     * - If within edit window, update the existing record.
     * - If the edit window has expired (e.g. a previous day's or old inspection),
     *   create a fresh new upload record for this inspection.
     */
    if (existing && isWithinEditWindow(existing)) {
      return this.updateImage({
        roId:
          request.roId,

        imageId:
          existing.id,

        imageUri:
          request.imageUri,

        storagePath:
          storedImage.storagePath,

        userId:
          request.userId,

        userName:
          request.userName,
      });
    }

    /**
     * Create a new image record.
     */
    const upload:
      InspectionImageUpload = {

      id:
        `${request.roId}-${request.inspectionItem}`,

      roId:
        request.roId,

      inspectionItem:
        request.inspectionItem,

      kind:
        'inspection',

      link:
        storedImage.link,

      imageUri:
        isSupabaseConfigured()
          ? storedImage.link
          : request.imageUri,

      storagePath:
        storedImage.storagePath,

      createdAt:
        now,

      updatedAt:
        now,

      createdBy:
        request.userId,

      updatedBy:
        request.userId,

      editingHistory: [
        {
          action:
            'CREATED',

          userId:
            request.userId,

          userName:
            request.userName,

          timestamp:
            now,

          newLink:
            storedImage.link,
        },
      ],
    };

    await persist().add(
      upload,
    );

    if (isSupabaseConfigured()) {
      requestImageAnalysis(upload);
    }

    return upload;
  }

  /**
   * --------------------------------------------------
   * GET IMAGES BY RO ID
   * --------------------------------------------------
   *
   * User Home
   * ↓
   * Current logged-in user's RO ID
   * ↓
   * GET API
   * ↓
   * Mock database
   * ↓
   * Images belonging to that RO
   */
  async getImagesByRoId(
    roId: string,
  ): Promise<InspectionImageUpload[]> {

    await new Promise<void>(
      resolve =>
        setTimeout(
          resolve,
          200,
        ),
    );

    /**
     * IMPORTANT:
     *
     * Await the AsyncStorage-backed
     * mock database.
     */
    const images =
      await persist().get(
        roId,
      );

    return images;
  }

  async getAllImages(): Promise<InspectionImageUpload[]> {
    return persist().getAll();
  }

  /**
   * --------------------------------------------------
   * UPDATE IMAGE
   * --------------------------------------------------
   *
   * Updates the image belonging to:
   *
   * RO ID + inspection item
   */
  async updateImage(
    request: InspectionImageUpdateRequest,
  ): Promise<InspectionImageUpload> {

    /**
     * findInspectionUpload is async
     * because it searches AsyncStorage.
     */
    const existing =
      await persist().find(
        request.imageId,
      );

    if (!existing) {
      throw new Error(
        'Inspection image not found.',
      );
    }

    /**
     * Security / ownership check.
     */
    if (
      existing.roId !==
      request.roId
    ) {
      throw new Error(
        'You cannot modify this image.',
      );
    }

    /**
     * Check the edit window.
     */
    if (
      !isWithinEditWindow(
        existing,
      )
    ) {
      throw new Error(
        'The image editing window has expired.',
      );
    }

    const storedImage =
      request.storagePath
        ? {
            link:
              `${AppConfig.supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/inspection-images/${request.storagePath}`,
            storagePath:
              request.storagePath,
          }
        : await createImageUrl(
            request.roId,
            existing.inspectionItem,
            request.imageUri,
          );

    const now =
      new Date().toISOString();

    const updated:
      InspectionImageUpload = {

      ...existing,

      link:
        storedImage.link,

      imageUri:
        isSupabaseConfigured()
          ? storedImage.link
          : request.imageUri,

      storagePath:
        storedImage.storagePath,

      updatedAt:
        now,

      updatedBy:
        request.userId,

      editingHistory: [
        ...existing.editingHistory,

        {
          action:
            'UPDATED',

          userId:
            request.userId,

          userName:
            request.userName,

          timestamp:
            now,

          previousLink:
            existing.link,

          newLink:
            storedImage.link,
        },
      ],
    };

    const success =
      await persist().update(
        existing.id,
        updated,
      );

    if (!success) {
      throw new Error(
        'Unable to update inspection image.',
      );
    }

    if (isSupabaseConfigured()) {
      requestImageAnalysis(updated);
    }

    return updated;
  }

  /**
   * --------------------------------------------------
   * DELETE IMAGE
   * --------------------------------------------------
   *
   * Soft delete.
   *
   * The record remains in AsyncStorage so
   * editingHistory is preserved.
   */
  async deleteImage(
    request: InspectionImageDeleteRequest,
  ): Promise<void> {

    /**
     * findInspectionUpload is async.
     */
    const existing =
      await persist().find(
        request.imageId,
      );

    if (!existing) {
      throw new Error(
        'Inspection image not found.',
      );
    }

    /**
     * Ownership check.
     */
    if (
      existing.roId !==
      request.roId
    ) {
      throw new Error(
        'You cannot delete this image.',
      );
    }

    /**
     * Check edit window.
     */
    if (
      !isWithinEditWindow(
        existing,
      )
    ) {
      throw new Error(
        'The image editing window has expired.',
      );
    }

    const now =
      new Date().toISOString();

    /**
     * Soft delete in persistent
     * AsyncStorage mock database.
     */
    const success =
      await persist().remove(
        existing.id,

        now,

        {
          action:
            'DELETED',

          userId:
            request.userId,

          userName:
            request.userName,

          timestamp:
            now,

          previousLink:
            existing.link,
        },
      );

    if (!success) {
      throw new Error(
        'Unable to delete inspection image.',
      );
    }
  }
}

export default new InspectionUploadApi();