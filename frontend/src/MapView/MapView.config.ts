import type { PollutantType } from '@/store/useStore';

export type CityKey = 'ljubljana' | 'maribor' | 'koper';

export interface CityDefinition {
  key: CityKey;
  name: string;
  subtitle: string;
  mapPosition: { top: string; left: string };
  aqi: { value: number; label: string };
  pollutants: Record<PollutantType, { value: number; unit: string; badge?: 'good' | 'moderate' | 'unhealthy' }>; 
  heroImageUrl?: string;
}

export const CITIES: CityDefinition[] = [
  {
    key: 'ljubljana',
    name: 'Ljubljana',
    subtitle: 'Central Slovenia',
    mapPosition: { top: '45%', left: '48%' },
    aqi: { value: 45, label: 'Good' },
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvP97IOAC5s4mW2rh0ItizQfUEC71zF5tZ3ETMDxJ0lI9ZMVHXRzOwcyYY0gqWpGxh3ma-_PtYD5k17j_J6NaP_iA_tSWuyRpd8UkSFU7OJHJSlgEWaZfNL3nAHQw5TnN7i2wtO8FX35tEbGfc20MCjK9YEO7Dub7kY3-dylgqLFViEGMO2WOBceUo2tSnUDduulgZdCc3Kz3-OdKCPkdOe7GGghYnDydS8N-GBkdgvDyvzkHT_vx9Hp8BscW8xCK1mg4s1s52A_EK',
    pollutants: {
      pm10: { value: 22, unit: 'µg/m³', badge: 'good' },
      'pm2.5': { value: 12, unit: 'µg/m³', badge: 'good' },
      no2: { value: 18, unit: 'µg/m³', badge: 'good' },
      o3: { value: 45, unit: 'µg/m³', badge: 'moderate' },
    },
  },
  {
    key: 'maribor',
    name: 'Maribor',
    subtitle: 'Drava Region',
    mapPosition: { top: '28%', left: '65%' },
    aqi: { value: 62, label: 'Moderate' },
    pollutants: {
      pm10: { value: 31, unit: 'µg/m³', badge: 'moderate' },
      'pm2.5': { value: 19, unit: 'µg/m³', badge: 'moderate' },
      no2: { value: 24, unit: 'µg/m³', badge: 'moderate' },
      o3: { value: 58, unit: 'µg/m³', badge: 'moderate' },
    },
  },
  {
    key: 'koper',
    name: 'Koper',
    subtitle: 'Coastal-Karst',
    mapPosition: { top: '65%', left: '30%' },
    aqi: { value: 38, label: 'Good' },
    pollutants: {
      pm10: { value: 18, unit: 'µg/m³', badge: 'good' },
      'pm2.5': { value: 9, unit: 'µg/m³', badge: 'good' },
      no2: { value: 14, unit: 'µg/m³', badge: 'good' },
      o3: { value: 41, unit: 'µg/m³', badge: 'good' },
    },
  },
];
