import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Node {
  id: string;
  lat: number;
  lng: number;
  ndvi_value: number;
}

interface Edge {
  from_node_id: string;
  to_node_id: string;
  distance_meters: number;
  avg_carbon_ppm: number;
  lighting_level: number;
  cctv_coverage: boolean;
  crowd_density: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { from_lat, from_lng, to_lat, to_lng, mode = 'walk' } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fetch campus graph
    const [nodesRes, edgesRes, carbonRes] = await Promise.all([
      supabaseClient.from('campus_nodes').select('*'),
      supabaseClient.from('campus_edges').select('*'),
      supabaseClient.from('carbon_grid').select('*')
    ]);

    if (nodesRes.error) throw nodesRes.error;
    if (edgesRes.error) throw edgesRes.error;

    const nodes: Node[] = nodesRes.data;
    const edges: Edge[] = edgesRes.data;

    // Find nearest nodes to start and end points
    const startNode = findNearestNode(nodes, from_lat, from_lng);
    const endNode = findNearestNode(nodes, to_lat, to_lng);

    // Calculate eco route (minimize CO2 + distance)
    const ecoRoute = calculateRoute(nodes, edges, startNode, endNode, 'eco');
    
    // Calculate safe route (maximize safety)
    const safeRoute = calculateRoute(nodes, edges, startNode, endNode, 'safe');

    // Calculate metrics
    const ecoMetrics = calculateMetrics(ecoRoute, edges, mode);
    const safeMetrics = calculateMetrics(safeRoute, edges, mode);

    return new Response(
      JSON.stringify({
        eco_route: {
          points: ecoRoute.map(nodeId => {
            const node = nodes.find(n => n.id === nodeId);
            return { lat: node?.lat, lng: node?.lng };
          }),
          ...ecoMetrics
        },
        safe_route: {
          points: safeRoute.map(nodeId => {
            const node = nodes.find(n => n.id === nodeId);
            return { lat: node?.lat, lng: node?.lng };
          }),
          ...safeMetrics
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in eco-route:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function findNearestNode(nodes: Node[], lat: number, lng: number): string {
  let minDist = Infinity;
  let nearestId = nodes[0].id;
  
  for (const node of nodes) {
    const dist = Math.sqrt(
      Math.pow(node.lat - lat, 2) + Math.pow(node.lng - lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearestId = node.id;
    }
  }
  return nearestId;
}

function calculateRoute(
  nodes: Node[],
  edges: Edge[],
  startId: string,
  endId: string,
  type: 'eco' | 'safe'
): string[] {
  // Simplified A* implementation
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; path: string[]; cost: number }> = [
    { nodeId: startId, path: [startId], cost: 0 }
  ];

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;

    if (current.nodeId === endId) {
      return current.path;
    }

    if (visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);

    // Find connected edges
    const connectedEdges = edges.filter(e => e.from_node_id === current.nodeId);
    
    for (const edge of connectedEdges) {
      if (visited.has(edge.to_node_id)) continue;

      const edgeCost = type === 'eco'
        ? calculateEcoCost(edge)
        : calculateSafetyCost(edge);

      queue.push({
        nodeId: edge.to_node_id,
        path: [...current.path, edge.to_node_id],
        cost: current.cost + edgeCost
      });
    }
  }

  // If no path found, return direct nodes
  return [startId, endId];
}

function calculateEcoCost(edge: Edge): number {
  // Cost = distance + carbon_penalty + inverse_green_bonus
  const carbonPenalty = (edge.avg_carbon_ppm - 350) * 0.5;
  return edge.distance_meters + carbonPenalty;
}

function calculateSafetyCost(edge: Edge): number {
  // Lower is better: penalize low lighting, no CCTV, high crowd
  const lightingScore = (10 - edge.lighting_level) * 20;
  const cctvPenalty = edge.cctv_coverage ? 0 : 50;
  const crowdPenalty = edge.crowd_density * 10;
  
  return edge.distance_meters + lightingScore + cctvPenalty + crowdPenalty;
}

function calculateMetrics(path: string[], edges: Edge[], mode: string) {
  let totalDistance = 0;
  let totalCarbon = 0;
  let safetyScore = 100;

  for (let i = 0; i < path.length - 1; i++) {
    const edge = edges.find(e => 
      e.from_node_id === path[i] && e.to_node_id === path[i + 1]
    );
    
    if (edge) {
      totalDistance += edge.distance_meters;
      totalCarbon += edge.avg_carbon_ppm * edge.distance_meters / 1000;
      
      // Safety calculation
      const edgeSafety = (
        edge.lighting_level * 5 +
        (edge.cctv_coverage ? 25 : 0) +
        (10 - edge.crowd_density) * 2.5
      );
      safetyScore = Math.min(safetyScore, edgeSafety);
    }
  }

  // Calculate CO2 saved vs car
  const carCO2 = totalDistance * 0.12 / 1000; // 120g per km
  const co2Saved = mode === 'walk' || mode === 'cycle' ? carCO2 : carCO2 * 0.7;

  // Walking speed ~5 km/h, cycling ~15 km/h
  const speed = mode === 'cycle' ? 15000 : 5000; // meters/hour
  const durationSeconds = Math.round((totalDistance / speed) * 3600);

  return {
    distance_meters: Math.round(totalDistance),
    duration_seconds: durationSeconds,
    co2_saved_kg: parseFloat(co2Saved.toFixed(3)),
    safety_score: Math.round(Math.max(0, Math.min(100, safetyScore)))
  };
}