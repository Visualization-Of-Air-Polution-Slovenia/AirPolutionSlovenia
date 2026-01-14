/**
 * React Query hooks for data fetching
 * Uses @tanstack/react-query for caching, refetching, and state management
 */

import { useQuery } from '@tanstack/react-query';
import { getCityData, getSloveniaForecastData, ping, type CityDataResponse, type OmSloveniaDataResponse, type PingResponse, type SloveniaDataResponse } from './api';

// ============================================================================
// Query Keys
// ============================================================================

export const queryKeys = {
  ping: ['ping'] as const,
  cityData: (cityName: string) => ['cityData', cityName] as const,
  sloveniaData: ['sloveniaData'] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to check backend connectivity
 */
export function usePing() {
  return useQuery<PingResponse, Error>({
    queryKey: queryKeys.ping,
    queryFn: ping,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch pollution data for a city
 */
export function useCityData(cityName: string | null) {
  return useQuery<CityDataResponse, Error>({
    queryKey: queryKeys.cityData(cityName ?? ''),
    queryFn: () => getCityData(cityName!),
    enabled: !!cityName, // Only fetch when cityName is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch pollution data for all Slovenian locations
 */
export function useSloveniaData() {
  return useQuery<OmSloveniaDataResponse, Error>({
    queryKey: queryKeys.sloveniaData,
    queryFn: () => getSloveniaForecastData(),
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}