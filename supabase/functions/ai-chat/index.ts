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
    const { message, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get contextual data from database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fetch relevant contextual data
    const [parkingData, sensorsData] = await Promise.all([
      supabaseClient.from('parking_slots').select('status, parking_lots(name)'),
      supabaseClient.from('iot_sensors').select('sensor_type, current_value, unit')
    ]);

    // Build context-aware system prompt
    const systemPrompt = `You are EcoNav AI, a smart campus assistant. You help users navigate campus sustainably and safely.

Current Campus Status:
- Parking: ${parkingData.data?.filter((s: any) => s.status === 'available').length} spots available
- Air Quality: ${sensorsData.data?.find((s: any) => s.sensor_type === 'air_quality')?.current_value} AQI
- Active Sensors: ${sensorsData.data?.filter((s: any) => s.sensor_type).length}

User Context: ${JSON.stringify(context || {})}

You can help with:
- Finding eco-friendly routes that minimize carbon exposure
- Locating available parking with navigation
- Checking safety scores for different paths
- Comparing carbon impact of different transport modes
- Providing campus green index and sustainability tips

Be concise, helpful, and eco-conscious in your responses.`;

    // Call Lovable AI (Gemini)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      // Fallback to rule-based response
      return new Response(
        JSON.stringify({
          reply: getFallbackResponse(message, parkingData.data),
          source: 'fallback'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return new Response(
      JSON.stringify({ reply, source: 'gemini' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-chat:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getFallbackResponse(message: string, parkingData: any): string {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('parking') || lowerMsg.includes('park')) {
    const available = parkingData?.filter((s: any) => s.status === 'available').length || 0;
    return `There are currently ${available} parking spots available across campus. Would you like me to guide you to the nearest lot?`;
  }
  
  if (lowerMsg.includes('route') || lowerMsg.includes('navigate')) {
    return 'I can help you find the most eco-friendly or safest route. Please specify your destination and preferred mode of transport.';
  }
  
  if (lowerMsg.includes('co2') || lowerMsg.includes('carbon') || lowerMsg.includes('eco')) {
    return 'Taking eco-routes can save 0.5-1.2 kg CO₂ per trip! Walking or cycling is even better for zero emissions.';
  }
  
  if (lowerMsg.includes('safe') || lowerMsg.includes('safety')) {
    return 'I can suggest the safest paths with good lighting and CCTV coverage. Which area are you heading to?';
  }
  
  return 'I can help with parking info, eco-routes, safety navigation, and carbon impact. What would you like to know?';
}