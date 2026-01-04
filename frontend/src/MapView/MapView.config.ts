import type { PollutantType } from '@/store/useStore';

export const CitySidebarPlaceholderText = 'Details for this city are not available yet.';

export type CityKey =
  | 'ljubljana'
  | 'maribor'
  | 'koper'
  | 'celje'
  | 'kranj'
  | 'velenje'
  | 'novo_mesto'
  | 'ptuj'
  | 'nova_gorica'
  | 'murska_sobota';

export interface CityDefinition {
  key: CityKey;
  name: string;
  subtitle: string;
  position: { lat: number; lng: number };
  aqi: { value: number; label: string };
  pollutants: Record<PollutantType, { value: number; unit: string; badge?: 'good' | 'moderate' | 'unhealthy' }>;
  heroImageUrl?: string;
  pinVariant: 'good' | 'moderate' | 'unhealthy';
}
