import { useState, useEffect } from "react";
import { ArrowLeft, Camera, MapPin, Clock, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/**
 * ParkingView - Real-time parking availability dashboard
 * Shows camera-based detection, occupancy rates, and reservation system
 */
const ParkingView = () => {
  const navigate = useNavigate();
  const [parkingData, setParkingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParkingData();
    // Refresh every 30 seconds
    const interval = setInterval(loadParkingData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadParkingData = async () => {
    try {
      const { api } = await import('@/lib/api-client');
      const data = await api.getParkingStatus();
      setParkingData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading parking data:', error);
      setLoading(false);
    }
  };

  if (loading || !parkingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading parking data...</p>
        </div>
      </div>
    );
  }

  const parkingLots = parkingData.lotStats || [];

  const calculateAvailability = (total: number, occupied: number) => {
    const available = total - occupied;
    return Math.round((available / total) * 100);
  };

  const handleSimulate = async (action: string) => {
    try {
      const { api } = await import('@/lib/api-client');
      await api.simulateParking(action);
      await loadParkingData(); // Refresh data
    } catch (error) {
      console.error('Simulation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Smart Parking</h1>
            <p className="text-muted-foreground">AI-powered real-time parking detection</p>
          </div>
          <Button>
            <Camera className="w-4 h-4 mr-2" />
            View Cameras
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Total Spots", value: "230", icon: MapPin, color: "primary" },
            { label: "Available Now", value: "70", icon: Car, color: "eco-green" },
            { label: "Occupancy Rate", value: "70%", icon: Clock, color: "eco-amber" },
            { label: "Active Cameras", value: "18", icon: Camera, color: "eco-teal" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 text-${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Parking Lots Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {parkingLots.map((lot: any) => {
            const occupied = lot.occupied || 0;
            const total = lot.total || 1;
            const availability = calculateAvailability(total, occupied);
            const available = total - occupied;

            return (
              <Card key={lot.code} className="p-6 space-y-4 hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-foreground">Lot {lot.code}</h3>
                      <Badge
                        variant={availability > 50 ? "default" : availability > 20 ? "secondary" : "destructive"}
                      >
                        {availability}% available
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{lot.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{available}</p>
                    <p className="text-sm text-muted-foreground">spots free</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="text-foreground font-medium">
                      {lot.occupied}/{lot.total}
                    </span>
                  </div>
                  <Progress value={availability} className="h-2" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Camera className="w-4 h-4" />
                    <span>Real-time monitoring</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Live</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" variant="default">
                    Reserve Spot
                  </Button>
                  <Button variant="outline">Navigate</Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Simulation Controls */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Parking Simulation</h3>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => handleSimulate('toggle_random')}>
              Toggle Random Slots
            </Button>
            <Button variant="outline" onClick={() => handleSimulate('rush_hour')}>
              Simulate Rush Hour
            </Button>
            <Button variant="secondary" onClick={loadParkingData}>
              Refresh Data
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Use simulation controls to test parking system under different scenarios
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ParkingView;
