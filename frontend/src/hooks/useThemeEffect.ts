import { useEffect } from 'react';
import { useAppStore } from '@/store/useStore';

export const useThemeEffect = () => {
  const { theme } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
};
