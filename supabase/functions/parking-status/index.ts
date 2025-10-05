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

    // Fetch all parking slots with their lot information
    const { data: slots, error } = await supabaseClient
      .from('parking_slots')
      .select(`
        *,
        parking_lots (
          code,
          name,
          total_spots
        )
      `)
      .order('lot_id');

    if (error) throw error;

    // Calculate occupancy by lot
    const lotStats = slots.reduce((acc: any, slot: any) => {
      const lotCode = slot.parking_lots?.code;
      if (!acc[lotCode]) {
        acc[lotCode] = {
          lot_id: slot.lot_id,
          code: lotCode,
          name: slot.parking_lots?.name,
          total: slot.parking_lots?.total_spots || 0,
          occupied: 0,
          available: 0,
          reserved: 0,
        };
      }
      acc[lotCode][slot.status]++;
      return acc;
    }, {});

    return new Response(
      JSON.stringify({
        slots,
        lotStats: Object.values(lotStats),
        lastUpdated: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in parking-status:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});