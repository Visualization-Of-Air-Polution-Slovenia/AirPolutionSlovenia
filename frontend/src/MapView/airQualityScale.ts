import type { PollutantType } from '@/store/useStore';

export type AqiBadge = 'good' | 'moderate' | 'unhealthy';

// Higher-contrast palette: Green -> Yellow -> Orange -> Red -> Dark Red
export const STANDARD_HEAT_GRADIENT = {
  0.0: '#2e7d32', // green
  0.15: '#f9a825', // yellow
  0.30: '#f57c00', // orange
  0.50: '#e53935', // red
  0.80: '#b71c1c' // dark red
} as const;

export const getHeatMaxValue = (pollutant: PollutantType): number => {
  // Absolute-ish scaling (not per-time-slice), tuned so moderate values show up.
  switch (pollutant) {
    case 'pm10':
      return 100;
    case 'pm2.5':
      return 60;
    case 'o3':
      return 180;
    case 'no2':
      return 150;
    default:
      return 100;
  }
};

export const normalizeHeatIntensity = (rawValue: number, scaleMax: number): number => {
  if (!Number.isFinite(rawValue) || rawValue <= 0) return 0;
  if (!Number.isFinite(scaleMax) || scaleMax <= 0) return 0;
  return Math.max(0, Math.min(1, rawValue / scaleMax));
};

export const getColorForNormalizedIntensity = (t: number): string => {
  if (!Number.isFinite(t) || t <= 0) return 'transparent';
  if (t < 0.15) return STANDARD_HEAT_GRADIENT[0.0];
  if (t < 0.30) return STANDARD_HEAT_GRADIENT[0.15];
  if (t < 0.50) return STANDARD_HEAT_GRADIENT[0.30];
  if (t < 0.80) return STANDARD_HEAT_GRADIENT[0.50];
  return STANDARD_HEAT_GRADIENT[0.80];
};

export const getBadgeForNormalizedIntensity = (t: number): AqiBadge => {
  if (!Number.isFinite(t) || t <= 0) return 'good';
  if (t < 0.30) return 'good';
  if (t < 0.80) return 'moderate';
  return 'unhealthy';
};
