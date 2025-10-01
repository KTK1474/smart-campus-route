import { useState } from "react";
import { Leaf, MapPin, Route, Users, Settings, Activity } from "lucide-react";
import MapView from "@/components/map/MapView";
import LayerControls from "@/components/map/LayerControls";
import AIAssistant from "@/components/ai/AIAssistant";
import StatsPanel from "@/components/dashboard/StatsPanel";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Dashboard - Main map-centric view with layer controls
 * Shows NDVI heatmap, carbon emissions, parking status, and safe paths
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeLayers, setActiveLayers] = useState({
    ndvi: true,
    carbon: false,
    parking: true,
    safePath: false,
  });

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-eco flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EcoNav 360</h1>
              <p className="text-xs text-muted-foreground">Campus Green Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/route-planner")}>
              <Route className="w-4 h-4 mr-2" />
              Plan Route
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/parking")}>
              <MapPin className="w-4 h-4 mr-2" />
              Parking
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/leaderboard")}>
              <Users className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="absolute inset-0 pt-16">
        <MapView activeLayers={activeLayers} />
      </div>

      {/* Layer Controls Panel - Left Side */}
      <div className="absolute left-4 top-24 z-20">
        <LayerControls activeLayers={activeLayers} onToggleLayer={toggleLayer} />
      </div>

      {/* Stats Panel - Top Right */}
      <div className="absolute right-4 top-24 z-20">
        <StatsPanel />
      </div>

      {/* AI Assistant - Bottom Right */}
      <div className="absolute right-4 bottom-4 z-30">
        <AIAssistant />
      </div>

      {/* Quick Action Badge - Bottom Left */}
      <div className="absolute left-4 bottom-4 z-20 bg-card/90 backdrop-blur-md rounded-lg p-4 border border-border shadow-card max-w-xs">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Live Campus Status</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Air Quality:</span>
            <span className="text-eco-green font-medium">Good (85)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Parking Available:</span>
            <span className="text-eco-teal font-medium">67%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Green Index:</span>
            <span className="text-primary font-medium">High (0.78)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
