import { TrendingDown, Droplets, Wind, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

/**
 * StatsPanel - Real-time campus sustainability metrics
 * Displays daily impact, environmental stats, and eco-score
 */
const StatsPanel = () => {
  const stats = [
    {
      label: "CO₂ Saved Today",
      value: "47.3 kg",
      icon: TrendingDown,
      color: "text-eco-green",
      progress: 68,
      progressColor: "bg-eco-green",
    },
    {
      label: "Water Conserved",
      value: "1,240 L",
      icon: Droplets,
      color: "text-eco-teal",
      progress: 82,
      progressColor: "bg-eco-teal",
    },
    {
      label: "Air Quality Index",
      value: "Good (85)",
      icon: Wind,
      color: "text-primary",
      progress: 85,
      progressColor: "bg-primary",
    },
    {
      label: "Your Eco-Score",
      value: "2,458 pts",
      icon: Award,
      color: "text-eco-amber",
      progress: 92,
      progressColor: "bg-eco-amber",
    },
  ];

  return (
    <Card className="w-80 p-4 bg-card/90 backdrop-blur-md border-border shadow-card animate-fade-in">
      <div className="space-y-3">
        <div className="pb-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Campus Impact</h3>
          <p className="text-xs text-muted-foreground">Live sustainability metrics</p>
        </div>

        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <Progress value={stat.progress} className="h-1.5" />
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Updated <span className="text-primary font-medium">just now</span>
        </p>
      </div>
    </Card>
  );
};

export default StatsPanel;
