// backend/src/routes/csv.ts
import { Router } from "express";
import fs from "fs";
import path from "path";

export const csvRouter = Router();

type UnifiedRow = {
  date: string;       // YYYY-MM-DD
  value: number;
  city: string;       // normalized city names
  year: number;
  pollutant: string;  // normalized pollutant labels
  month: number;
  source: "arso" | "eea" | "arso_forecast" | "eea_forecast";
  station_id?: string;
};

let cachedRows: UnifiedRow[] | null = null;
let cachedMeta:
  | {
      arsoFile: string | null;
      eeaFile: string | null;
      arsoForecastFile: string | null;
      eeaForecastFile: string | null;
      warnings: string[];
    }
  | null = null;

function firstExistingFile(...candidates: string[]): string | null {
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function normPollutant(raw: string) {
  const x0 = (raw ?? "").trim();

  // normalize unicode subscripts (O₃ -> O3)
  const x = x0
    .toUpperCase()
    .replace("₃", "3")
    .replace("₂", "2")
    .replace(/\s+/g, "");

  // PM variants
  if (x === "PM25" || x === "PM2_5" || x === "PM2,5" || x === "PM2.5") return "PM2.5";
  if (x === "PM10") return "PM10";

  // gases
  if (x === "NO2") return "NO2";
  if (x === "O3" || x === "OZONE") return "O3";

  // if your file ever contains CO2, keep it (won't break anything)
  if (x === "CO2") return "CO2";

  // fallback: keep whatever it is so frontend can still display it
  return x0.trim();
}

function normCity(raw: string) {
  const s = (raw ?? "").trim();

  // exact mapping based on your raw city lists
  const map: Record<string, string> = {
    "Ljubljana Bežigrad": "Ljubljana",
    "Ljubljana BF": "Ljubljana",
    "Ljubljana Biotehniška fakulteta": "Ljubljana",

    "Maribor center": "Maribor",
    "Maribor Vrbanski plato": "Maribor",
  };

  return map[s] ?? s;
}

function parseArsoDaily(filePath: string): UnifiedRow[] {
  // arso_daily.csv: date,value,city,year,pollutant,month
  const text = fs.readFileSync(filePath, "utf-8");
  const lines = text.split(/\r?\n/);

  const rows: UnifiedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const parts = line.split(",");
    if (parts.length < 6) continue;

    const date = parts[0]?.trim();
    const value = Number(parts[1]);
    const city = normCity(parts[2]);
    const year = Number(parts[3]);
    const pollutant = normPollutant(parts[4]);
    const month = Number(parts[5]);

    if (!date || !city || !pollutant) continue;
    if (!Number.isFinite(value)) continue;
    if (!Number.isFinite(year) || !Number.isFinite(month)) continue;

    rows.push({ date, value, city, year, pollutant, month, source: "arso" });
  }

  return rows;
}

function parseEeaDaily(filePath: string): UnifiedRow[] {
  // eea_daily.csv: date,station_id,city,pollutant,value
  const text = fs.readFileSync(filePath, "utf-8");
  const lines = text.split(/\r?\n/);

  const rows: UnifiedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const parts = line.split(",");
    if (parts.length < 5) continue;

    const date = parts[0]?.trim();
    const station_id = parts[1]?.trim();
    const city = normCity(parts[2]);
    const pollutant = normPollutant(parts[3]);
    const value = Number(parts[4]);

    if (!date || !city || !pollutant) continue;
    if (!Number.isFinite(value)) continue;

    const year = Number(date.slice(0, 4));
    const month = Number(date.slice(5, 7));
    if (!Number.isFinite(year) || !Number.isFinite(month)) continue;

    rows.push({ date, value, city, year, pollutant, month, source: "eea", station_id });
  }

  return rows;
}

function parseForecastDaily(filePath: string, source: "arso_forecast" | "eea_forecast"): UnifiedRow[] {
  // forecast CSV: city,pollutant,date,forecast_value
  const text = fs.readFileSync(filePath, "utf-8");
  const lines = text.split(/\r?\n/);

  const rows: UnifiedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const parts = line.split(",");
    if (parts.length < 4) continue;

    const city = normCity(parts[0]);
    const pollutant = normPollutant(parts[1]);
    const date = parts[2]?.trim();
    const value = Number(parts[3]);

    if (!date || !city || !pollutant) continue;
    if (!Number.isFinite(value)) continue;

    const year = Number(date.slice(0, 4));
    const month = Number(date.slice(5, 7));
    if (!Number.isFinite(year) || !Number.isFinite(month)) continue;

    rows.push({ date, value, city, year, pollutant, month, source });
  }

  return rows;
}

function loadAllRows(): {
  rows: UnifiedRow[];
  meta: {
    arsoFile: string | null;
    eeaFile: string | null;
    arsoForecastFile: string | null;
    eeaForecastFile: string | null;
    warnings: string[];
  };
} {
  //if (cachedRows && cachedMeta) return { rows: cachedRows, meta: cachedMeta };

  const dataDir = path.resolve(process.cwd(), "backend", "data");


  // Support multiple naming conventions that exist in this repo.
  const arsoPath = firstExistingFile(
    path.resolve(dataDir, "arso_daily.csv"),
    path.resolve(dataDir, "ARSO_Daily.csv"),
    path.resolve(dataDir, "ARSO_daily.csv")
  );

  const eeaPath = firstExistingFile(
    path.resolve(dataDir, "eea_daily.csv"),
    path.resolve(dataDir, "EEA_Daily.csv"),
    path.resolve(dataDir, "EEA_daily.csv")
  );

  // Forecasts
  const arsoForecastPath = firstExistingFile(
    path.resolve(dataDir, "ARSO_daily_forecasts_2026.csv"),
    path.resolve(dataDir, "ARSO_daily_forecasts_2026"),
    path.resolve(dataDir, "arso_daily_forecasts_2026.csv"),
    path.resolve(dataDir, "arso_daily_forecasts_2026")
  );

  const eeaForecastPath = firstExistingFile(
    path.resolve(dataDir, "EEA_daily_forecasts_2026.csv"),
    path.resolve(dataDir, "EEA_daily_forecasts_2026"),
    path.resolve(dataDir, "eea_daily_forecasts_2026.csv"),
    path.resolve(dataDir, "eea_daily_forecasts_2026")
  );

  const warnings: string[] = [];

  let arsoRows: UnifiedRow[] = [];
  if (arsoPath) {
    try {
      arsoRows = parseArsoDaily(arsoPath);
    } catch (e: any) {
      warnings.push(`Failed to parse ARSO CSV (${path.basename(arsoPath)}): ${e?.message ?? String(e)}`);
    }
  } else {
    warnings.push("ARSO daily CSV not found in backend/data (expected ARSO_Daily.csv or arso_daily.csv).");
  }

  let eeaRows: UnifiedRow[] = [];
  if (eeaPath) {
    try {
      eeaRows = parseEeaDaily(eeaPath);
    } catch (e: any) {
      warnings.push(`Failed to parse EEA CSV (${path.basename(eeaPath)}): ${e?.message ?? String(e)}`);
    }
  } else {
    warnings.push("EEA daily CSV not found in backend/data (expected EEA_Daily.csv or eea_daily.csv).");
  }

  let arsoForecastRows: UnifiedRow[] = [];
  if (arsoForecastPath) {
    try {
      arsoForecastRows = parseForecastDaily(arsoForecastPath, "arso_forecast");
    } catch (e: any) {
      warnings.push(
        `Failed to parse ARSO forecast CSV (${path.basename(arsoForecastPath)}): ${e?.message ?? String(e)}`
      );
    }
  } else {
    warnings.push("ARSO forecast CSV not found in backend/data (expected ARSO_daily_forecasts_2026(.csv)).");
  }

  let eeaForecastRows: UnifiedRow[] = [];
  if (eeaForecastPath) {
    try {
      eeaForecastRows = parseForecastDaily(eeaForecastPath, "eea_forecast");
    } catch (e: any) {
      warnings.push(
        `Failed to parse EEA forecast CSV (${path.basename(eeaForecastPath)}): ${e?.message ?? String(e)}`
      );
    }
  } else {
    warnings.push("EEA forecast CSV not found in backend/data (expected EEA_daily_forecasts_2026(.csv)).");
  }

  cachedRows = [...arsoRows, ...eeaRows, ...arsoForecastRows, ...eeaForecastRows];

  cachedMeta = {
    arsoFile: arsoPath ? path.basename(arsoPath) : null,
    eeaFile: eeaPath ? path.basename(eeaPath) : null,
    arsoForecastFile: arsoForecastPath ? path.basename(arsoForecastPath) : null,
    eeaForecastFile: eeaForecastPath ? path.basename(eeaForecastPath) : null,
    warnings,
  };

    if (warnings.length) {
    console.warn(`⚠️ CSV warnings: ${warnings.join(" | ")}`);
  }

  return { rows: cachedRows, meta: cachedMeta };
}

// --- endpoints ---

// Full dataset (merged + normalized; no filtering)
csvRouter.get("/api/arso/all", (_req, res) => {
  try {
    const { rows, meta } = loadAllRows();
    res.json({ rows, meta });
  } catch (e: any) {
    // Keep the site usable even if something unexpected happens.
    res.status(200).json({
      rows: [],
      meta: {
        arsoFile: null,
        eeaFile: null,
        arsoForecastFile: null,
        eeaForecastFile: null,
        warnings: [e?.message ?? "Failed to load full data"],
      },
    });
  }
});

// Cities from ARSO only (normalized)
csvRouter.get("/api/cities/arso", (_req, res) => {
  try {
    const arsoPath = path.resolve(__dirname, "..", "..", "data", "arso_daily.csv");
    if (!fs.existsSync(arsoPath)) return res.json({ source: "arso", cities: [], count: 0 });

    const rows = parseArsoDaily(arsoPath);
    const cities = Array.from(new Set(rows.map((r) => r.city))).sort((a, b) => a.localeCompare(b));
    res.json({ source: "arso", cities, count: cities.length });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Failed to load ARSO cities" });
  }
});

// Cities from EEA only (normalized)
csvRouter.get("/api/cities/eea", (_req, res) => {
  try {
    const eeaPath = path.resolve(__dirname, "..", "..", "data", "eea_daily.csv");
    if (!fs.existsSync(eeaPath)) return res.json({ source: "eea", cities: [], count: 0 });

    const rows = parseEeaDaily(eeaPath);
    const cities = Array.from(new Set(rows.map((r) => r.city))).sort((a, b) => a.localeCompare(b));
    res.json({ source: "eea", cities, count: cities.length });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Failed to load EEA cities" });
  }
});

// Cities from BOTH sources combined (normalized)
csvRouter.get("/api/cities", (_req, res) => {
  try {
    const { rows } = loadAllRows();
    const cities = Array.from(new Set(rows.map((r) => r.city))).sort((a, b) => a.localeCompare(b));
    res.json({ cities, count: cities.length });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Failed to load cities" });
  }
});

// Debug counts per city|pollutant|source (optional but useful)
csvRouter.get("/api/arso/debug-counts", (req, res) => {
  try {
    const { rows } = loadAllRows();
    const city = typeof req.query.city === "string" ? req.query.city : undefined;

    const counts: Record<string, number> = {};
    for (const r of rows) {
      if (city && r.city !== city) continue;
      const k = `${r.city}|${r.pollutant}|${r.source}`;
      counts[k] = (counts[k] ?? 0) + 1;
    }

    res.json({
      filterCity: city ?? null,
      totalRows: rows.length,
      keys: Object.keys(counts).length,
      counts,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "debug failed" });
  }
});

csvRouter.post("/api/arso/reload", (_req, res) => {
  cachedRows = null;
  cachedMeta = null;
  const { rows, meta } = loadAllRows();
  res.json({ ok: true, rows: rows.length, meta });
});