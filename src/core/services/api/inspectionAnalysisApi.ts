import {
  AiAnalysis,
} from '../../../models/AiAnalysis';

import {
  InspectionImageUpload,
} from '../../../models/InspectionUpload';

import {
  getAnalysesForRo as getMockAnalysesForRo,
  getAllAnalyses as getMockAllAnalyses,
} from '../../../data/inspection/analyses.mock';

import {
  getAnalysesForRo as getSupabaseAnalysesForRo,
  getAllAnalyses as getSupabaseAllAnalyses,
  latestAnalysisByImageId,
} from '../../../data/inspection/uploads.supabase';

import {
  isSupabaseConfigured,
} from '../../config/appConfig';

class InspectionAnalysisApi {
  async getLatestByRoId(
    roId: string,
  ): Promise<Record<string, AiAnalysis>> {
    const analyses = isSupabaseConfigured()
      ? await getSupabaseAnalysesForRo(roId)
      : await getMockAnalysesForRo(roId);

    return latestAnalysisByImageId(analyses);
  }

  async getLatestForImages(
    images: InspectionImageUpload[],
  ): Promise<Record<string, AiAnalysis>> {
    if (images.length === 0) {
      return {};
    }

    const byRo = images[0]?.roId;
    const sameRo = images.every(image => image.roId === byRo);

    if (sameRo && byRo) {
      return this.getLatestByRoId(byRo);
    }

    return this.getLatestAll();
  }

  async getLatestAll(): Promise<Record<string, AiAnalysis>> {
    const analyses = isSupabaseConfigured()
      ? await getSupabaseAllAnalyses()
      : await getMockAllAnalyses();

    return latestAnalysisByImageId(analyses);
  }
}

export default new InspectionAnalysisApi();
