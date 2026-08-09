import {
  InspectionImageUpload,
  InspectionImageUploadRequest,
  InspectionImageUpdateRequest,
  InspectionImageDeleteRequest,
} from '../../../models/InspectionUpload';

import {
  addInspectionUpload,
  getInspectionUploads,
  findInspectionUpload,
  updateInspectionUpload,
  deleteInspectionUpload,
} from '../../../data/inspection/uploads.mock';

import ImageUrlGeneratorApi from './imageUrlGeneratorApi';

import { AppConfig } from '../../config/appConfig';

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
    const imageUrl =
      await ImageUrlGeneratorApi.generateUrl(
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
     * because it reads AsyncStorage.
     */
    const existingImages =
      await getInspectionUploads(
        request.roId,
      );

    const existing =
      existingImages.find(
        item =>
          item.inspectionItem ===
          request.inspectionItem,
      );

    /**
     * If the inspection item already
     * has an image, use the update path.
     */
    if (existing) {
      return this.updateImage({
        roId:
          request.roId,

        imageId:
          existing.id,

        imageUri:
          request.imageUri,

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

      /**
       * This is the mock backend URL.
       */
      link:
        imageUrl,

      /**
       * Keep the local camera URI for
       * the current mocked implementation.
       */
      imageUri:
        request.imageUri,

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
            imageUrl,
        },
      ],
    };

    /**
     * --------------------------------------------------
     * CRITICAL
     * --------------------------------------------------
     *
     * Persist immediately.
     *
     * This writes the record into the
     * AsyncStorage-backed mock database
     * for this RO.
     */
    await addInspectionUpload(
      upload,
    );

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
      await getInspectionUploads(
        roId,
      );

    return images;
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
      await findInspectionUpload(
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

    /**
     * Generate a new mock backend URL.
     */
    const imageUrl =
      await ImageUrlGeneratorApi.generateUrl(
        request.imageUri,
      );

    const now =
      new Date().toISOString();

    const updated:
      InspectionImageUpload = {

      ...existing,

      link:
        imageUrl,

      imageUri:
        request.imageUri,

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
            imageUrl,
        },
      ],
    };

    /**
     * Persist the update immediately.
     */
    const success =
      await updateInspectionUpload(
        existing.id,
        updated,
      );

    if (!success) {
      throw new Error(
        'Unable to update inspection image.',
      );
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
      await findInspectionUpload(
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
      await deleteInspectionUpload(
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