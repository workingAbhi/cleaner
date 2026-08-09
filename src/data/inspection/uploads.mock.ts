import {
  InspectionImageUpload,
} from '../../models/InspectionUpload';

export const InspectionUploadStore: InspectionImageUpload[] = [];

export const addInspectionUpload = (
  upload: InspectionImageUpload,
) => {
  const existingIndex =
    InspectionUploadStore.findIndex(
      item =>
        item.roNumber === upload.roNumber &&
        item.itemId === upload.itemId,
    );

  if (existingIndex >= 0) {
    InspectionUploadStore[existingIndex] =
      upload;
    return;
  }

  InspectionUploadStore.push(upload);
};

export const getInspectionUploads = (
  roNumber: string,
) => {
  return InspectionUploadStore.filter(
    item =>
      item.roNumber === roNumber,
  );
};