import { ArrowLeft, Play, Pause, RotateCcw, Zap, Cloud, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

/**
 * AdminSimulator - Simulation controls for demo scenarios
 * Allows spawning events, adjusting sensors, and triggering edge cases
 */
const AdminSimulator = () => {
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(true);
  const [scenarios, setScenarios] = useState({
    trafficJam: false,
    concert: false,
    nightMode: false,
    rainEvent: false,
  });
  const [sensors, setSensors] = useState({
    airQuality: 85,
    noise: 45,
    soilMoisture: 70,
    lightLevel: 90,
  });

  const handleScenarioToggle = (scenario: keyof typeof scenarios) => {
    setScenarios((prev) => ({ ...prev, [scenario]: !prev[scenario] }));
    toast.success(`Scenario: ${scenario.replace(/([A-Z])/g, " $1")} ${scenarios[scenario] ? "disabled" : "enabled"}`);
  };

  const handleReset = () => {
    setScenarios({
      trafficJam: false,
      concert: false,
      nightMode: false,
      rainEvent: false,
    });
    setSensors({
      airQuality: 85,
      noise: 45,
      soilMoisture: 70,
      lightLevel: 90,
    });
    toast.info("Simulation reset to default state");
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
            <h1 className="text-3xl font-bold text-foreground">Admin Simulator</h1>
            <p className="text-muted-foreground">Control campus simulation scenarios</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isSimulating ? "destructive" : "default"}
              onClick={() => {
                setIsSimulating(!isSimulating);
                toast[isSimulating ? "warning" : "success"](
                  isSimulating ? "Simulation paused" : "Simulation started"
                );
              }}
            >
              {isSimulating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isSimulating ? "Pause" : "Start"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Scenario Controls */}
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Event Scenarios</h3>
              <p className="text-sm text-muted-foreground">Trigger campus events to test routing</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-eco-orange" />
                  <div>
                    <Label className="font-medium">Traffic Jam at Gate</Label>
                    <p className="text-xs text-muted-foreground">Increases carbon hotspot</p>
                  </div>
                </div>
                <Switch
                  checked={scenarios.trafficJam}
                  onCheckedChange={() => handleScenarioToggle("trafficJam")}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-eco-amber" />
                  <div>
                    <Label className="font-medium">Concert Event</Label>
                    <p className="text-xs text-muted-foreground">High crowd density zone</p>
                  </div>
                </div>
                <Switch
                  checked={scenarios.concert}
                  onCheckedChange={() => handleScenarioToggle("concert")}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-primary" />
                  <div>
                    <Label className="font-medium">Night Mode (Lights Off)</Label>
                    <p className="text-xs text-muted-foreground">Creates dark zones</p>
                  </div>
                </div>
                <Switch
                  checked={scenarios.nightMode}
                  onCheckedChange={() => handleScenarioToggle("nightMode")}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-eco-teal" />
                  <div>
                    <Label className="font-medium">Rain Event</Label>
                    <p className="text-xs text-muted-foreground">Affects soil moisture</p>
                  </div>
                </div>
                <Switch
                  checked={scenarios.rainEvent}
                  onCheckedChange={() => handleScenarioToggle("rainEvent")}
                />
              </div>
            </div>
          </Card>

          {/* IoT Sensor Controls */}
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">IoT Sensor Simulation</h3>
              <p className="text-sm text-muted-foreground">Adjust environmental parameters</p>
            </div>

            <div className="space-y-6">
              {Object.entries(sensors).map(([key, value]) => (
                <div key={key} className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                    <span className="text-sm font-bold text-primary">{value}%</span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(vals) => setSensors((prev) => ({ ...prev, [key]: vals[0] }))}
                    max={100}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* What-If Scenarios */}
          <Card className="lg:col-span-2 p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">"What If" Scenarios</h3>
              <p className="text-sm text-muted-foreground">
                Simulate behavioral changes and see instant impact
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col items-start">
                <span className="font-semibold text-foreground mb-1">50% Switch to Bus</span>
                <span className="text-xs text-muted-foreground text-left">
                  Reduce carbon emissions by 35%
                </span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col items-start">
                <span className="font-semibold text-foreground mb-1">EV Adoption +30%</span>
                <span className="text-xs text-muted-foreground text-left">
                  Lower CO₂ hotspots significantly
                </span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col items-start">
                <span className="font-semibold text-foreground mb-1">Plant 100 Trees</span>
                <span className="text-xs text-muted-foreground text-left">
                  Improve NDVI by 0.15 points
                </span>
              </Button>
            </div>
          </Card>

          {/* Export & Reports */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Export & Reports</h3>
                <p className="text-sm text-muted-foreground">Generate comprehensive analysis</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Export JSON</Button>
                <Button variant="secondary">Generate PDF</Button>
                <Button>Email Report</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSimulator;
