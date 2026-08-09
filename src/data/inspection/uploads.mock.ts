import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  InspectionImageEditingHistory,
  InspectionImageUpload,
} from '../../models/InspectionUpload';

/**
 * --------------------------------------------------
 * MOCK INSPECTION IMAGE DATABASE
 * --------------------------------------------------
 *
 * This is the temporary database for inspection
 * images until a real backend/database exists.
 *
 * Ownership is ALWAYS by RO ID.
 *
 * Example:
 *
 * RO1001
 *   ├── washroom
 *   ├── reception
 *   └── parking
 *
 * The logged-in user's ID is NOT used as the
 * ownership relationship.
 *
 * AsyncStorage makes this mock database survive:
 *
 * - navigation
 * - logout
 * - login
 * - app refresh
 * - app restart
 */

/**
 * Index containing all RO IDs that have
 * inspection image records.
 */
const RO_INDEX_KEY =
  'CLEANER_INSPECTION_RO_IDS';

/**
 * Each RO gets its own storage record.
 *
 * Example:
 *
 * CLEANER_INSPECTION_IMAGES_RO1001
 * CLEANER_INSPECTION_IMAGES_RO1002
 */
const getStorageKey = (
  roId: string,
) =>
  `CLEANER_INSPECTION_IMAGES_${roId}`;

/**
 * --------------------------------------------------
 * READ KNOWN RO IDS
 * --------------------------------------------------
 */
const getStoredRoIds =
  async (): Promise<string[]> => {

    const stored =
      await AsyncStorage.getItem(
        RO_INDEX_KEY,
      );

    if (!stored) {
      return [];
    }

    try {

      const parsed =
        JSON.parse(stored);

      return Array.isArray(parsed)
        ? parsed
        : [];

    } catch {

      return [];

    }
  };

/**
 * --------------------------------------------------
 * REGISTER RO
 * --------------------------------------------------
 *
 * Makes sure the RO is registered in the
 * mock database index.
 */
const registerRoId =
  async (
    roId: string,
  ): Promise<void> => {

    const roIds =
      await getStoredRoIds();

    if (
      roIds.includes(roId)
    ) {
      return;
    }

    roIds.push(
      roId,
    );

    await AsyncStorage.setItem(
      RO_INDEX_KEY,
      JSON.stringify(roIds),
    );
  };

/**
 * --------------------------------------------------
 * READ IMAGES FOR RO
 * --------------------------------------------------
 */
const readRoImages =
  async (
    roId: string,
  ): Promise<InspectionImageUpload[]> => {

    const stored =
      await AsyncStorage.getItem(
        getStorageKey(roId),
      );

    if (!stored) {
      return [];
    }

    try {

      const parsed =
        JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed as InspectionImageUpload[];

    } catch {

      return [];

    }
  };

/**
 * --------------------------------------------------
 * WRITE IMAGES FOR RO
 * --------------------------------------------------
 *
 * This is effectively our temporary
 * "save to RO database" operation.
 */
const writeRoImages =
  async (
    roId: string,
    images: InspectionImageUpload[],
  ): Promise<void> => {

    await AsyncStorage.setItem(
      getStorageKey(roId),
      JSON.stringify(images),
    );

    await registerRoId(
      roId,
    );
  };

/**
 * --------------------------------------------------
 * ADD / SAVE IMAGE
 * --------------------------------------------------
 *
 * Called by the Upload API after the mock
 * image URL has been generated.
 *
 * Important:
 *
 * Every inspection item is persisted
 * immediately.
 *
 * Example:
 *
 * RO1001 + washroom
 * RO1001 + reception
 * RO1001 + parking
 *
 * Each item gets its own record.
 *
 * If the same inspection item is uploaded
 * again, the existing active record is
 * replaced.
 */
export const addInspectionUpload =
  async (
    upload: InspectionImageUpload,
  ): Promise<void> => {

    const images =
      await readRoImages(
        upload.roId,
      );

    const existingIndex =
      images.findIndex(
        item =>
          item.roId ===
            upload.roId &&
          item.inspectionItem ===
            upload.inspectionItem &&
          !item.deletedAt,
      );

    if (
      existingIndex >= 0
    ) {

      images[
        existingIndex
      ] = upload;

    } else {

      images.push(
        upload,
      );

    }

    /**
     * IMPORTANT:
     *
     * Await the actual persistent write.
     */
    await writeRoImages(
      upload.roId,
      images,
    );
  };

/**
 * --------------------------------------------------
 * FIND IMAGE BY ID
 * --------------------------------------------------
 *
 * Searches all known RO records.
 *
 * This is only needed for update/delete.
 */
export const findInspectionUpload =
  async (
    id: string,
  ): Promise<
    InspectionImageUpload |
    undefined
  > => {

    const roIds =
      await getStoredRoIds();

    for (
      const roId of roIds
    ) {

      const images =
        await readRoImages(
          roId,
        );

      const found =
        images.find(
          item =>
            item.id === id,
        );

      if (found) {
        return found;
      }
    }

    return undefined;
  };

/**
 * --------------------------------------------------
 * GET IMAGES BY RO ID
 * --------------------------------------------------
 *
 * THIS IS THE MAIN GET OPERATION.
 *
 * User ID is deliberately NOT involved.
 *
 * User Home:
 *
 * user.roNumber
 *      ↓
 * getInspectionUploads(roNumber)
 *      ↓
 * read RO storage
 *      ↓
 * return images
 */
export const getInspectionUploads =
  async (
    roId: string,
  ): Promise<
    InspectionImageUpload[]
  > => {

    const images =
      await readRoImages(
        roId,
      );

    return images.filter(
      item =>
        item.roId === roId &&
        !item.deletedAt,
    );
  };

/**
 * --------------------------------------------------
 * UPDATE IMAGE
 * --------------------------------------------------
 */
export const updateInspectionUpload =
  async (
    id: string,
    image: InspectionImageUpload,
  ): Promise<boolean> => {

    const images =
      await readRoImages(
        image.roId,
      );

    const index =
      images.findIndex(
        item =>
          item.id === id,
      );

    if (
      index === -1
    ) {
      return false;
    }

    images[index] =
      image;

    await writeRoImages(
      image.roId,
      images,
    );

    return true;
  };

/**
 * --------------------------------------------------
 * DELETE IMAGE
 * --------------------------------------------------
 *
 * Soft delete.
 *
 * We DON'T physically remove the record because
 * editingHistory must remain available.
 */
export const deleteInspectionUpload =
  async (
    id: string,
    deletedAt: string,
    history:
      InspectionImageEditingHistory,
  ): Promise<boolean> => {

    const existing =
      await findInspectionUpload(
        id,
      );

    if (!existing) {
      return false;
    }

    const images =
      await readRoImages(
        existing.roId,
      );

    const index =
      images.findIndex(
        item =>
          item.id === id,
      );

    if (
      index === -1
    ) {
      return false;
    }

    images[index] = {

      ...images[index],

      deletedAt,

      updatedAt:
        deletedAt,

      editingHistory: [

        ...images[index]
          .editingHistory,

        history,

      ],
    };

    await writeRoImages(
      existing.roId,
      images,
    );

    return true;
  };
