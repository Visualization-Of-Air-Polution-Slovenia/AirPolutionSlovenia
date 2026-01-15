export const LOCATIONS = [
  { id: '@13353', label: 'Ljubljana - Bežigrad' },
  { id: '@13352', label: 'Maribor - Titova' },
  { id: '@5135', label: 'Celje' },
  { id: '@5140', label: 'Koper' },
  { id: '@13356', label: 'Kranj' },
  { id: 'A467122', label: 'Zgornja Bistrica' },
  { id: '@13341', label: 'Novo mesto' },
  { id: '@13351', label: 'Ptuj' },
  { id: '@5137', label: 'Nova Gorica' },
  { id: '@5139', label: 'Zagorje' },
] as const;

export type LocationId = typeof LOCATIONS[number]['id'];
