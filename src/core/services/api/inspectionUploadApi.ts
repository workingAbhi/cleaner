import {
  InspectionImageUploadRequest,
  InspectionImageUpload,
} from '../../../models/InspectionUpload';

import {
  addInspectionUpload,
  getInspectionUploads,
} from '../../../data/inspection/uploads.mock';

class InspectionUploadApi {

  async uploadImage(
    request: InspectionImageUploadRequest,
  ): Promise<InspectionImageUpload> {

    await new Promise<void>(
      resolve =>
        setTimeout(resolve, 300),
    );

    const upload: InspectionImageUpload = {
      id:
        `${request.roNumber}-${request.itemId}`,
      roNumber:
        request.roNumber,
      itemId:
        request.itemId,
      imageUri:
        request.imageUri,
      uploadedAt:
        new Date().toISOString(),
    };

    addInspectionUpload(upload);

    return upload;
  }

  async getUploads(
    roNumber: string,
  ): Promise<InspectionImageUpload[]> {

    await new Promise<void>(
      resolve =>
        setTimeout(resolve, 200),
    );

    return getInspectionUploads(
      roNumber,
    );
  }
}

export default new InspectionUploadApi();