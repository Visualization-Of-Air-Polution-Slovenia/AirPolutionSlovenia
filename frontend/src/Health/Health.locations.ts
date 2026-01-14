// Health.locations.ts
export const LOCATIONS = [
  { id: 'ljubljana', label: 'Ljubljana – Bežigrad' },
  { id: 'maribor', label: 'Maribor – Titova' },
  { id: 'celje', label: 'Celje' },
  { id: 'koper', label: 'Koper' },
] as const;

export type LocationId = typeof LOCATIONS[number]['id'];
