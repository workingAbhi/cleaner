import { inspectionTemplates } from '../../../data/inspection';

import { InspectionTemplate } from '../../../models';

class InspectionApi {
  async getDailyInspection(): Promise<InspectionTemplate> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 300);
    });

    return inspectionTemplates[0];
  }
}

export default new InspectionApi();