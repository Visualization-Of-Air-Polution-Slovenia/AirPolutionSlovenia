import cors from "cors";
import express, { Request, Response } from "express";
import path from "path";
import { getData, getSloveniaStations, newSloveniaData, OmLocationTimeData, SimplifiedCityData, WaqiLocationData } from "./helpers/get_current_data";
import { csvRouter } from "./routes/csv";
const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: ['https://ambitious-sea-01dfcc903.1.azurestaticapps.net', 'http://localhost:5173'],
  credentials: true
}));

// Serve static files from backend/data directory at /data
const dataDir = path.resolve(__dirname, "..", "data");
app.use("/data", express.static(dataDir));

// Mount CSV API routes
app.use(csvRouter);

const PORT = Number(process.env.PORT) || 3000;
const AQODP_TOKEN = process.env.AQODP_Token;

const sloveniaData = {
  sloveniaLocations: null as WaqiLocationData[] | null,
  updatedAt: null as Date | null,
  data: [] as any[],
};

const sloveniaDataOM = {
  sloveniaLocations: null as WaqiLocationData[] | null,
  updatedAt: null as Date | null,
  data: [] as OmLocationTimeData[],
}

app.get("/", (_req: Request, res: Response) => {
  res.send("Backend is working 🎉");
});

app.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "pong", time: new Date() });
});

app.get("/city/:cityKey", async (req: Request, res: Response) => {
  if (!AQODP_TOKEN) {
    return res.status(503).json({ error: "Service not configured." });
  }

  const cityKey = req.params.cityKey;

  try {
    const cityData = await getData(AQODP_TOKEN, cityKey);
    res.json({ city: cityKey, data: cityData });
  } catch (error) {
    console.error("Failed to fetch city data", error);
    res.status(500).json({ error: "Unable to fetch city data." });
  }
});

app.get("/sloveniaData", async (_req: Request, res: Response) => {
  if (!AQODP_TOKEN) {
    return res.status(503).json({ error: "Service not configured." });
  }

  if (sloveniaData.sloveniaLocations === null) {
    try {
      sloveniaData.sloveniaLocations = await getSloveniaStations(AQODP_TOKEN);
    } catch (error) {
      console.error("Failed to fetch Slovenia stations", error);
      return res.status(500).json({ error: "Unable to fetch Slovenia stations." });
    }
  }

  // Refresh data if older than 1 hour
  if (
    sloveniaData.updatedAt === null ||
    (new Date().getTime() - sloveniaData.updatedAt.getTime()) > 60 * 60 * 1000
  ) {
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
});

app.get("/v2/sloveniaData", async (req: Request, res: Response) => {
  if (!AQODP_TOKEN) {
    return res.status(503).json({ error: "Service not configured." });
  }

  if (sloveniaDataOM.sloveniaLocations === null) {
    try {
      sloveniaDataOM.sloveniaLocations = await getSloveniaStations(AQODP_TOKEN);
    } catch (error) {
      console.error("Failed to fetch Slovenia stations", error);
      return res.status(500).json({ error: "Unable to fetch Slovenia stations." });
    }
  }

  if (sloveniaDataOM.updatedAt === null || (new Date().getTime() - sloveniaDataOM.updatedAt.getTime()) > 60 * 60 * 1000) {
    let newData;
    try {
      newData = await newSloveniaData(sloveniaDataOM.sloveniaLocations) ?? [];
    }
    catch (error) {
      console.error("Failed to fetch Slovenia city data v2", error);
    }


    sloveniaDataOM.data = newData!;
    sloveniaDataOM.updatedAt = new Date();
  }

  return res.json({ data: sloveniaDataOM.data });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Only run keep-alive.js if not in development mode
  if (process.env.NODE_ENV === "production") {
    require("../keep-alive.js");

    console.log("Started keep-alive.js in a detached process.");
  }
});