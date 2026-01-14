/**
 * API Service for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;

  constructor(
    status: number,
    message: string,
  ) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }

  /** Returns true if the error is retryable (503 = backend starting up) */
  get isRetryable(): boolean {
    return this.status === 503;
  }
}

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
    throw new ApiError(
      response.status,
      response.status === 503
        ? 'Backend is starting up, please wait...'
        : `API Error (${response.status}): ${errorBody || response.statusText}`,
    );
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
  aqi?: number;
  dominantPollutant?: string;
  city?: {
    name: string;
    geo: [string, string];
  };
  pollutants?: {
    pm10?: number;
    pm25?: number;
    no2?: number;
    o3?: number;
    co?: number;
    so2?: number;
  };
  weather?: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    wind?: number;
  };
  time?: {
    local: string;
    iso: string;
  };
  forecast?: {
    pm10?: ForecastDay[];
    "pm2.5"?: ForecastDay[];
    o3?: ForecastDay[];
    no2?: ForecastDay[];
  };
}

export type OmLocationTimeData = {
  latitude: number;
  longitude: number;
  time: string[] // ISO timestamps;
  pm10: number[];
  "pm2.5": number[];
  o3: number[];
  no2: number[];
};

export interface CityDataResponse {
  city: string;
  data: SimplifiedCityData;
}

export interface SloveniaDataResponse {
  data: SimplifiedCityData[];
}

export type OmSloveniaDataResponse = {
  data: OmLocationTimeData[];
};


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

/** 
 * Get pollution forecast data for all Slovenian locations
 */
export function getSloveniaForecastData(): Promise<OmSloveniaDataResponse> {
  return fetchApi<OmSloveniaDataResponse>('/v2/sloveniaData');
}