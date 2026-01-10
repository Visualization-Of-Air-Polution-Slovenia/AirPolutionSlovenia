import cors from "cors";
import express, { Request, Response } from "express";
import path from "path";
import { getData } from "./helpers/get_current_data";

const app = express();

// Enable CORS for all origins
app.use(cors());

// Serve static files from backend/data directory at /data
const dataDir = path.resolve(__dirname, "..", "data");
app.use("/data", express.static(dataDir));

const PORT = Number(process.env.PORT) || 3000;
const AQODP_TOKEN = process.env.AQODP_Token;

app.get("/", (_req: Request, res: Response) => {
  res.send("Backend is working 🎉");
});

app.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "pong", time: new Date() });
});

app.get("/city/:cityName", async (req: Request, res: Response) => {
  if (!AQODP_TOKEN) {
    return res.status(503).json({ error: "Service currently unavailable." });
  }

  const cityName = req.params.cityName;

  try {
    const cityData = await getData(cityName);
    res.json({ city: cityName, data: cityData });
  } catch (error) {
    console.error("Failed to fetch city data", error);
    res.status(500).json({ error: "Unable to fetch city data." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});