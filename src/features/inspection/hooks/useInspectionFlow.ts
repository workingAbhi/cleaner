import { useMemo, useState } from 'react';

import {
  InspectionTask,
} from '../../../models';

export default function useInspectionFlow(
  tasks: InspectionTask[],
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

  //-------------------------------------

  const currentTask =
    useMemo(
      () => tasks[currentIndex],
      [tasks, currentIndex],
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

  const uploadImage = (
    uri: string,
  ) => {

    if (!currentTask) {
      return;
    }

    setImages(previous => ({
      ...previous,
      [currentTask.id]: uri,
    }));

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

    if (currentIndex > 0) {

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

    uploadImage,

    next,

    previous,

    isLastStep,

  };

}