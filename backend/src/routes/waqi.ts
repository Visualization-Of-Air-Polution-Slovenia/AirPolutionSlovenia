import { Router } from "express";
import { getData, getSloveniaStations, SimplifiedCityData, WaqiLocationData } from "../helpers/get_current_data";

export const waqiRouter = Router();
const AQODP_TOKEN = process.env.AQODP_Token;

const sloveniaData = {
  sloveniaLocations: null as WaqiLocationData[] | null,
  updatedAt: null as Date | null,
  data: [] as any[],
};

waqiRouter.get("/city/:cityKey", async (req, res) => {
  if (!AQODP_TOKEN) return res.status(503).json({ error: "Service not configured." });

  try {
    const cityKey = req.params.cityKey;
    const cityData = await getData(AQODP_TOKEN, cityKey);
    res.json({ city: cityKey, data: cityData });
  } catch (error) {
    console.error("Failed to fetch city data", error);
    res.status(500).json({ error: "Unable to fetch city data." });
  }
});

waqiRouter.get("/sloveniaData", async (_req, res) => {
  if (!AQODP_TOKEN) return res.status(503).json({ error: "Service not configured." });

  try {
    if (sloveniaData.sloveniaLocations === null) {
      sloveniaData.sloveniaLocations = await getSloveniaStations(AQODP_TOKEN);
    }

    const oneHour = 60 * 60 * 1000;
    const stale = sloveniaData.updatedAt === null || (Date.now() - sloveniaData.updatedAt.getTime()) > oneHour;

    if (stale) {
      const allData: SimplifiedCityData[] = [];

      for (const location of sloveniaData.sloveniaLocations) {
        try {
          const cityData = await getData(AQODP_TOKEN, "@" + location.uid, true);
          allData.push(cityData);
        } catch (error) {
          console.error("Failed to fetch Slovenia city data", error);
        }
      }

      sloveniaData.data = allData;
      sloveniaData.updatedAt = new Date();
    }

    res.json({ data: sloveniaData.data });
  } catch (error) {
    console.error("Failed /sloveniaData", error);
    res.status(500).json({ error: "Unable to fetch Slovenia data." });
  }
});

// paste your WAQI types + getData + getSloveniaStations here
export { getData, getSloveniaStations };
export type { SimplifiedCityData, WaqiLocationData };
