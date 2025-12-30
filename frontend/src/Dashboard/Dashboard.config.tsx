import type { PollutantType } from '@/store/useStore';

export const POLLUTION_TYPES: PollutantType[] = ['pm10', 'pm2.5', 'no2', 'o3'];

export const POLLUTION_TABS: Array<{ type: PollutantType; label: string; icon: string }> = [
  { type: 'pm2.5', label: 'PM₂.₅', icon: 'grain' },
  { type: 'pm10', label: 'PM₁₀', icon: 'blur_on' },
  { type: 'no2', label: 'NO₂', icon: 'cloud' },
  { type: 'o3', label: 'O₃', icon: 'wb_sunny' },
];

export const CITY_OPTIONS = ['Ljubljana, SI', 'Maribor, SI', 'Kranj, SI', 'Koper, SI'] as const;
