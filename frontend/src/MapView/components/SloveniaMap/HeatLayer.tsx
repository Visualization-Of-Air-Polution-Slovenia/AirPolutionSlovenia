import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

import 'leaflet.heat';

export type HeatPoint = [lat: number, lng: number, intensity: number];

export type HeatLayerProps = {
  points: HeatPoint[];
  max: number;
  radius?: number;
  blur?: number;
  minOpacity?: number;
  gradient?: Record<number, string>;
};

export const HeatLayer = ({
  points,
  max,
  radius = 25,
  blur = 15,
  minOpacity = 0.4,
  gradient
}: HeatLayerProps) => {
  const map = useMap();
  const layerRef = useRef<any>(null);

  // 1. Handle Layer Lifecycle (Create / Destroy / Recreate on heavy prop changes)
  useEffect(() => {
    if (!map) return;

    // Create a new heat layer
    // Note: We use the current 'points' for initialization.
    const layer = (L as any).heatLayer(points, {
      max,
      radius,
      blur,
      minOpacity,
      gradient
    });

    layer.addTo(map);
    layerRef.current = layer;

    // Clean up
    return () => {
      if (map && layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
    // Re-create the layer ONLY if visualization parameters change
    // We intentionally OMIT 'points' to avoid destroying the layer when only data updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, max, radius, blur, minOpacity, gradient]); 

  // 2. Handle Data Updates (Lightweight)
  useEffect(() => {
    // If the layer exists, just update the data points
    // This triggers a redraw without flickering
    if (layerRef.current) {
      layerRef.current.setLatLngs(points);
      // Explicitly request redraw if the plugin supports it or needs it (usually automatic, but safe to call)
      if (typeof (layerRef.current as any).redraw === 'function') {
         (layerRef.current as any).redraw();
      }
    }
  }, [points]);

  return null;
};
