import { create } from 'zustand';

export type Theme = 'light' | 'dark';
export type PollutantType = 'pm10' | 'pm2.5' | 'no2' | 'o3';

interface AppState {
  theme: Theme;
  selectedRegion: string | null;
  pollutionType: PollutantType;
  toggleTheme: () => void;
  setSelectedRegion: (region: string | null) => void;
  setPollutionType: (type: PollutantType) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  selectedRegion: null,
  pollutionType: 'pm10',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setPollutionType: (type) => set({ pollutionType: type }),
}));
