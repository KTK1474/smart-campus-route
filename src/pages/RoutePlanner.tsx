import { useState } from "react";
import { ArrowLeft, Navigation, Leaf, Shield, Zap, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * RoutePlanner - Dual-route comparison interface
 * Shows eco-optimized route vs safest route with preference sliders
 */
const RoutePlanner = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("walk");
  const [preferences, setPreferences] = useState({
    speed: 50,
    cleanAir: 50,
    quiet: 50,
    avoidDark: 50,
  });

  const routes = {
    eco: {
      name: "Eco-Optimized Route",
      icon: Leaf,
      color: "eco-green",
      distance: "2.4 km",
      time: "18 min",
      co2: "0.05 kg",
      calories: "120 kcal",
      greenIndex: "0.82",
      parking: "Lot B (12 spots)",
    },
    safe: {
      name: "Safest Route",
      icon: Shield,
      color: "eco-teal",
      distance: "2.7 km",
      time: "21 min",
      co2: "0.08 kg",
      calories: "135 kcal",
      greenIndex: "0.68",
      lighting: "98% lit",
      cctv: "95% coverage",
    },
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Route Planner</h1>
            <p className="text-muted-foreground">Find your perfect path with smart routing</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <Card className="lg:col-span-1 p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="from">From</Label>
                <Input id="from" placeholder="Start location" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Input id="to" placeholder="Destination" className="mt-2" />
              </div>
            </div>

            {/* Mode Selector */}
            <div className="space-y-3">
              <Label>Travel Mode</Label>
              <RadioGroup value={mode} onValueChange={setMode}>
                {["walk", "cycle", "car", "ev", "shuttle"].map((m) => (
                  <div key={m} className="flex items-center space-x-2">
                    <RadioGroupItem value={m} id={m} />
                    <Label htmlFor={m} className="capitalize cursor-pointer">
                      {m}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Preference Sliders */}
            <div className="space-y-4">
              <Label>Route Preferences</Label>
              {Object.entries(preferences).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-foreground font-medium">{value}%</span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(vals) =>
                      setPreferences((prev) => ({ ...prev, [key]: vals[0] }))
                    }
                    max={100}
                    step={1}
                  />
                </div>
              ))}
            </div>

            <Button className="w-full" size="lg">
              <Navigation className="w-4 h-4 mr-2" />
              Find Routes
            </Button>
          </Card>

          {/* Route Cards */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {/* Eco Route */}
            <Card className="p-6 space-y-4 border-eco-green hover:shadow-glow transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{routes.eco.name}</h3>
                  <p className="text-sm text-muted-foreground">Lowest carbon footprint</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Distance</span>
                  <span className="font-bold text-foreground">{routes.eco.distance}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Time</span>
                  <span className="font-bold text-foreground">{routes.eco.time}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <span className="text-sm text-muted-foreground">CO₂ Emissions</span>
                  <span className="font-bold text-primary">{routes.eco.co2}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Calories Burned</span>
                  <span className="font-bold text-foreground">{routes.eco.calories}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-eco-green/10 rounded-lg">
                  <span className="text-sm text-muted-foreground">Green Index</span>
                  <span className="font-bold text-eco-green">{routes.eco.greenIndex}</span>
                </div>
              </div>

              <Button className="w-full" variant="default">
                Follow Eco Route
              </Button>
            </Card>

            {/* Safe Route */}
            <Card className="p-6 space-y-4 border-eco-teal hover:shadow-glow transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{routes.safe.name}</h3>
                  <p className="text-sm text-muted-foreground">Maximum safety priority</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Distance</span>
                  <span className="font-bold text-foreground">{routes.safe.distance}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Time</span>
                  <span className="font-bold text-foreground">{routes.safe.time}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">CO₂ Emissions</span>
                  <span className="font-bold text-foreground">{routes.safe.co2}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                  <span className="text-sm text-muted-foreground">Lighting</span>
                  <span className="font-bold text-secondary">{routes.safe.lighting}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                  <span className="text-sm text-muted-foreground">CCTV Coverage</span>
                  <span className="font-bold text-secondary">{routes.safe.cctv}</span>
                </div>
              </div>

              <Button className="w-full" variant="secondary">
                Follow Safe Route
              </Button>
            </Card>
          </div>
        </div>

        {/* Carbon Comparison */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Carbon Impact Comparison</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { mode: "Walk/Cycle", co2: "0 kg", cost: "₹0", color: "eco-green" },
              { mode: "EV/Shuttle", co2: "0.12 kg", cost: "₹8", color: "eco-teal" },
              { mode: "Bus", co2: "0.35 kg", cost: "₹15", color: "eco-amber" },
              { mode: "Car", co2: "0.89 kg", cost: "₹45", color: "eco-orange" },
            ].map((item) => (
              <Card key={item.mode} className={`p-4 border-${item.color}`}>
                <div className="text-center space-y-2">
                  <h4 className="font-semibold text-foreground">{item.mode}</h4>
                  <div className={`text-2xl font-bold text-${item.color}`}>{item.co2}</div>
                  <p className="text-sm text-muted-foreground">Cost: {item.cost}</p>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoutePlanner;
