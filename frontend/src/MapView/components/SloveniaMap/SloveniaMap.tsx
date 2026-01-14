import 'leaflet/dist/leaflet.css';

import L, { type LatLngExpression } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
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
            >
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
