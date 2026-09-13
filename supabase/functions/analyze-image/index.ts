// Deploy: Edge Functions → analyze-image
// Clean Inspection Image Analysis Pipeline

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

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      await saveAnalysis(supabaseUrl, serviceKey, analysisId, imageId, roId, inspectionItem, {
        status: 'FAILED',
        analysis_json: { error: 'Unable to download inspection image from storage.' },
      });
      return json({ error: 'Unable to download inspection image.' }, 400);
    }

    // Mark analysis completed/recorded
    const analysisPayload = {
      inspectionItem,
      facility: facility || 'washroom',
      status: 'RECORDED',
      note: 'Image captured and stored successfully.',
      recordedAt: new Date().toISOString(),
    };

    const saved = await saveAnalysis(
      supabaseUrl,
      serviceKey,
      analysisId,
      imageId,
      roId,
      inspectionItem,
      {
        model_name: 'cleaner-pipeline-v1',
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
