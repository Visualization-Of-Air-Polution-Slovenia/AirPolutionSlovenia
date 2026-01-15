# Air Pollution Slovenia

Interactive web app for visualizing air pollution data in Slovenia.

## Repo structure
- `frontend/` — React + TypeScript + Vite UI (Leaflet map, charts, sidebar)
- `backend/` — Node.js + TypeScript + Express API (serves live + forecast/time-series endpoints)

**QUICK NOTE**
Frontend has it's own README.md file, that is accesible, when
you go to the root of */frontend* folder.

## Prerequisites
- Node.js 18+ (recommended)
- npm

## Quick start (local dev)

### 1) Backend
```bash
cd backend
npm install

# required for endpoints that call external data sources
# PowerShell:
$env:AQODP_Token="<your-token>"

npm run dev
```
Backend starts on `http://localhost:3000` by default (configurable via `PORT`).
Backend is also hosted at:
- https://airpolutionslovenia.onrender.com

Useful endpoints:
- `GET /ping`
- `GET /city/:cityKey`
- `GET /v2/sloveniaData`
- Static files: `GET /data/...` (served from `backend/data/`)

### 2) Frontend
```bash
cd frontend
npm install

# point the frontend to your local backend
# PowerShell:
$env:VITE_API_URL="http://localhost:3000"

npm run dev
```
Frontend runs on `http://localhost:5173` (or the next available port).
The website is also hosted at:
- https://www.airviz-slovenia.site/
- https://ambitious-sea-01dfcc903.1.azurestaticapps.net/

To successfully run the actual code, you have to create an *.env* file in
the root of */frontend* folder. Add VITE_API_URL={BACKEND_URL}.


## Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Notes
- The frontend reads the backend base URL from `VITE_API_URL`.
- The backend uses `AQODP_Token` for endpoints that require external air-quality data.
