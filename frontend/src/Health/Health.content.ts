export const HealthContent = {
  label: 'Health Impact Analysis',
  title: {
    before: 'Understanding the',
    highlight: 'Health Risks',
    after: 'of Air Pollution',
  },
  intro:
    'Long-term exposure to polluted air can have permanent health effects. Explore the research, assess your personal risk, and learn how to protect yourself.',
  alert: {
    label: 'Current Local Alert',
    value: 'Moderate Ozone Levels',
  },
  sections: {
    systemic: 'Systemic Health Effects',
    research: 'Latest Research Findings',
  },
};

export interface SystemicCard {
  icon: string;
  title: string;
  badge: string;
  tone: 'info' | 'warning' | 'danger' | 'neutral';
  border: string;
  body: string;
  tags: string[];
}

export const SystemicCards = [
  {
    icon: 'pulmonology',
    title: 'Respiratory System',
    badge: 'High Correlation',
    tone: 'info',
    border: 'primary',
    body:
      'Pollutants like PM2.5 and Ozone can cause inflammation, reduce lung function, and aggravate asthma and other chronic lung diseases.',
    tags: ['Asthma', 'COPD', 'Bronchitis'],
  },
  {
    icon: 'cardiology',
    title: 'Cardiovascular Health',
    badge: 'Critical Risk',
    tone: 'danger',
    border: 'danger',
    body:
      'Fine particulate matter can enter the bloodstream, leading to plaque buildup, increased blood pressure, and higher risk of stroke.',
    tags: ['Stroke', 'Hypertension', 'Heart Disease'],
  },
  {
    icon: 'psychology',
    title: 'Cognitive Function',
    badge: 'Emerging Research',
    tone: 'warning',
    border: 'warning',
    body:
      'Recent studies link long-term pollution exposure to neuroinflammation, cognitive decline, and increased risk of neurodegenerative diseases.',
    tags: ['Dementia', 'Development'],
  },
  {
    icon: 'hourglass_bottom',
    title: 'Life Expectancy',
    badge: 'Global Impact',
    tone: 'neutral',
    border: 'text',
    body:
      'Air pollution is a major contributor to premature mortality worldwide, reducing average life expectancy by increasing systemic stress on the body.',
    tags: ['Premature Death', 'Immunity'],
  },
] as const;

export const ResearchLinks = [
  {
    title: 'The Link Between NO₂ and Childhood Asthma',
    desc:
      'A comprehensive study of 10,000 children across Europe reveals a direct correlation between nitrogen dioxide levels near schools and asthma onset.',
    meta: ['Journal of Respiratory Medicine', 'Oct 2023'],
  },
  {
    title: 'Ozone Levels and Cardiovascular Events in Summer',
    desc:
      'Data suggests a rise in hospital admissions for heart conditions during peak ozone alert days in urban centers.',
    meta: ['Public Health Review', 'Jun 2024'],
  },
] as const;
