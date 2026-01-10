// ============================================================================
// WAQI API Response Types
// ============================================================================


interface WaqiIaqiValue {
  v: number;
}

interface WaqiIaqi {
  co?: WaqiIaqiValue;
  h?: WaqiIaqiValue;
  no2?: WaqiIaqiValue;
  o3?: WaqiIaqiValue;
  p?: WaqiIaqiValue;
  pm10?: WaqiIaqiValue;
  pm25?: WaqiIaqiValue;
  so2?: WaqiIaqiValue;
  t?: WaqiIaqiValue;
  w?: WaqiIaqiValue;
  wg?: WaqiIaqiValue;
}

interface WaqiTime {
  s: string;
  tz: string;
  v: number;
  iso: string;
}

interface WaqiForecastDay {
  avg: number;
  day: string;
  max: number;
  min: number;
}

interface WaqiForecast {
  daily: {
    o3?: WaqiForecastDay[];
    pm10?: WaqiForecastDay[];
    pm25?: WaqiForecastDay[];
    uvi?: WaqiForecastDay[];
  };
}

interface WaqiData {
  aqi: number;
  idx: number;
  dominentpol: string;
  iaqi: WaqiIaqi;
  time: WaqiTime;
  forecast?: WaqiForecast;
  debug?: { sync: string };
}

interface WaqiResponse {
  status: 'ok' | 'error';
  data: WaqiData | string; // string when error
}

// ============================================================================
// Simplified Response for Frontend
// ============================================================================

export interface SimplifiedCityData {
  aqi: number;
  dominantPollutant: string;
  pollutants: {
    pm10?: number;
    pm25?: number;
    no2?: number;
    o3?: number;
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
    pm10?: WaqiForecastDay[];
    pm25?: WaqiForecastDay[];
    o3?: WaqiForecastDay[];
  };
}

// ============================================================================
// Data Fetching
// ============================================================================

export async function getData(token: string, cityKey: string): Promise<SimplifiedCityData> {
  const res = await fetch(
    `http://api.waqi.info/feed/${encodeURIComponent(cityKey)}/?token=${encodeURIComponent(token)}`
  );

  const json: WaqiResponse = await res.json();

  if (json.status !== 'ok' || typeof json.data === 'string') {
    throw new Error(typeof json.data === 'string' ? json.data : 'Unknown API error');
  }

  const data = json.data;

  return {
    aqi: data.aqi,
    dominantPollutant: data.dominentpol,
    pollutants: {
      pm10: data.iaqi.pm10?.v,
      pm25: data.iaqi.pm25?.v,
      no2: data.iaqi.no2?.v,
      o3: data.iaqi.o3?.v,
    },
    weather: {
      temperature: data.iaqi.t?.v,
      humidity: data.iaqi.h?.v,
      pressure: data.iaqi.p?.v,
      wind: data.iaqi.w?.v,
    },
    time: {
      local: data.time.s,
      iso: data.time.iso,
    },
  };
}