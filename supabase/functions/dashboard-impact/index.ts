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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Calculate aggregate metrics from the past 24 hours
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Get total eco routes saved
    const { data: routes, error: routesError } = await supabaseClient
      .from('routes')
      .select('co2_saved_kg, distance_meters, transport_mode')
      .gte('created_at', dayAgo);

    if (routesError) throw routesError;

    // Get parking data
    const { data: slots } = await supabaseClient
      .from('parking_slots')
      .select('status');

    // Get sensor data
    const { data: sensors } = await supabaseClient
      .from('iot_sensors')
      .select('sensor_type, current_value, unit');

    // Calculate aggregated metrics
    const totalCO2Saved = routes?.reduce((sum, r) => sum + (parseFloat(r.co2_saved_kg as any) || 0), 0) || 0;
    const totalDistance = routes?.reduce((sum, r) => sum + (r.distance_meters || 0), 0) || 0;
    const ecoRoutes = routes?.filter(r => r.transport_mode === 'walk' || r.transport_mode === 'cycle').length || 0;

    // Calculate parking efficiency (time saved by checking availability)
    const availableSlots = slots?.filter(s => s.status === 'available').length || 0;
    const totalSlots = slots?.length || 1;
    const parkingEfficiency = (availableSlots / totalSlots) * 100;

    // Get air quality
    const airQualitySensor = sensors?.find(s => s.sensor_type === 'air_quality');
    const airQuality = airQualitySensor?.current_value || 75;

    // Calculate campus green index (weighted average of NDVI)
    const { data: ndviData } = await supabaseClient
      .from('ndvi_grid')
      .select('ndvi_value');

    const avgNDVI = ndviData && ndviData.length > 0
      ? ndviData.reduce((sum, cell) => sum + parseFloat(cell.ndvi_value as any), 0) / ndviData.length
      : 0.5;

    return new Response(
      JSON.stringify({
        daily_co2_saved: parseFloat(totalCO2Saved.toFixed(2)),
        daily_distance_km: parseFloat((totalDistance / 1000).toFixed(2)),
        eco_routes_taken: ecoRoutes,
        total_routes: routes?.length || 0,
        parking_efficiency: parseFloat(parkingEfficiency.toFixed(1)),
        air_quality_aqi: airQuality,
        campus_green_index: parseFloat((avgNDVI || 0.5).toFixed(2)),
        active_sensors: sensors?.filter(s => s.sensor_type).length || 0,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in dashboard-impact:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});