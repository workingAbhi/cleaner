import { AppConfig } from '../../core/config/appConfig';
import { Logger } from '../../core/helpers';
import { getAccessToken } from '../../core/services/supabaseClient';

import {
  AiAnalysis,
  AiAnalysisJson,
  AiAnalysisStatus,
} from '../../models/AiAnalysis';

import {
  InspectionImageEditingHistory,
  InspectionImageUpload,
} from '../../models/InspectionUpload';

const BUCKET = 'inspection-images';

const authHeaders = async () => {
  const accessToken = await getAccessToken();
  const bearer = accessToken || AppConfig.supabaseAnonKey;

  return {
    apikey: AppConfig.supabaseAnonKey,
    Authorization: `Bearer ${bearer}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
};

const restUrl = (path: string) =>
  `${AppConfig.supabaseUrl.replace(/\/$/, '')}/rest/v1/${path}`;

const storageUrl = (objectPath: string) =>
  `${AppConfig.supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${BUCKET}/${objectPath}`;

const publicUrl = (objectPath: string) =>
  `${AppConfig.supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${objectPath}`;

const functionsUrl = (name: string) =>
  `${AppConfig.supabaseUrl.replace(/\/$/, '')}/functions/v1/${name}`;

type InspectionImageRow = {
  id: string;
  ro_id: string;
  inspection_item: string;
  facility: InspectionImageUpload['facility'] | null;
  kind: InspectionImageUpload['kind'] | null;
  link: string;
  image_uri: string | null;
  storage_path: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  editing_history: InspectionImageEditingHistory[] | null;
};

const fromRow = (row: InspectionImageRow): InspectionImageUpload => ({
  id: row.id,
  roId: row.ro_id,
  inspectionItem: row.inspection_item,
  facility: row.facility ?? undefined,
  kind: row.kind ?? 'inspection',
  link: row.link,
  imageUri: row.image_uri ?? row.link,
  storagePath: row.storage_path ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  createdBy: row.created_by ?? undefined,
  updatedBy: row.updated_by ?? undefined,
  deletedAt: row.deleted_at ?? undefined,
  editingHistory: row.editing_history ?? [],
});

const toRow = (upload: InspectionImageUpload) => ({
  id: upload.id,
  ro_id: upload.roId,
  inspection_item: upload.inspectionItem,
  facility: upload.facility ?? null,
  kind: upload.kind ?? 'inspection',
  link: upload.link,
  image_uri: upload.imageUri,
  storage_path: upload.storagePath ?? null,
  created_at: upload.createdAt,
  updated_at: upload.updatedAt,
  created_by: upload.createdBy ?? null,
  updated_by: upload.updatedBy ?? null,
  deleted_at: upload.deletedAt ?? null,
  editing_history: upload.editingHistory,
});

const parseError = async (response: Response) => {
  const text = await response.text();
  return text || `Supabase request failed (${response.status}).`;
};

export const uploadInspectionFile = async (
  roId: string,
  inspectionItem: string,
  imageUri: string,
): Promise<{ publicUrl: string; storagePath: string }> => {
  console.log('[uploadInspectionFile] Fetching image from uri:', imageUri);
  const fileResponse = await fetch(imageUri);

  if (!fileResponse.ok) {
    console.error('[uploadInspectionFile] fileResponse status:', fileResponse.status, fileResponse.statusText);
    throw new Error('Unable to read the captured image.');
  }

  const body = await fileResponse.arrayBuffer();
  const storagePath = `${roId}/${inspectionItem}/${Date.now()}.jpg`;
  const url = storageUrl(storagePath);
  console.log('[uploadInspectionFile] Uploading to Storage URL:', url, 'bytes:', body.byteLength);

  const headers = await authHeaders();
  console.log('[uploadInspectionFile] Auth headers ready (has Authorization):', Boolean(headers.Authorization));

  const uploadResponse = await fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body,
  });

  if (!uploadResponse.ok) {
    const errorMsg = await parseError(uploadResponse);
    console.error('[uploadInspectionFile] Storage upload error:', uploadResponse.status, errorMsg);
    throw new Error(errorMsg);
  }

  console.log('[uploadInspectionFile] Upload success. storagePath:', storagePath);

  return {
    publicUrl: publicUrl(storagePath),
    storagePath,
  };
};

export const addInspectionUpload = async (
  upload: InspectionImageUpload,
): Promise<void> => {
  const url = restUrl('inspection_images?on_conflict=id');
  console.log('[addInspectionUpload] Inserting row into inspection_images at:', url);

  const response = await fetch(
    url,
    {
      method: 'POST',
      headers: {
        ...(await authHeaders()),
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(toRow(upload)),
    },
  );

  if (!response.ok) {
    const errorMsg = await parseError(response);
    console.error('[addInspectionUpload] Database insert error:', response.status, errorMsg);
    throw new Error(errorMsg);
  }

  console.log('[addInspectionUpload] Row saved to inspection_images successfully.');
};

export const findInspectionUpload = async (
  id: string,
): Promise<InspectionImageUpload | undefined> => {
  const response = await fetch(
    restUrl(`inspection_images?id=eq.${encodeURIComponent(id)}&select=*`),
    {
      headers: await authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const rows = (await response.json()) as InspectionImageRow[];
  return rows[0] ? fromRow(rows[0]) : undefined;
};

export const getInspectionUploads = async (
  roId: string,
): Promise<InspectionImageUpload[]> => {
  const response = await fetch(
    restUrl(
      `inspection_images?ro_id=eq.${encodeURIComponent(roId)}&kind=eq.inspection&deleted_at=is.null&select=*`,
    ),
    {
      headers: await authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const rows = (await response.json()) as InspectionImageRow[];
  return rows.map(fromRow);
};

export const getAllInspectionUploads = async (): Promise<
  InspectionImageUpload[]
> => {
  const response = await fetch(
    restUrl(
      'inspection_images?kind=eq.inspection&deleted_at=is.null&select=*&order=updated_at.desc&limit=200',
    ),
    {
      headers: await authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const rows = (await response.json()) as InspectionImageRow[];
  return rows.map(fromRow);
};

type AiAnalysisRow = {
  id: string;
  inspection_image_id: string;
  ro_id: string;
  inspection_item: string;
  model_name: string | null;
  score: number | null;
  confidence: number | null;
  status: AiAnalysisStatus;
  analysis_json: AiAnalysisJson | null;
  created_at: string;
};

const fromAnalysisRow = (row: AiAnalysisRow): AiAnalysis => ({
  id: row.id,
  inspectionImageId: row.inspection_image_id,
  roId: row.ro_id,
  inspectionItem: row.inspection_item,
  modelName: row.model_name ?? undefined,
  score: row.score ?? undefined,
  confidence: row.confidence ?? undefined,
  status: row.status,
  analysisJson: row.analysis_json ?? {},
  createdAt: row.created_at,
});

export const latestAnalysisByImageId = (
  analyses: AiAnalysis[],
): Record<string, AiAnalysis> => {
  const latest: Record<string, AiAnalysis> = {};

  analyses.forEach(analysis => {
    const existing = latest[analysis.inspectionImageId];

    if (
      !existing ||
      analysis.createdAt > existing.createdAt
    ) {
      latest[analysis.inspectionImageId] = analysis;
    }
  });

  return latest;
};

export const getAnalysesForRo = async (
  roId: string,
): Promise<AiAnalysis[]> => {
  const response = await fetch(
    restUrl(
      `ai_analyses?ro_id=eq.${encodeURIComponent(roId)}&select=*&order=created_at.desc`,
    ),
    {
      headers: await authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const rows = (await response.json()) as AiAnalysisRow[];
  return rows.map(fromAnalysisRow);
};

export const getAllAnalyses = async (): Promise<AiAnalysis[]> => {
  const response = await fetch(
    restUrl('ai_analyses?select=*&order=created_at.desc&limit=400'),
    {
      headers: await authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const rows = (await response.json()) as AiAnalysisRow[];
  return rows.map(fromAnalysisRow);
};

const insertAnalysis = async (
  upload: InspectionImageUpload,
  status: AiAnalysisStatus,
  extra?: Partial<AiAnalysisRow>,
): Promise<AiAnalysis> => {
  const response = await fetch(restUrl('ai_analyses'), {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      inspection_image_id: upload.id,
      ro_id: upload.roId,
      inspection_item: upload.inspectionItem,
      status,
      analysis_json: extra?.analysis_json ?? {},
      score: extra?.score ?? null,
      confidence: extra?.confidence ?? null,
      model_name: extra?.model_name ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const rows = (await response.json()) as AiAnalysisRow[];
  return fromAnalysisRow(rows[0]);
};

const failAnalysis = async (
  analysisId: string,
  message: string,
): Promise<void> => {
  await fetch(
    restUrl(`ai_analyses?id=eq.${encodeURIComponent(analysisId)}`),
    {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify({
        status: 'FAILED',
        analysis_json: { error: message },
      }),
    },
  );
};

export const updateInspectionUpload = async (
  id: string,
  image: InspectionImageUpload,
): Promise<boolean> => {
  const response = await fetch(
    restUrl(`inspection_images?id=eq.${encodeURIComponent(id)}`),
    {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify(toRow(image)),
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const rows = (await response.json()) as InspectionImageRow[];
  return rows.length > 0;
};

export const deleteInspectionUpload = async (
  id: string,
  deletedAt: string,
  history: InspectionImageEditingHistory,
): Promise<boolean> => {
  const existing = await findInspectionUpload(id);

  if (!existing) {
    return false;
  }

  return updateInspectionUpload(id, {
    ...existing,
    deletedAt,
    updatedAt: deletedAt,
    editingHistory: [...existing.editingHistory, history],
  });
};

export const requestImageAnalysis = async (
  upload: InspectionImageUpload,
): Promise<void> => {
  let analysisId: string | undefined;

  try {
    const pending = await insertAnalysis(upload, 'PROCESSING');
    analysisId = pending.id;

    const response = await fetch(functionsUrl('analyze-image'), {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({
        analysisId: pending.id,
        imageId: upload.id,
        imageUrl: upload.link,
        inspectionItem: upload.inspectionItem,
        facility: upload.facility ?? null,
        roId: upload.roId,
      }),
    });

    if (!response.ok) {
      const detail = await parseError(response);
      console.error('[requestImageAnalysis] Edge function analyze-image returned error:', response.status, detail);
      Logger.warn('AI analysis failed:', detail);
      let errMsg = 'AI Analysis failed.';
      try {
        const parsed = JSON.parse(detail);
        errMsg = parsed.error || parsed.message || detail;
      } catch {
        errMsg = detail || 'AI analysis failed.';
      }
      await failAnalysis(pending.id, errMsg);
    } else {
      console.log('[requestImageAnalysis] AI analysis completed successfully.');
    }
  } catch (error) {
    console.error('[requestImageAnalysis] Network or invocation error:', error);
    Logger.warn('AI analysis request failed:', error);

    if (analysisId) {
      await failAnalysis(
        analysisId,
        error instanceof Error ? error.message : 'Unable to connect to AI analysis function.',
      );
    }
  }
};
