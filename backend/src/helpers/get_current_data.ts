export interface CityData {
  summary: string;
  lastUpdated: Date;
}

// TODO: replace stub with real integration once AQODP token and endpoint are available.
export async function getData(cityName: string): Promise<CityData> {
  return {
    summary: `Data placeholder for ${cityName}`,
    lastUpdated: new Date(),
  };
}