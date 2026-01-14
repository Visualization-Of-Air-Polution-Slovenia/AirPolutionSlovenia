import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';

import 'leaflet.heat';

export type HeatPoint = [lat: number, lng: number, intensity: number];

export type HeatLayerProps = {
  points: HeatPoint[];
  max: number;
  radius?: number;
  blur?: number;
  minOpacity?: number;
};

type LeafletHeatLayer = L.Layer & {
  setLatLngs: (latlngs: HeatPoint[]) => void;
  _frame?: number | null;
};

export const HeatLayer = ({
  points,
  max,
  radius = 25,
  blur = 15,
  minOpacity = 0.4,
}: HeatLayerProps) => {
  const map = useMap();
  const layerRef = useRef<LeafletHeatLayer | null>(null);

  const cancelPendingRedraw = (layer: LeafletHeatLayer | null) => {
    const frame = layer?._frame;
    if (typeof frame === 'number') {
      L.Util.cancelAnimFrame(frame);
      if (layer) layer._frame = null;
    }
  };

  const options = useMemo(
    () => ({
      radius,
      blur,
      max,
      minOpacity,
    }),
    [radius, blur, max, minOpacity]
  );

  // (Re)create layer when options change.
  useEffect(() => {
    if (!map) return;

    const layer = (L as unknown as { heatLayer: (pts: HeatPoint[], opts: unknown) => LeafletHeatLayer }).heatLayer(
      points,
      options
    );
    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      // leaflet.heat schedules redraw via requestAnimationFrame; cancel it so
      // we don't crash if a pending redraw fires after the layer is removed.
      cancelPendingRedraw(layer);
      layerRef.current = null;
      map.removeLayer(layer);
    };
  }, [map, options, points]);

  // Update points without recreating the layer.
  useEffect(() => {
    if (!layerRef.current) return;
    cancelPendingRedraw(layerRef.current);
    layerRef.current.setLatLngs(points);
  }, [points]);

  return null;
};
