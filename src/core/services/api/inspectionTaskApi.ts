// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MOCK_INSPECTION_TASKS } from '../../../data/inspection';

import { InspectionTask } from '../../../models';

import { AppConfig } from '../../config/appConfig';

import { getSupabase } from '../supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

type InspectionTaskRow = {
  id: string;
  title: string;
  reference_image_key: string;
  instructions: string[];
  sort_order: number;
};

const referenceImageUrl = (key: string): string =>
  `${AppConfig.supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/reference-images/${key}.jpg`;

const rowToTask = (row: InspectionTaskRow): InspectionTask => ({
  id: row.id,
  title: row.title,
  imageUrl: referenceImageUrl(row.reference_image_key),
  instructions: row.instructions ?? [],
});

// ─── API ──────────────────────────────────────────────────────────────────────

class InspectionTaskApi {

  async getTasks(): Promise<InspectionTask[]> {

    // ── MOCK RETURN — uncomment to use local mock data ──────────────────────
    // return MOCK_INSPECTION_TASKS;
    // ───────────────────────────────────────────────────────────────────────

    // ── SUPABASE — comment out when using mock ──────────────────────────────
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('inspection_tasks')
      .select('id, title, reference_image_key, instructions, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as InspectionTaskRow[]).map(rowToTask);
    // ───────────────────────────────────────────────────────────────────────

  }

}

export default new InspectionTaskApi();
