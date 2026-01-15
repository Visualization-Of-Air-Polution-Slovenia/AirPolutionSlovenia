// Health.dynamic.ts
import { SystemicCards, type SystemicCard } from './Health.content';
export type AirQualityLevel = 'GOOD' | 'MODERATE' | 'POOR';

const TAGS_BY_LEVEL: Record<
  AirQualityLevel,
  Record<string, string[]>
> = {
  GOOD: {
    'Respiratory System': ['Normal Breathing', 'Outdoor Safe'],
    'Cardiovascular Health': ['Low Stress', 'Heart Safe'],
    'Cognitive Function': ['Clear Mind', 'Focus'],
    'Life Expectancy': ['Stable', 'Healthy Living'],
  },

  MODERATE: {
    'Respiratory System': ['Irritation', 'Sensitive Groups'],
    'Cardiovascular Health': ['Elevated Pressure', 'At Risk'],
    'Cognitive Function': ['Mild Impact', 'Fatigue'],
    'Life Expectancy': ['Slight Reduction'],
  },

  POOR: {
    'Respiratory System': ['Asthma Risk', 'Shortness of Breath'],
    'Cardiovascular Health': ['Heart Attack Risk', 'Inflammation'],
    'Cognitive Function': ['Cognitive Decline', 'Neuro Risk'],
    'Life Expectancy': ['Premature Death', 'Chronic Exposure'],
  },
};


export const getAirQualityLevel = (index: number): AirQualityLevel => {
  if (index <= 50) return 'GOOD';
  if (index <= 100) return 'MODERATE';
  return 'POOR';
};

export const getDynamicCardContent = (level: AirQualityLevel): SystemicCard[] => {
  const baseCards = SystemicCards.map(
  (c) =>
    ({
    ...c,
    tags: [...c.tags], // make tags mutable
    } as SystemicCard)
  );
  let dynamicCards: SystemicCard[] = [];

  switch (level) {
    case 'GOOD':
      dynamicCards = baseCards.map((c) => {
        const dynamicTags = TAGS_BY_LEVEL[level][c.title] ?? c.tags;
        switch (c.title) {
          case 'Respiratory System':
            return { ...c, badge: 'Low Risk', tone: 'info', body: 'Air quality is good. Respiratory risks are minimal for most people.' };
          case 'Cardiovascular Health':
            return { ...c, badge: 'Low Risk', tone: 'info', body: 'Cardiovascular risks are low under good air quality conditions.' };
          case 'Cognitive Function':
            return { ...c, badge: 'Minimal Risk', tone: 'info', body: 'Cognitive function is not affected under good air conditions.' };
          case 'Life Expectancy':
            return { ...c, badge: 'Normal', tone: 'info', body: 'Life expectancy is not significantly affected by air quality in this range.' };
          default:
            return c;
        }
      });
      dynamicCards.push({
        icon: 'tips_and_updates',
        title: 'Tips & Advice',
        badge: 'Positive',
        tone: 'info',
        border: 'info',
        body: 'Great air quality today! Enjoy outdoor activities, exercise safely, and maintain a healthy lifestyle.',
        tags: ['Wellness', 'Outdoor', 'Exercise'],
      } as SystemicCard); // <-- cast new card too
      break;

    case 'MODERATE':
      dynamicCards = baseCards.map((c) => {
        const dynamicTags = TAGS_BY_LEVEL[level][c.title] ?? c.tags;

        switch (c.title) {
          case 'Respiratory System':
            return { ...c, badge: 'Moderate Risk', tone: 'warning', body: 'Air quality is moderate. Sensitive individuals may experience minor respiratory irritation.', tags: dynamicTags };
          case 'Cardiovascular Health':
            return { ...c, badge: 'Moderate Risk', tone: 'warning', body: 'Prolonged exposure may increase blood pressure or stress on the heart.' };
          case 'Cognitive Function':
            return { ...c, badge: 'Mild Risk', tone: 'warning', body: 'Moderate pollution exposure could slightly affect cognitive performance over time.' };
          case 'Life Expectancy':
            return { ...c, badge: 'Slight Reduction', tone: 'warning', body: 'Life expectancy may slightly decrease with chronic exposure to moderate pollution.' };
          default:
            return c;
        }
      });
      dynamicCards.push({
        icon: 'tips_and_updates',
        title: 'Tips & Advice',
        badge: 'Caution',
        tone: 'warning',
        border: 'warning',
        body: 'Moderate air quality: limit long outdoor activities during peak hours. Exercise indoors or wear a mask if sensitive.',
        tags: ['Wellness', 'Air Quality', 'Exercise'],
      } as SystemicCard);
      break;

    case 'POOR':
      dynamicCards = baseCards.map((c) => {
        const dynamicTags = TAGS_BY_LEVEL[level][c.title] ?? c.tags;

        switch (c.title) {
          case 'Respiratory System':
            return { ...c, badge: 'High Risk', tone: 'danger', body: 'Poor air quality significantly increases respiratory issues and risk of chronic lung disease.' };
          case 'Cardiovascular Health':
            return { ...c, badge: 'High Risk', tone: 'danger', body: 'Fine particles can enter the bloodstream, increasing risk of heart attacks and stroke.' };
          case 'Cognitive Function':
            return { ...c, badge: 'High Risk', tone: 'danger', body: 'Chronic exposure to polluted air can lead to cognitive decline and higher risk of neurodegenerative diseases.' };
          case 'Life Expectancy':
            return { ...c, badge: 'Reduced', tone: 'danger', body: 'Life expectancy can be significantly reduced due to prolonged exposure to high pollution levels.' };
          default:
            return c;
        }
      });
      dynamicCards.push({
        icon: 'tips_and_updates',
        title: 'Tips & Advice',
        badge: 'Important',
        tone: 'danger',
        border: 'danger',
        body: 'Poor air quality: stay indoors if possible, avoid strenuous activity, use air purifiers, and maintain healthy habits.',
        tags: ['Safety', 'Indoor', 'Health'],
      } as SystemicCard);
      break;
  }

  return dynamicCards;
};
