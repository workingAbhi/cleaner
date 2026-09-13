// Deploy: Edge Functions → analyze-image
// Dispatches image URL to custom CNN Microservice (Hugging Face / Render / Local)

const CNN_SERVICE_URL =
  Deno.env.get('CNN_SERVICE_URL') || ''; // e.g., https://username-cleaner-ai.hf.space/analyze

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'Missing Supabase secrets.' }, 500);
    }

    const body = await req.json();
    const analysisId = String(body.analysisId ?? '');
    const imageId = String(body.imageId ?? '');
    const imageUrl = String(body.imageUrl ?? '');
    const inspectionItem = String(body.inspectionItem ?? '');
    const facility = body.facility ? String(body.facility) : '';
    const roId = String(body.roId ?? '');

    if (!imageId || !imageUrl || !inspectionItem || !roId) {
      return json(
        { error: 'imageId, imageUrl, inspectionItem, roId required.' },
        400,
      );
    }

    let analysisPayload: Record<string, unknown>;

    if (CNN_SERVICE_URL) {
      // 1. Call your custom trained CNN Microservice
      const cnnRes = await fetch(CNN_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          inspection_item: inspectionItem,
          facility,
          ro_id: roId,
        }),
      });

      if (!cnnRes.ok) {
        throw new Error(`CNN service failed with status ${cnnRes.status}`);
      }

      analysisPayload = await cnnRes.json();
    } else {
      // 2. Fallback when CNN_SERVICE_URL is not configured yet
      analysisPayload = {
        inspectionItem,
        facility: facility || 'washroom',
        score: 80,
        status: 'PASS',
        confidence: 0.9,
        criteria: {
          floorCleanliness: 80,
          fixtureCleanliness: 80,
          visibleStains: 85,
          waste: 85,
          overallHygiene: 80,
        },
        issues: ['Sample analysis: Set CNN_SERVICE_URL to connect custom trained model.'],
        recommendations: ['Routine hygiene check.'],
        notVisible: [],
        analysisMethod: 'baseline-recorder',
      };
    }

    const saved = await saveAnalysis(
      supabaseUrl,
      serviceKey,
      analysisId,
      imageId,
      roId,
      inspectionItem,
      {
        model_name: (analysisPayload.analysisMethod as string) || 'cleaner-cnn-v1',
        score: (analysisPayload.score as number) ?? null,
        confidence: (analysisPayload.confidence as number) ?? null,
        status: 'COMPLETED',
        analysis_json: analysisPayload,
      },
    );

    return json({ data: saved });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Analysis failed.' },
      500,
    );
  }
});

async function saveAnalysis(
  supabaseUrl: string,
  serviceKey: string,
  analysisId: string,
  imageId: string,
  roId: string,
  inspectionItem: string,
  payload: Record<string, unknown>,
) {
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  if (analysisId) {
    const patch = await fetch(
      `${supabaseUrl}/rest/v1/ai_analyses?id=eq.${encodeURIComponent(analysisId)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      },
    );

    if (patch.ok) {
      const rows = await patch.json();
      if (Array.isArray(rows) && rows[0]) {
        return rows[0];
      }
    }
  }

  const insert = await fetch(`${supabaseUrl}/rest/v1/ai_analyses`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      inspection_image_id: imageId,
      ro_id: roId,
      inspection_item: inspectionItem,
      ...payload,
    }),
  });

  if (!insert.ok) {
    throw new Error(await insert.text());
  }

  const rows = await insert.json();
  return rows[0] ?? rows;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
