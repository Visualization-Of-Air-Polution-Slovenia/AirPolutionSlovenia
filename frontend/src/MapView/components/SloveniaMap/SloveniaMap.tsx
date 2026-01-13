import 'leaflet/dist/leaflet.css';

import 'leaflet.heat/dist/leaflet-heat.js'

import L, { type LatLngExpression } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';

import styles from './SloveniaMap.module.css';
import type { SimplifiedCityData } from '@/Services/api';
import { useAppStore } from '@/store/useStore';
import HeatmapLayer from "react-leaflet-heat-layer";


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
  sloveniaData: SimplifiedCityData[];
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
        <HeatmapLayer
          latlngs={sloveniaData
            .map(data => {
              const forecast = data.forecast?.[pollutionType];
              const value = Array.isArray(forecast) && forecast.length > 0 ? forecast[0].avg : 0;
              const lat = parseFloat(data.city?.geo?.[0] ?? '0');
              const lng = parseFloat(data.city?.geo?.[1] ?? '0');
              return [lat, lng, value];
            })
            .filter(([,, value]) => value !== 0)
          }
        />

        {selectedPos ? <FlyToSelectedCity selected={selectedPos} zoom={flyToZoom} /> : null}

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
