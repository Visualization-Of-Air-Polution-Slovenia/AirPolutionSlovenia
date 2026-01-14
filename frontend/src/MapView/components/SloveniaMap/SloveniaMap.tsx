import 'leaflet/dist/leaflet.css';

import L, { type LatLngExpression } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, CircleMarker, Tooltip, } from 'react-leaflet';
import { useEffect } from 'react';

import styles from './SloveniaMap.module.css';
import type { OmLocationTimeData } from '@/Services/api';
import { useAppStore, type PollutantType } from '@/store/useStore';
import { HeatmapLayer }  from 'react-leaflet-heatmap-layer-v3';


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
};

const markerUrl = '/marker.png';
const markerSelectedUrl = '/marker-selected.png';

const markerSize: [number, number] = [32, 32];

const getDangerLevel = (pollutant: PollutantType, v: number): 0 | 1 | 2 | 3 => {
  if (!Number.isFinite(v)) return 0;

  switch (pollutant) {
    case 'pm10':
      if (v >= 100) return 3;
      if (v >= 50) return 2;
      if (v >= 20) return 1;
      return 0;
    case 'pm2.5':
      if (v >= 50) return 3;
      if (v >= 25) return 2;
      if (v >= 15) return 1;
      return 0;
    case 'o3':
      if (v >= 240) return 3;
      if (v >= 130) return 2;
      if (v >= 50) return 1;
      return 0;
    case 'no2':
      if (v >= 120) return 3;
      if (v >= 90) return 2;
      if (v >= 40) return 1;
      return 0;
    default:
      return 0;
  }
};

const getDangerColors = (level: 0 | 1 | 2 | 3) => {
  // Keep it simple: green → yellow → orange → red
  switch (level) {
    case 0: return { stroke: '#2e7d32', fill: '#66bb6a' };
    case 1: return { stroke: '#f9a825', fill: '#ffee58' };
    case 2: return { stroke: '#ef6c00', fill: '#ffb74d' };
    case 3: return { stroke: '#c62828', fill: '#ef5350' };
  }
};

const createMarkerIcon = (iconUrl: string, className: string, size: [number, number]) =>
  L.icon({
    iconUrl,
    iconSize: size,
    iconAnchor: [Math.round(size[0] / 2), size[1]],
    popupAnchor: [0, -size[1]],
    className,
  });

const FlyToSelectedCity = ({ selected, zoom }: { selected: LatLngExpression; zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(selected, zoom ?? map.getZoom(), { animate: true, duration: 0.6 });
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
  selectedTimeIso
}: SloveniaMapProps) => {
  const { pollutionType } = useAppStore();

  const selectedCity = cities.find((c) => c.key === selectedCityKey);
  const selectedPos: LatLngExpression | null = selectedCity ? [selectedCity.position.lat, selectedCity.position.lng] : null;

  const icon = createMarkerIcon(markerUrl, styles.cityMarker, markerSize);
  const selectedIcon = createMarkerIcon(markerSelectedUrl, `${styles.cityMarker} ${styles.cityMarkerSelected}`, markerSize);

  return (
    <div className={styles.wrap} aria-label="Map">
      <MapContainer className={styles.map} center={center} zoom={zoom} scrollWheelZoom>
        <TileLayer url={tileUrl} attribution={tileAttribution} />
        
        {selectedPos ? <FlyToSelectedCity selected={selectedPos} zoom={flyToZoom} /> : null}

        <HeatmapLayer
          points={sloveniaData.filter((p: OmLocationTimeData) => getIntensityForTypeAtTime(p, pollutionType, selectedTimeIso) !== 0)}
          longitudeExtractor={(p: OmLocationTimeData) => p.longitude}
          latitudeExtractor={(p: OmLocationTimeData) => p.latitude}
          intensityExtractor={(p: OmLocationTimeData) => getIntensityForTypeAtTime(p, pollutionType, selectedTimeIso)}
        />


        {/* Pins for each location in sloveniaData, showing number of particles */}
        {sloveniaData.map((p, idx) => {
          const value = getIntensityForTypeAtTime(p, pollutionType as any, selectedTimeIso);

          if (!Number.isFinite(value) || value === 0) return null;

          const lvl = getDangerLevel(pollutionType, value);
          const { stroke, fill } = getDangerColors(lvl);


          return (
            <CircleMarker
              key={`data-circle-${idx}`}
              center={[p.latitude, p.longitude]}
              radius={10}
              pathOptions={{
                color: stroke,
                weight: 2,
                fillColor: fill,
                fillOpacity: 0.85,
              }}
            >
              <Tooltip
                permanent
                direction="center"
                className={styles.circleLabel}
                opacity={1}
              >
                {Math.round(value)}
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Pins for each city (selection logic) */}
        {cities.map((city) => {
          const pos: LatLngExpression = [city.position.lat, city.position.lng];
          const isSelected = city.key === selectedCityKey;
          return (
            <Marker
              key={city.key}
              position={pos}
              icon={isSelected ? selectedIcon : icon}
              zIndexOffset={isSelected ? 1000 : 0}
              riseOnHover
              eventHandlers={{
                click: () => onSelectCity(city.key),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};
