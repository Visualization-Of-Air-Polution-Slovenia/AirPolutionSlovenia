/**
 * API Service for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Base fetch wrapper with error handling
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error (${response.status}): ${errorBody || response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// Types (matching backend SimplifiedCityData)
// ============================================================================

export interface ForecastDay {
  avg: number;
  day: string;
  max: number;
  min: number;
}

export interface SimplifiedCityData {
  aqi: number;
  dominantPollutant: string;
  city: {
    name: string;
    geo: [number, number];
  };
  pollutants: {
    pm10?: number;
    pm25?: number;
    no2?: number;
    o3?: number;
    co?: number;
    so2?: number;
  };
  weather: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    wind?: number;
  };
  time: {
    local: string;
    iso: string;
  };
  forecast?: {
    pm10?: ForecastDay[];
    pm25?: ForecastDay[];
    o3?: ForecastDay[];
  };
}

export interface CityDataResponse {
  city: string;
  data: SimplifiedCityData;
}

export interface PingResponse {
  message: string;
  time: string;
}

// ============================================================================
// API Methods
// ============================================================================

/**
 * Health check endpoint
 */
export function ping(): Promise<PingResponse> {
  return fetchApi<PingResponse>('/ping');
}

/**
 * Get pollution data for a specific city
 */
export function getCityData(cityName: string): Promise<CityDataResponse> {
  return fetchApi<CityDataResponse>(`/city/${encodeURIComponent(cityName)}`);
}
