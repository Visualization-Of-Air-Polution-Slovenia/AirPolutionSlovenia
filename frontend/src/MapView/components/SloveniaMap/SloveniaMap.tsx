import 'leaflet/dist/leaflet.css';

import L, { type LatLngExpression } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, CircleMarker } from 'react-leaflet';
import { useEffect } from 'react';

import styles from './SloveniaMap.module.css';
import type { OmLocationTimeData } from '@/Services/api';
import { useAppStore, type PollutantType } from '@/store/useStore';
import { HeatLayer, type HeatPoint } from './HeatLayer';


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
// Green (Good) -> Yellow (Moderate) -> Orange (Unhealthy) -> Red (Bad)
const STANDARD_HEAT_GRADIENT = {
  0.0: 'lime',
  0.4: '#ffe600', // Yellow
  0.7: '#ff9900', // Orange
  1.0: '#ff0000'  // Red 
};

const getHeatMaxValue = (pollutant: PollutantType): number => {
  // Adjusted thresholds for softer visualization
  switch (pollutant) {
    case 'pm10': return 150; 
    case 'pm2.5': return 80; 
    case 'o3': return 240;   
    case 'no2': return 200;  
    default: return 150;
  }
}

const findClosestCityKey = (lat: number, lng: number, cities: SloveniaMapCity[]): string | undefined => {
  if (cities.length === 0) return undefined;
  
  let bestKey = undefined;
  let minDistSq = Infinity;

  for (const c of cities) {
    const dSq = (c.position.lat - lat) ** 2 + (c.position.lng - lng) ** 2;
    if (dSq < minDistSq) {
      minDistSq = dSq;
      bestKey = c.key;
    }
  }
  return bestKey;
};

const FlyToSelectedCity = ({ selected, zoom }: { selected: LatLngExpression; zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(selected, zoom ?? map.getZoom(), { animate: false });
  }, [map, selected, zoom]);
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

  const heatPoints: HeatPoint[] = sloveniaData
    .map((p) => {
      const v = getIntensityForTypeAtTime(p, pollutionType, selectedTimeIso);
      return [p.latitude, p.longitude, v] as HeatPoint;
    })
    .filter(([, , v]) => Number.isFinite(v) && v > 0);

  const selectedCity = cities.find((c) => c.key === selectedCityKey);
  const selectedPos: LatLngExpression | null = selectedCity ? [selectedCity.position.lat, selectedCity.position.lng] : null;

  return (
    <div className={`${styles.wrap} ${showGrayscale ? styles.grayscale : ''}`} aria-label="Map">
      <MapContainer className={styles.map} center={center} zoom={zoom} scrollWheelZoom>
        <TileLayer url={tileUrl} attribution={tileAttribution} />
        
        {selectedPos ? <FlyToSelectedCity selected={selectedPos} zoom={flyToZoom} /> : null}

        {/* Heatmap Layer */}
        <HeatLayer 
            key={pollutionType} // Force new instance if pollutant changes, just in case setOptions is flaky in some leaflet versions
            points={heatPoints} 
            max={getHeatMaxValue(pollutionType)} 
            radius={25} 
            blur={25} 
            minOpacity={0.4}
            gradient={STANDARD_HEAT_GRADIENT}
        />

        {/* Unified Interaction Zones for All Cities */}
        {cities.map((city) => (
          <CircleMarker
            key={`city-zone-${city.key}`}
            center={[city.position.lat, city.position.lng]}
            radius={20} 
            eventHandlers={{
              click: () => onSelectCity(city.key),
              mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.1, color: '#333', weight: 1, stroke: true }); },
              mouseout: (e) => { e.target.setStyle({ fillOpacity: 0, weight: 0, stroke: false }); }
            }}
            pathOptions={{ stroke: false, fill: true, fillColor: '#000', fillOpacity: 0 }}
          />
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

