import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark';
  selectedRegion: string | null;
  pollutionType: 'pm10' | 'pm2.5' | 'no2' | 'o3';
  toggleTheme: () => void;
  setSelectedRegion: (region: string | null) => void;
  setPollutionType: (type: 'pm10' | 'pm2.5' | 'no2' | 'o3') => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  selectedRegion: null,
  pollutionType: 'pm10',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setPollutionType: (type) => set({ pollutionType: type }),
}));
