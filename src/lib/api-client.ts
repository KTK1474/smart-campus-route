import { supabase } from "@/integrations/supabase/client";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export const api = {
  // Parking endpoints
  async getParkingStatus() {
    const { data, error } = await supabase.functions.invoke('parking-status');
    if (error) throw error;
    return data;
  },

  async simulateParking(action: string, slotId?: string, status?: string) {
    const { data, error } = await supabase.functions.invoke('parking-simulate', {
      body: { action, slotId, status }
    });
    if (error) throw error;
    return data;
  },

  // Green data endpoints
  async getNDVITiles(bbox?: string) {
    const { data, error } = await supabase.functions.invoke('ndvi-tiles', {
      body: { bbox }
    });
    if (error) throw error;
    return data;
  },

  async getCarbonGrid(bbox?: string) {
    const { data, error } = await supabase.functions.invoke('carbon-grid', {
      body: { bbox }
    });
    if (error) throw error;
    return data;
  },

  // Routing endpoints
  async getEcoRoute(from: { lat: number; lng: number }, to: { lat: number; lng: number }, mode: string = 'walk') {
    const { data, error } = await supabase.functions.invoke('eco-route', {
      body: {
        from_lat: from.lat,
        from_lng: from.lng,
        to_lat: to.lat,
        to_lng: to.lng,
        mode
      }
    });
    if (error) throw error;
    return data;
  },

  // AI Chat endpoint
  async chat(message: string, context?: any) {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { message, context }
    });
    if (error) throw error;
    return data;
  },

  // Dashboard endpoint
  async getDashboardImpact() {
    const { data, error } = await supabase.functions.invoke('dashboard-impact');
    if (error) throw error;
    return data;
  },

  // IoT simulation
  async simulateIoT(action: string, sensor_type?: string, value?: number) {
    const { data, error} = await supabase.functions.invoke('simulate-iot', {
      body: { action, sensor_type, value }
    });
    if (error) throw error;
    return data;
  }
};