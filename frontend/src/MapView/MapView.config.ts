import type { PollutantType } from '@/store/useStore';

export const CitySidebarPlaceholderText = 'Details for this city are not available yet.';

export interface PollutantData {
  value: number;
  unit: string;
  badge?: 'good' | 'moderate' | 'unhealthy';
}

export interface CityDefinition {
  key: string;
  name: string;
  subtitle: string;
  position: { lat: number; lng: number };
  /** AQI is null until loaded from API */
  aqi: { value: number; label: string } | null;
  /** Pollutants are optional - only show what's available from API */
  pollutants: Partial<Record<PollutantType, PollutantData>>;
  heroImageUrl?: string;
  pinVariant: 'good' | 'moderate' | 'unhealthy' | null;
  /** Health advice based on AQI level - populated from API */
  healthAdvice?: string;
}
