// Deploy: Edge Functions → analyze-image
// Secret: GEMINI_API_KEY
// Optional: GEMINI_MODEL (default gemini-2.5-flash)

const GEMINI_MODEL =
  Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
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

    if (!geminiKey) {
      await saveAnalysis(supabaseUrl, serviceKey, analysisId, imageId, roId, inspectionItem, {
        status: 'FAILED',
        analysis_json: {
          error: 'GEMINI_API_KEY is not set on the analyze-image function.',
        },
      });
      return json({ error: 'GEMINI_API_KEY missing.' }, 500);
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      await saveAnalysis(supabaseUrl, serviceKey, analysisId, imageId, roId, inspectionItem, {
        status: 'FAILED',
        analysis_json: { error: 'Unable to download inspection image.' },
      });
      return json({ error: 'Unable to download inspection image.' }, 400);
    }

    const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
    const base64 = bytesToBase64(imageBytes);
    const mimeType =
      imageResponse.headers.get('content-type') || 'image/jpeg';

    const prompt = `You inspect fuel-station washroom photos for compliance.

RO: ${roId}
App item code: ${inspectionItem}
Facility if known: ${facility || 'unknown'}

Score only what is visible. Omit criteria that are not in the frame.
Do not invent fixtures. Do not compare to another photo.

Return JSON only:
{
  "inspectionItem": string,
  "facility": string,
  "score": number,
  "status": "PASS" | "FAIL",
  "confidence": number,
  "criteria": { "floorCleanliness": number, "fixtureCleanliness": number, "visibleStains": number, "waste": number, "overallHygiene": number },
  "issues": string[],
  "recommendations": string[],
  "notVisible": string[]
}
PASS if score >= 70. Scores 0-100. confidence 0-1.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const detail = await geminiResponse.text();
      await saveAnalysis(supabaseUrl, serviceKey, analysisId, imageId, roId, inspectionItem, {
        status: 'FAILED',
        analysis_json: { error: 'Gemini request failed.', detail },
      });
      return json({ error: 'Gemini request failed.', detail }, 502);
    }

    const geminiJson = await geminiResponse.json();
    const text =
      geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const analysis = JSON.parse(text);

    const saved = await saveAnalysis(
      supabaseUrl,
      serviceKey,
      analysisId,
      imageId,
      roId,
      inspectionItem,
      {
        model_name: GEMINI_MODEL,
        score: analysis.score ?? null,
        confidence: analysis.confidence ?? null,
        status: 'COMPLETED',
        analysis_json: analysis,
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

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
