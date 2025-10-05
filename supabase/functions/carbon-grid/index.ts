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
    const bbox = url.searchParams.get('bbox');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    let query = supabaseClient.from('carbon_grid').select('*');

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
      value: parseFloat(cell.carbon_ppm),
      traffic: cell.traffic_density,
      color: getColorForCarbon(parseFloat(cell.carbon_ppm)),
    }));

    return new Response(
      JSON.stringify({ tiles: heatmapData, count: data.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in carbon-grid:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getColorForCarbon(ppm: number): string {
  // Carbon PPM coloring (higher = worse)
  if (ppm > 500) return '#dc2626'; // Red (very high)
  if (ppm > 450) return '#f97316'; // Orange (high)
  if (ppm > 400) return '#fbbf24'; // Yellow (moderate)
  if (ppm > 350) return '#a3e635'; // Light green (good)
  return '#22c55e'; // Green (excellent)
}