import 'leaflet/dist/leaflet.css';

import L, { type LatLngExpression } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, Circle } from 'react-leaflet';
import { useEffect } from 'react';

import styles from './SloveniaMap.module.css';
import type { OmLocationTimeData } from '@/Services/api';
import { useAppStore, type PollutantType } from '@/store/useStore';


export type SloveniaMapCity = {
  key: string;
  name: string;
  position: { lat: number; lng: number };
};

export type SloveniaMapProps = {
  center: LatLngExpression;
  zoom: number;
  flyToZoom?: number;
  tileUrl: string;
  tileAttribution: string;
  cities: SloveniaMapCity[];
  selectedCityKey: string;
  onSelectCity: (cityKey: string) => void;
  sloveniaData: OmLocationTimeData[];
  selectedTimeIso: string; // ISO timestamp (hour precision)
  showGrayscale: boolean;
  showLabels: boolean;
};

// Custom icon for city labels
const createLabelIcon = (name: string, show: boolean) => {
   return L.divIcon({
     className: `${styles.cityLabelIcon} ${show ? styles.cityLabelVisible : ''}`,
     html: `<div class="${styles.cityLabelText}">${name}</div>`,
     iconSize: [100, 20], // Wide enough for text
     iconAnchor: [50, 10] // Center
   });
};

// Standard unified AQI-like gradient for all pollutants
// Higher-contrast palette: Green -> Yellow -> Orange -> Red -> Dark Red
const STANDARD_HEAT_GRADIENT = {
  0.0: '#2e7d32',  // green
  0.15: '#f9a825', // yellow
  0.30: '#f57c00', // orange
  0.50: '#e53935', // red
  0.80: '#b71c1c'  // dark red
};

const getHeatMaxValue = (pollutant: PollutantType): number => {
  // Tighter thresholds so moderate values actually show up as Yellow/Orange
  switch (pollutant) {
    case 'pm10': return 100;     // Daily limit is 50, so 50 will be 0.5 (Red)
    case 'pm2.5': return 60;     // Daily guidance around 25-50. 30 will be 0.5 (Red)
    case 'o3': return 180;       // 1h threshold is 180 (Warning) -> 1.0 (Dark Red)
    case 'no2': return 150;      // 1h threshold 200. 
    default: return 100;
  }
}

const FlyToSelectedCity = ({ selected, zoom }: { selected: LatLngExpression; zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(selected, zoom ?? map.getZoom(), { animate: false });
  }, [map, selected, zoom]);
  return null;
};

// Approximate Slovenia bounding box (SW, NE).
// Used to prevent zooming out too far beyond Slovenia.
const SLOVENIA_BOUNDS: L.LatLngBoundsExpression = [
  [45.42, 13.38],
  [46.88, 16.62]
];

// Expand bounds by 25% on each side => total ~1.5x width/height.
const padBounds = (bounds: L.LatLngBounds, padFraction: number) => {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const latSpan = ne.lat - sw.lat;
  const lngSpan = ne.lng - sw.lng;

  return L.latLngBounds(
    [sw.lat - latSpan * padFraction, sw.lng - lngSpan * padFraction],
    [ne.lat + latSpan * padFraction, ne.lng + lngSpan * padFraction]
  );
};

const SLOVENIA_ZOOM_OUT_BOUNDS = padBounds(L.latLngBounds(SLOVENIA_BOUNDS), 0.25);

const ConstrainZoomOut = ({ bounds }: { bounds: L.LatLngBounds }) => {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(bounds);
    // Prevent zooming out beyond the point where these bounds would no longer fill the view.
    const minZoom = map.getBoundsZoom(bounds, false);
    map.setMinZoom(minZoom);
  }, [map, bounds]);

  return null;
};

const closestIndexToTarget = (times: string[], targetIso: string) => {
  if (times.length === 0) return -1;

  const target = Date.parse(targetIso);
  if (!Number.isFinite(target)) return -1;

  let bestIdx = 0;
  let bestDist = Math.abs(Date.parse(times[0]) - target);

  for (let i = 1; i < times.length; i++) {
    const t = Date.parse(times[i]);
    if (!Number.isFinite(t)) continue;

    const dist = Math.abs(t - target);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
};

const getIntensityForTypeAtTime = (p: OmLocationTimeData, pollutionType: PollutantType, targetIso: string) => {
  const series = p[pollutionType];
  if (!Array.isArray(series) || series.length === 0) return 0;

  const idx = closestIndexToTarget(p.time, targetIso);
  if (idx < 0 || idx >= series.length) return 0;

  const v = series[idx];
  return Number.isFinite(v) ? v : 0;
};

const normalizeHeatIntensity = (rawValue: number, scaleMax: number): number => {
  if (!Number.isFinite(rawValue) || rawValue <= 0) return 0;
  if (!Number.isFinite(scaleMax) || scaleMax <= 0) return 0;
  return Math.max(0, Math.min(1, rawValue / scaleMax));
};

const getColorForNormalizedIntensity = (t: number): string => {
  if (!Number.isFinite(t) || t <= 0) return 'transparent';
  if (t < 0.15) return STANDARD_HEAT_GRADIENT[0.0];
  if (t < 0.30) return STANDARD_HEAT_GRADIENT[0.15];
  if (t < 0.50) return STANDARD_HEAT_GRADIENT[0.30];
  if (t < 0.80) return STANDARD_HEAT_GRADIENT[0.50];
  return STANDARD_HEAT_GRADIENT[0.80];
};

const findNearestLocation = (lat: number, lng: number, data: OmLocationTimeData[]) => {
  if (!Array.isArray(data) || data.length === 0) return undefined;

  let best: OmLocationTimeData | undefined;
  let bestDistSq = Infinity;

  for (const p of data) {
    const dLat = p.latitude - lat;
    const dLng = p.longitude - lng;
    const dSq = dLat * dLat + dLng * dLng;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      best = p;
    }
  }

  return best;
};

export const SloveniaMap = ({
  center,
  zoom,
  flyToZoom,
  tileUrl,
  tileAttribution,
  cities,
  selectedCityKey,
  onSelectCity,
  sloveniaData,
  selectedTimeIso,
  showGrayscale,
  showLabels
}: SloveniaMapProps) => {
  const { pollutionType } = useAppStore();

  // IMPORTANT: Use dynamic scaling per time-slice so colors clearly change when
  // the selected pollutant OR selected hour changes.
  const rawValues = sloveniaData.map((p) => getIntensityForTypeAtTime(p, pollutionType, selectedTimeIso));
  const timeSliceMax = rawValues.reduce((m, v) => (Number.isFinite(v) ? Math.max(m, v) : m), 0);
  const fallbackMax = getHeatMaxValue(pollutionType);
  const scaleMax = timeSliceMax > 0 ? timeSliceMax : fallbackMax;

  const selectedCity = cities.find((c) => c.key === selectedCityKey);
  const selectedPos: LatLngExpression | null = selectedCity ? [selectedCity.position.lat, selectedCity.position.lng] : null;

  // These are the SVG paths you pasted (<path class="leaflet-interactive" ...>).
  // They're the Leaflet circle overlays (not the leaflet.heat canvas). We color them based on
  // selected pollutant + selected time so they visually track the same logic as the sidebar.
  const cityOverlayBaseOpacity = 0.34;
  const cityOverlayBaseStrokeOpacity = 0.30;

  // Fixed real-world size (meters). This makes circles look bigger when you zoom in,
  // and smaller when you zoom out, while representing the same geographic area.
  const cityCircleRadiusMeters = 6000;

  return (
    <div className={`${styles.wrap} ${showGrayscale ? styles.grayscale : ''}`} aria-label="Map">
      <MapContainer
        className={styles.map}
        center={center}
        zoom={zoom}
        scrollWheelZoom
        maxBounds={SLOVENIA_ZOOM_OUT_BOUNDS}
        maxBoundsViscosity={1.0}
      >
        <ConstrainZoomOut bounds={SLOVENIA_ZOOM_OUT_BOUNDS} />
        <TileLayer url={tileUrl} attribution={tileAttribution} />
        
        {selectedPos ? <FlyToSelectedCity selected={selectedPos} zoom={flyToZoom} /> : null}

        {/* Unified Interaction Zones for All Cities */}
        {cities.map((city) => (
          (() => {
            const nearest = findNearestLocation(city.position.lat, city.position.lng, sloveniaData);
            const raw = nearest ? getIntensityForTypeAtTime(nearest, pollutionType, selectedTimeIso) : 0;
            const normalized = normalizeHeatIntensity(raw, scaleMax);
            const fillColor = getColorForNormalizedIntensity(normalized);
            const fillOpacity =
              normalized > 0
                ? Math.min(0.62, cityOverlayBaseOpacity + normalized * 0.26)
                : 0;
            const strokeOpacity =
              normalized > 0
                ? Math.min(0.65, cityOverlayBaseStrokeOpacity + normalized * 0.18)
                : 0;

            return (
          <Circle
            key={`city-zone-${city.key}`}
            center={[city.position.lat, city.position.lng]}
            radius={cityCircleRadiusMeters}
            eventHandlers={{
              click: () => onSelectCity(city.key),
              mouseover: (e) => {
                e.target.setStyle({
                  fillOpacity: Math.min(0.5, fillOpacity + 0.18),
                  opacity: Math.min(0.6, strokeOpacity + 0.25),
                  color: 'rgba(0,0,0,0.35)',
                  weight: 1.6,
                  stroke: true
                });
              },
              mouseout: (e) => {
                e.target.setStyle({
                  fillOpacity,
                  opacity: strokeOpacity,
                  color: 'rgba(0,0,0,0.25)',
                  weight: 1.25,
                  stroke: normalized > 0
                });
              }
            }}
            pathOptions={{
              stroke: normalized > 0,
              color: 'rgba(0,0,0,0.25)',
              opacity: strokeOpacity,
              weight: 1.25,
              fill: true,
              fillColor,
              fillOpacity
            }}
          />
            );
          })()
        ))}

        {/* Labels Layer (Using Marker with custom divIcon) */}
        {cities.map((city) => (
           <Marker
             key={`city-label-${city.key}-${showLabels}`} // Force strict re-render on toggle
             position={[city.position.lat, city.position.lng]}
             icon={createLabelIcon(city.name, showLabels)}
             interactive={false} // Pass through clicks to the CircleMarker below
             zIndexOffset={1000}
           />
        ))}

      </MapContainer>
    </div>
  );
};

