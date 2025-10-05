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
    const { action, sensor_type, value } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    if (action === 'update_all') {
      // Update all sensors with simulated values
      const { data: sensors } = await supabaseClient
        .from('iot_sensors')
        .select('*');

      const updates = sensors?.map(sensor => ({
        ...sensor,
        current_value: generateSensorValue(sensor.sensor_type),
        last_reading: new Date().toISOString()
      }));

      const result = await supabaseClient
        .from('iot_sensors')
        .upsert(updates);

      if (result.error) throw result.error;

      return new Response(
        JSON.stringify({ success: true, updated: updates?.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update_type' && sensor_type) {
      // Update specific sensor type
      const result = await supabaseClient
        .from('iot_sensors')
        .update({
          current_value: value || generateSensorValue(sensor_type),
          last_reading: new Date().toISOString()
        })
        .eq('sensor_type', sensor_type);

      if (result.error) throw result.error;

      return new Response(
        JSON.stringify({ success: true, sensor_type }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action. Use update_all or update_type');
  } catch (error) {
    console.error('Error in simulate-iot:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSensorValue(sensorType: string): number {
  switch (sensorType) {
    case 'air_quality':
      return Math.round(60 + Math.random() * 40); // AQI 60-100
    case 'noise':
      return Math.round(50 + Math.random() * 30); // 50-80 dB
    case 'light':
      return Math.round(5 + Math.random() * 5); // 5-10 lux/10
    case 'temperature':
      return Math.round(18 + Math.random() * 12); // 18-30°C
    case 'humidity':
      return Math.round(40 + Math.random() * 40); // 40-80%
    case 'soil_moisture':
      return Math.round(30 + Math.random() * 40); // 30-70%
    default:
      return 50;
  }
}