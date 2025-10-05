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
    const { action, slotId, status } = await req.json();
    
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

    let result;

    switch (action) {
      case 'toggle_random':
        // Randomly toggle 5-10 slots
        const count = Math.floor(Math.random() * 6) + 5;
        const { data: randomSlots } = await supabaseClient
          .from('parking_slots')
          .select('id, status')
          .limit(count);

        const updates = randomSlots?.map((slot: any) => ({
          ...slot,
          status: slot.status === 'occupied' ? 'available' : 'occupied',
          last_updated: new Date().toISOString()
        }));

        result = await supabaseClient
          .from('parking_slots')
          .upsert(updates);
        break;

      case 'set_status':
        if (!slotId || !status) {
          throw new Error('slotId and status required for set_status action');
        }
        result = await supabaseClient
          .from('parking_slots')
          .update({ status, last_updated: new Date().toISOString() })
          .eq('id', slotId);
        break;

      case 'rush_hour':
        // Set 80% of slots to occupied
        result = await supabaseClient.rpc('execute_sql', {
          query: `
            UPDATE parking_slots 
            SET status = CASE WHEN random() > 0.2 THEN 'occupied' ELSE 'available' END,
                last_updated = NOW()
          `
        });
        break;

      default:
        throw new Error('Invalid action. Use toggle_random, set_status, or rush_hour');
    }

    if (result.error) throw result.error;

    return new Response(
      JSON.stringify({ success: true, action, affected: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in parking-simulate:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});