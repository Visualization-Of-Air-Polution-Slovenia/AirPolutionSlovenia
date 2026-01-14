import { fetchWeatherApi } from "openmeteo";

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

interface WaqiCity {
  name: string;
  geo: [string, string];
}

interface WaqiStationData {
  aqi: number;
  idx: number;
  city: WaqiCity;
  dominentpol: string;
  iaqi: WaqiIaqi;
  time: WaqiTime;
  forecast?: WaqiForecast;
  debug?: { sync: string };
}

export type WaqiLocationData = {
  lat: number;
  lon: number;
  uid: number;
  aqi: string;
  station: {
    name: string;
    time: string;
  }
};

export type OmLocationTimeData = {
  latitude: number;
  longitude: number;
  time: Date[] // ISO timestamps;
  pm10: number[];
  "pm2.5": number[];
  o3: number[];
  no2: number[];
};

interface WaqiResponse<T> {
  status: 'ok' | 'error';
  data: T; // string when error
}

// ============================================================================
// Simplified Response for Frontend
// ============================================================================

export interface SimplifiedCityData {
  aqi?: number;
  dominantPollutant?: string;
  pollutants?: {
    pm10?: number;
    pm25?: number;
    no2?: number;
    o3?: number;
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
    pm10?: WaqiForecastDay[];
    pm25?: WaqiForecastDay[];
    o3?: WaqiForecastDay[];
    uvi?: WaqiForecastDay[];
  };
  city?: WaqiCity;
}

// ============================================================================
// Data Fetching
// ============================================================================

export async function getData(token: string, cityKey: string, forcast = false): Promise<SimplifiedCityData> {
  const res = await fetch(
    `https://api.waqi.info/feed/${encodeURIComponent(cityKey)}/?token=${encodeURIComponent(token)}`
  );

  const json: WaqiResponse<WaqiStationData | string> = await res.json();

  if (json.status !== 'ok' || typeof json.data === 'string') {
    throw new Error(typeof json.data === 'string' ? json.data : 'Unknown API error');
  }

  const data = json.data;

  if (forcast) {
    return {
      city: data.city,
      forecast: data.forecast?.daily,
    };
  }

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

export async function getSloveniaStations(token: string): Promise<WaqiLocationData[]> {
  const latlng = "46.8766,13.2812,45.4215,16.5961"; // Slovenia bounding box
  const res = await fetch(
    `https://api.waqi.info/map/bounds/?token=${encodeURIComponent(token)}&latlng=${encodeURIComponent(latlng)}`
  );

  const json: WaqiResponse<WaqiLocationData[] | string> = await res.json();

  if (json.status !== 'ok' || typeof json.data === 'string') {
    throw new Error(typeof json.data === 'string' ? json.data : 'Unknown API error');
  }

  const data = json.data;

  return data.filter((station) => station.station.name.endsWith("Slovenia"));
}

export async function newSloveniaData(locations: WaqiLocationData[]): Promise<OmLocationTimeData[]> {
  const params = {
    latitude: locations.map(loc => loc.lat).join(','),
    longitude: locations.map(loc => loc.lon).join(','),
    hourly: ["pm10", "pm2_5", "ozone", "nitrogen_dioxide"],
    timezone: "Europe/Berlin",
    past_days: 3,
  };

  const url = "https://air-quality-api.open-meteo.com/v1/air-quality";
  const responses = await fetchWeatherApi(url, params);

  const result = [];

  let ind = 0;

  for (const response of responses) {
    // Attributes for timezone and location
    const elevation = response.elevation();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const utcOffsetSeconds = response.utcOffsetSeconds();

    const hourly = response.hourly()!;

    const weatherData: OmLocationTimeData = {
      time: Array.from(
        { length: (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval() }, 
        (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
      ),
      pm10: Array.from(hourly.variables(0)?.valuesArray() ?? []),
      'pm2.5': Array.from(hourly.variables(1)?.valuesArray() ?? []),
      o3: Array.from(hourly.variables(2)?.valuesArray() ?? []),
      no2: Array.from(hourly.variables(3)?.valuesArray() ?? []),
      latitude: locations[ind].lat,
      longitude: locations[ind].lon,
    };

    result.push(weatherData);
    ind++;
  }

  return result;
}