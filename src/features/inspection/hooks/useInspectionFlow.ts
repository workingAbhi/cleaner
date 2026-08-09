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
  roNumber?: string,
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

  //-------------------------------------

  const currentTask =
    useMemo(
      () =>
        tasks[currentIndex],
      [
        tasks,
        currentIndex,
      ],
    );

  //-------------------------------------

  const progress =
    tasks.length === 0
      ? 0
      : (currentIndex + 1) /
        tasks.length;

  //-------------------------------------

  const completed =
    Object.keys(images).length;

  //-------------------------------------

  const uploadImage = async (
    uri: string,
  ) => {

    if (
      !currentTask ||
      !roNumber
    ) {
      return false;
    }

    try {

      setSaving(true);

      await InspectionUploadApi.uploadImage({
        roNumber,
        itemId:
          currentTask.id,
        imageUri: uri,
      });

      setImages(previous => ({
        ...previous,
        [currentTask.id]: uri,
      }));

      return true;

    } finally {

      setSaving(false);

    }
  };

  //-------------------------------------

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

  //-------------------------------------

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

  //-------------------------------------

  const isLastStep =
    currentIndex ===
    tasks.length - 1;

  //-------------------------------------

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