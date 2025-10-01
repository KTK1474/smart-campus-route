import { Layers, Leaf, Cloud, MapPin, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * LayerControls - Toggle environmental data layers on the map
 * Controls NDVI (green index), carbon emissions, parking, and safe paths
 */
interface LayerControlsProps {
  activeLayers: {
    ndvi: boolean;
    carbon: boolean;
    parking: boolean;
    safePath: boolean;
  };
  onToggleLayer: (layer: keyof LayerControlsProps["activeLayers"]) => void;
}

const LayerControls = ({ activeLayers, onToggleLayer }: LayerControlsProps) => {
  const layers = [
    {
      id: "ndvi" as const,
      name: "NDVI Green Index",
      icon: Leaf,
      color: "text-eco-green",
      description: "Vegetation health map",
    },
    {
      id: "carbon" as const,
      name: "Carbon Emissions",
      icon: Cloud,
      color: "text-eco-orange",
      description: "CO₂ hotspots",
    },
    {
      id: "parking" as const,
      name: "Parking Status",
      icon: MapPin,
      color: "text-eco-teal",
      description: "Live availability",
    },
    {
      id: "safePath" as const,
      name: "Safe Paths",
      icon: Shield,
      color: "text-secondary",
      description: "Well-lit routes",
    },
  ];

  return (
    <Card className="w-72 p-4 bg-card/90 backdrop-blur-md border-border shadow-card animate-slide-in">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Map Layers</h3>
      </div>

      <div className="space-y-4">
        {layers.map((layer) => {
          const Icon = layer.icon;
          return (
            <div
              key={layer.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon className={`w-5 h-5 ${layer.color}`} />
                <div className="flex-1">
                  <Label
                    htmlFor={layer.id}
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    {layer.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">{layer.description}</p>
                </div>
              </div>
              <Switch
                id={layer.id}
                checked={activeLayers[layer.id]}
                onCheckedChange={() => onToggleLayer(layer.id)}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Toggle layers to visualize campus environmental data
        </p>
      </div>
    </Card>
  );
};

export default LayerControls;
