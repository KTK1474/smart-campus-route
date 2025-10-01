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

  const parkingLots = [
    {
      id: "A",
      name: "Main Gate Parking",
      total: 50,
      occupied: 38,
      cameras: 4,
      lastUpdate: "2 min ago",
    },
    {
      id: "B",
      name: "Library Parking",
      total: 80,
      occupied: 56,
      cameras: 6,
      lastUpdate: "1 min ago",
    },
    {
      id: "C",
      name: "Sports Complex",
      total: 40,
      occupied: 12,
      cameras: 3,
      lastUpdate: "just now",
    },
    {
      id: "D",
      name: "Academic Block",
      total: 60,
      occupied: 54,
      cameras: 5,
      lastUpdate: "3 min ago",
    },
  ];

  const calculateAvailability = (total: number, occupied: number) => {
    return Math.round(((total - occupied) / total) * 100);
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
          {parkingLots.map((lot) => {
            const availability = calculateAvailability(lot.total, lot.occupied);
            const available = lot.total - lot.occupied;

            return (
              <Card key={lot.id} className="p-6 space-y-4 hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-foreground">Lot {lot.id}</h3>
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
                    <span>{lot.cameras} cameras active</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{lot.lastUpdate}</span>
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
            <Button variant="outline">Simulate Rush Hour</Button>
            <Button variant="outline">Simulate Event Traffic</Button>
            <Button variant="outline">Reset to Normal</Button>
            <Button variant="secondary">Export Report</Button>
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
