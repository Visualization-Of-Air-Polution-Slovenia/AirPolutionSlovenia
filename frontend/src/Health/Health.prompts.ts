// Health.prompts.ts
export const AIR_QUALITY_LEVELS = {
  GOOD: { max: 50 },
  MODERATE: { max: 100 },
  POOR: { max: Infinity },
} as const;

export type AirQualityTone = 'info' | 'warning' | 'danger';

export const getAirQualityPrompt = (index: number) => {
  if (index <= AIR_QUALITY_LEVELS.GOOD.max)
    return {
      alert: { label: 'Air Quality', value: 'Good', tone: 'info' },
      intro: 'Air quality is good. You can safely spend time outdoors.',
      cardTone: 'info' as AirQualityTone,
    };
  if (index <= AIR_QUALITY_LEVELS.MODERATE.max)
    return {
      alert: { label: 'Air Quality', value: 'Moderate', tone: 'warning' },
      intro: 'Air quality is moderate. Sensitive groups should limit prolonged outdoor activities.',
      cardTone: 'warning' as AirQualityTone,
    };
  return {
    alert: { label: 'Air Quality', value: 'Poor', tone: 'danger' },
    intro: 'Air quality is poor. Limit outdoor activities and stay indoors when possible.',
    cardTone: 'danger' as AirQualityTone,
  };
};
