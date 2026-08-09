import {
  useMemo,
  useState,
} from 'react';

import {
  InspectionTask,
} from '../../../models';

import {
  InspectionUploadApi,
} from '../../../core/services/api';

export default function useInspectionFlow(
  tasks: InspectionTask[],
  roId?: string,
) {
  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    images,
    setImages,
  ] = useState<
    Record<string, string>
  >({});

  const [
    saving,
    setSaving,
  ] = useState(false);

  const currentTask =
    useMemo(
      () =>
        tasks[
          currentIndex
        ],
      [
        tasks,
        currentIndex,
      ],
    );

  const progress =
    tasks.length === 0
      ? 0
      : (currentIndex + 1) /
        tasks.length;

  const completed =
    Object.keys(
      images,
    ).length;

  /**
   * Upload the current inspection item.
   *
   * This immediately calls the Upload API.
   *
   * Inspection completion is NOT required.
   */
  const uploadImage =
    async (
      uri: string,
      userId?: string,
      userName?: string,
    ) => {
      if (
        !currentTask ||
        !roId
      ) {
        return false;
      }

      try {
        setSaving(true);

        const upload =
          await InspectionUploadApi.uploadImage(
            {
              roId,

              inspectionItem:
                currentTask.id,

              imageUri:
                uri,

              userId,

              userName,
            },
          );

        /**
         * Keep the local camera URI only
         * for the current inspection UI.
         */
        setImages(
          previous => ({
            ...previous,

            [currentTask.id]:
              upload.imageUri,
          }),
        );

        return true;
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    };

  const next = () => {
    if (
      currentIndex <
      tasks.length - 1
    ) {
      setCurrentIndex(
        previous =>
          previous + 1,
      );
    }
  };

  const previous = () => {
    if (
      currentIndex > 0
    ) {
      setCurrentIndex(
        previous =>
          previous - 1,
      );
    }
  };

  const isLastStep =
    tasks.length > 0 &&
    currentIndex ===
      tasks.length - 1;

  return {
    currentIndex,

    currentTask,

    progress,

    completed,

    images,

    saving,

    uploadImage,

    next,

    previous,

    isLastStep,
  };
}