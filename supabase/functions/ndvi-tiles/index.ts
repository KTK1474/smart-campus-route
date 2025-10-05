import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const bbox = url.searchParams.get('bbox'); // format: minLat,minLng,maxLat,maxLng

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    let query = supabaseClient.from('ndvi_grid').select('*');

    if (bbox) {
      const [minLat, minLng, maxLat, maxLng] = bbox.split(',').map(Number);
      query = query
        .gte('lat', minLat)
        .lte('lat', maxLat)
        .gte('lng', minLng)
        .lte('lng', maxLng);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform to heatmap format
    const heatmapData = data.map((cell: any) => ({
      lat: parseFloat(cell.lat),
      lng: parseFloat(cell.lng),
      value: parseFloat(cell.ndvi_value),
      color: getColorForNDVI(parseFloat(cell.ndvi_value)),
    }));

    return new Response(
      JSON.stringify({ tiles: heatmapData, count: data.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ndvi-tiles:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getColorForNDVI(ndvi: number): string {
  // NDVI ranges from -1 to 1, where higher values indicate healthier vegetation
  if (ndvi > 0.6) return '#2d5016'; // Dark green
  if (ndvi > 0.4) return '#4d7c0f'; // Green
  if (ndvi > 0.2) return '#84cc16'; // Light green
  if (ndvi > 0) return '#d9f99d'; // Very light green
  return '#fef3c7'; // Barren/urban
}