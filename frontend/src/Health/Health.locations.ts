export const LOCATIONS = [
  { id: 'Ljubljana', label: 'Ljubljana – Bežigrad' },
  { id: 'Maribor', label: 'Maribor – Titova' },
  { id: 'Celje', label: 'Celje' },
  { id: 'Koper', label: 'Koper' },
  { id: 'Kranj', label: 'Kranj' },
  { id: 'Zgornja Bistrica', label: 'Zgornja Bistrica' },
  { id: 'Novo mesto', label: 'Novo mesto' },
  { id: 'Ptuj', label: 'Ptuj' },
  { id: 'Nova Gorica', label: 'Nova Gorica' },
  { id: 'Zagorje', label: 'Zagorje' },
] as const;

export type LocationId = typeof LOCATIONS[number]['id'];
