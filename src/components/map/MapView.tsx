import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

/**
 * MapView - Main interactive map component
 * Displays base map with various environmental layers
 * Integrates with MapmyIndia SDK (placeholder for real implementation)
 */
interface MapViewProps {
  activeLayers: {
    ndvi: boolean;
    carbon: boolean;
    parking: boolean;
    safePath: boolean;
  };
}

const MapView = ({ activeLayers }: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Simulate parking spots for demo
  const parkingSpots = [
    { id: 1, lat: 28.5455, lng: 77.1920, occupied: false },
    { id: 2, lat: 28.5460, lng: 77.1925, occupied: true },
    { id: 3, lat: 28.5465, lng: 77.1915, occupied: false },
    { id: 4, lat: 28.5450, lng: 77.1930, occupied: true },
  ];

  useEffect(() => {
    // Placeholder for MapmyIndia SDK initialization
    // In real implementation: import MapmyIndia SDK and initialize here
    // Add API key from environment or config
    console.log("MapView: Initialize map with layers", activeLayers);
    setMapLoaded(true);

    // Example: 
    // const map = new mappls.Map('map-container', {
    //   center: [28.5455, 77.1920],
    //   zoom: 15
    // });
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      console.log("MapView: Update layers", activeLayers);
      // Update map layers based on activeLayers prop
    }
  }, [activeLayers, mapLoaded]);

  return (
    <div ref={mapContainerRef} className="relative w-full h-full bg-gradient-dark">
      {/* Placeholder Map Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Navigation className="w-16 h-16 mx-auto text-primary/30" />
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Map visualization powered by MapmyIndia
            </p>
            <p className="text-xs text-muted-foreground/60">
              Add MapmyIndia API key in config to enable full map features
            </p>
          </div>
        </div>
      </div>

      {/* NDVI Heatmap Overlay (Simulated) */}
      {activeLayers.ndvi && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-40">
            <defs>
              <radialGradient id="ndvi-grad-1" cx="30%" cy="40%">
                <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ndvi-grad-2" cx="70%" cy="60%">
                <stop offset="0%" stopColor="hsl(160, 60%, 50%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(160, 60%, 50%)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="30%" cy="40%" r="20%" fill="url(#ndvi-grad-1)" />
            <circle cx="70%" cy="60%" r="25%" fill="url(#ndvi-grad-2)" />
          </svg>
        </div>
      )}

      {/* Carbon Heatmap Overlay (Simulated) */}
      {activeLayers.carbon && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-30">
            <defs>
              <radialGradient id="carbon-grad" cx="50%" cy="70%">
                <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="hsl(25, 95%, 53%)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50%" cy="70%" r="15%" fill="url(#carbon-grad)" />
          </svg>
        </div>
      )}

      {/* Parking Markers (Simulated) */}
      {activeLayers.parking && (
        <div className="absolute inset-0 pointer-events-none">
          {parkingSpots.map((spot) => (
            <div
              key={spot.id}
              className="absolute animate-pulse-glow"
              style={{
                left: `${45 + spot.id * 8}%`,
                top: `${40 + spot.id * 5}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  spot.occupied
                    ? "bg-destructive/70 border-2 border-destructive"
                    : "bg-primary/70 border-2 border-primary"
                }`}
              >
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safe Path Overlay (Simulated) */}
      {activeLayers.safePath && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <path
              d="M 20% 80% Q 40% 50%, 60% 40% T 80% 20%"
              stroke="hsl(173, 80%, 40%)"
              strokeWidth="3"
              strokeDasharray="8 4"
              fill="none"
              opacity="0.7"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default MapView;
