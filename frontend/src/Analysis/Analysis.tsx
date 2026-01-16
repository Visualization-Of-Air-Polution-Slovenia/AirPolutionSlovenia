// frontend/src/pages/analysis/Analysis.tsx
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import styles from './Analysis.module.css';

import { useAppStore } from '@/store/useStore';
import { AnalysisContent } from './Analysis.content';
import { generateTrendsSubtitle } from './Analysis.utils';

const POLLUTANTS = [
  { key: 'pm10', label: 'PM₁₀' },
  { key: 'pm2.5', label: 'PM₂.₅' },
  { key: 'no2', label: 'NO₂' },
  { key: 'o3', label: 'O₃' },
] as const;

type PollutantKey = (typeof POLLUTANTS)[number]['key'];
type TimeRangeKey = '7D' | '30D' | '1Y' | '10Y';

type FullRow = {
  date: string;
  value: number;
  city: string;
  year: number;
  pollutant: string;
  month: number;
  source?: 'arso' | 'eea' | 'arso_forecast' | 'eea_forecast';
};

type ChartPoint = { date: string; value: number };
type LimitAuthority = 'WHO' | 'EU';
type LimitDisplay = 'None' | 'WHO' | 'EU' | 'WHO and EU';

type RechartsDatum = {
  date: string;
  [key: string]: number | string | null;
};

const LIMITS_ANNUAL_BY_AUTH: Record<LimitAuthority, Partial<Record<PollutantKey, number>>> = {
  EU: {
    'pm2.5': 25,
    pm10: 40,
    no2: 40,
  },
  WHO: {
    'pm2.5': 5,
    pm10: 15,
    no2: 10,
  },
};


// stable-ish city color from name (no extra deps)
const cityColor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h} 70% 50%)`;
};

const CITY_PALETTE = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948',
  '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC',
  '#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B',
  '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF',
  '#393B79', '#637939', '#8C6D31', '#843C39', '#7B4173', '#3182BD',
  '#31A354', '#756BB1', '#636363', '#E6550D',
] as const;


const goldenAngleColor = (i: number) => {
  const h = (i * 137.50776405003785) % 360;
  return `hsl(${h} 75% 50%)`;
};

const cityToDataKey = (city: string) => `city_${city.replace(/[^a-zA-Z0-9]+/g, '_')}`;

export const Analysis = () => {
  const { pollutionType } = useAppStore();

  const [timeRange, setTimeRange] = useState<TimeRangeKey>('7D');
  const [rangeMode, setRangeMode] = useState<'preset' | 'custom'>('preset');
  const [customDays, setCustomDays] = useState<number>(30);
  const didInitRangeRef = useRef(false);

  const [startDateInput, setStartDateInput] = useState<string>('2023-10-01');
  const [endDateInput, setEndDateInput] = useState<string>('2023-10-07');

  const [activeCity, setActiveCity] = useState<string>('Ljubljana');

  const [selectedPollutants, setSelectedPollutants] = useState<PollutantKey[]>([
    (pollutionType as PollutantKey) ?? 'pm10',
  ]);

  const [compareCities, setCompareCities] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>(['Ljubljana']);

  const [showForecast, setShowForecast] = useState(false);

  const [limitDisplay, setLimitDisplay] = useState<LimitDisplay>('WHO and EU');

  // Load full dataset once
  const [allRows, setAllRows] = useState<FullRow[]>([]);
  const [allStatus, setAllStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [allError, setAllError] = useState<string>('');
  const [allWarning, setAllWarning] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const parseDateLocal = (s: string) => new Date(`${s}T00:00:00`);
    const formatDateLocal = (d: Date) => d.toISOString().slice(0, 10);
    const initialDays = 7;

    async function loadAll() {
      try {
        setAllStatus('loading');
        setAllError('');
        setAllWarning('');

        // Keep behavior consistent with Services/api.ts: if VITE_API_URL is not set in production,
        // fall back to the hosted backend instead of calling same-origin `/api/*` (which 404s on static hosting).
        const apiBaseRaw = import.meta.env.VITE_API_URL
          ? String(import.meta.env.VITE_API_URL)
          : 'https://airpolutionslovenia.onrender.com';
          
        const apiBase = apiBaseRaw.replace(/\/$/, '');
        const url = `${apiBase}/api/arso/all`;

        const res = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const rows = Array.isArray(json.rows) ? (json.rows as FullRow[]) : [];
        const warnings = Array.isArray(json.meta?.warnings) ? (json.meta.warnings as string[]) : [];
        if (!cancelled) {
          setAllRows(rows);
          if (warnings.length) setAllWarning(warnings.join(' | '));
          setAllStatus('success');

          if (!didInitRangeRef.current && rows.length > 0) {
            const dates = rows.map((r) => r.date).filter(Boolean);
            const maxDate = dates.reduce((acc, d) => (d > acc ? d : acc), dates[0]);
            const end = parseDateLocal(maxDate);
            const start = new Date(end);
            start.setDate(start.getDate() - (initialDays - 1));
            setStartDateInput(formatDateLocal(start));
            setEndDateInput(formatDateLocal(end));
            didInitRangeRef.current = true;
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setAllStatus('error');
          const msg = e instanceof Error ? e.message : String(e);
          setAllError(`${msg}. Is the backend running, or is VITE_API_URL reachable?`);
          setAllRows([]);
        }
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const allCities = useMemo(() => {
    if (allStatus !== 'success') return ['Ljubljana', 'Celje', 'Maribor'];

    const uniq = Array.from(new Set(allRows.map((r) => r.city))).sort((a, b) => a.localeCompare(b));

    if (uniq.length === 0) return ['Ljubljana', 'Celje', 'Maribor'];

    if (uniq.includes('Ljubljana')) return ['Ljubljana', ...uniq.filter((c) => c !== 'Ljubljana')];
    return uniq;
  }, [allStatus, allRows]);

  const cityColors = useMemo(() => {
  const sorted = [...allCities].sort((a, b) => a.localeCompare(b));
  const map: Record<string, string> = {};

  sorted.forEach((city, i) => {
    map[city] = CITY_PALETTE[i] ?? goldenAngleColor(i);
  });

  return map;
}, [allCities]);


  const dataRange = useMemo(() => {
    const rowsToUse = showForecast
      ? allRows
      : allRows.filter((r) => r.source !== 'arso_forecast' && r.source !== 'eea_forecast');

    if (rowsToUse.length === 0) return null;
    const dates = rowsToUse.map((r) => r.date).filter(Boolean);
    if (dates.length === 0) return null;

    const minDate = dates.reduce((acc, d) => (d < acc ? d : acc), dates[0]);
    const maxDate = dates.reduce((acc, d) => (d > acc ? d : acc), dates[0]);
    return { minDate, maxDate };
  }, [allRows, showForecast]);

  useEffect(() => {
    if (allCities.length === 0) return;

    // keep activeCity valid
    if (!allCities.includes(activeCity)) {
      setActiveCity(allCities.includes('Ljubljana') ? 'Ljubljana' : (allCities[0] ?? 'Ljubljana'));
    }

    // keep selectedCities valid when comparing
    if (compareCities) {
      setSelectedCities((prev) => {
        const next = prev.filter((c) => allCities.includes(c));
        if (next.length) return next;
        return [allCities.includes('Ljubljana') ? 'Ljubljana' : (allCities[0] ?? 'Ljubljana')];
      });
    }
  }, [allCities, activeCity, compareCities]);

  useEffect(() => {
    if (!compareCities) return;
    setSelectedPollutants((prev) => {
      if (prev.length === 0) return [((pollutionType as PollutantKey) ?? 'pm10') as PollutantKey];
      return [prev[0]];
    });
  }, [compareCities, pollutionType]);

  // Build index: city -> pollutant -> sorted points[]
  const indexed = useMemo(() => {
    const map = new Map<string, Map<string, ChartPoint[]>>();

    const rowsToUse = showForecast
      ? allRows
      : allRows.filter((r) => r.source !== 'arso_forecast' && r.source !== 'eea_forecast');

    for (const r of rowsToUse) {
      if (!map.has(r.city)) map.set(r.city, new Map());
      const byCity = map.get(r.city)!;

      if (!byCity.has(r.pollutant)) byCity.set(r.pollutant, []);
      byCity.get(r.pollutant)!.push({ date: r.date, value: r.value });
    }

    for (const byCity of map.values()) {
      for (const s of byCity.values()) s.sort((a, b) => a.date.localeCompare(b.date));
    }

    return map;
  }, [allRows, showForecast]);

  const pollutantLabelToCsv = useMemo(() => {
    const map: Record<PollutantKey, string> = {
      pm10: 'PM10',
      'pm2.5': 'PM2.5',
      no2: 'NO2',
      o3: 'O3',
    };
    return map;
  }, []);

  const pollutantColors = useMemo(() => {
    const map: Record<PollutantKey, string> = {
      pm10: '#3b82f6',
      'pm2.5': '#f59e0b',
      no2: '#10b981',
      o3: '#ef4444',
    };
    return map;
  }, []);

  const pollutantKeyToDataKey = useMemo(() => {
    const map: Record<PollutantKey, string> = {
      pm10: 'pm10',
      'pm2.5': 'pm2_5',
      no2: 'no2',
      o3: 'o3',
    };
    return map;
  }, []);

  const limitDaysFromTimeRange = (t: TimeRangeKey) => {
    if (t === '7D') return 7;
    if (t === '30D') return 30;
    if (t === '1Y') return 365;
    return 3650;
  };

  const parseDate = (s: string) => new Date(`${s}T00:00:00`);
  const formatDate = (d: Date) => d.toISOString().slice(0, 10);

  const clampDateOrder = (start: string, end: string) => {
    if (!start || !end) return { start, end };
    return start <= end ? { start, end } : { start: end, end: start };
  };

  // --- Custom mode: keep end date synced to start + N days
  useEffect(() => {
    if (rangeMode !== 'custom') return;
    if (!startDateInput) return;
    if (!Number.isFinite(customDays) || customDays <= 0) return;

    const start = parseDate(startDateInput);
    const end = new Date(start);
    end.setDate(end.getDate() + (customDays - 1));
    setEndDateInput(formatDate(end));
  }, [rangeMode, startDateInput, customDays]);

  // pollutant counts (shown next to options), based on a "reference city"
  const countsByPollutant = useMemo(() => {
    const out: Record<PollutantKey, number> = { pm10: 0, 'pm2.5': 0, no2: 0, o3: 0 };
    const { start, end } = clampDateOrder(startDateInput, endDateInput);
    if (!start || !end) return out;

    const referenceCity = compareCities ? (selectedCities[0] ?? activeCity) : activeCity;

    const byCity = indexed.get(referenceCity);
    if (!byCity) return out;

    const withinRange = (p: ChartPoint) => p.date >= start && p.date <= end;

    for (const k of Object.keys(out) as PollutantKey[]) {
      const csv = pollutantLabelToCsv[k];
      const pts = byCity.get(csv) ?? [];
      out[k] = pts.filter(withinRange).length;
    }

    return out;
  }, [indexed, activeCity, compareCities, selectedCities, startDateInput, endDateInput, pollutantLabelToCsv]);

  // counts by city depend on selected pollutants
  const countsByCity = useMemo(() => {
    const out: Record<string, number> = {};
    const { start, end } = clampDateOrder(startDateInput, endDateInput);
    if (!start || !end) return out;

    const selectedPollutantSet = new Set(selectedPollutants.map((k) => pollutantLabelToCsv[k]));

    for (const city of allCities) {
      const byCity = indexed.get(city);
      if (!byCity) continue;

      let count = 0;
      for (const pollutant of selectedPollutantSet) {
        const pts = byCity.get(pollutant) ?? [];
        count += pts.filter((p) => p.date >= start && p.date <= end).length;
      }
      out[city] = count;
    }

    return out;
  }, [indexed, allCities, selectedPollutants, startDateInput, endDateInput, pollutantLabelToCsv]);

  const enabledCities = useMemo(
    () => allCities.filter((c) => (countsByCity[c] ?? 0) > 0),
    [allCities, countsByCity],
  );
  const disabledCities = useMemo(
    () => allCities.filter((c) => (countsByCity[c] ?? 0) === 0),
    [allCities, countsByCity],
  );
  const sortedCities = useMemo(() => [...enabledCities, ...disabledCities], [enabledCities, disabledCities]);

  const [cityPage, setCityPage] = useState(0);
  const cityPageSize = 8;
  const cityPages = Math.max(1, Math.ceil(sortedCities.length / cityPageSize));
  const visibleCities =
    cityPages > 1 ? sortedCities.slice(cityPage * cityPageSize, (cityPage + 1) * cityPageSize) : sortedCities;

  useEffect(() => {
    setCityPage((p) => Math.min(Math.max(0, p), cityPages - 1));
  }, [cityPages]);

  // If not comparing: keep activeCity on a city that has data
  useEffect(() => {
    if (compareCities) return;
    if (enabledCities.length === 0) return;
    if ((countsByCity[activeCity] ?? 0) > 0) return;
    setActiveCity(enabledCities[0] ?? activeCity);
  }, [compareCities, enabledCities, countsByCity, activeCity]);

  // effective selected cities in compare mode: keep at least one + prefer enabled
  const selectedCitiesEffective = useMemo(() => {
    if (!compareCities) return [activeCity];

    const enabledOnly = selectedCities.filter((c) => (countsByCity[c] ?? 0) > 0);
    if (enabledOnly.length) return enabledOnly;

    if ((countsByCity[activeCity] ?? 0) > 0) return [activeCity];
    if (enabledCities.length) return [enabledCities[0]];
    return [selectedCities[0] ?? activeCity];
  }, [compareCities, selectedCities, countsByCity, activeCity, enabledCities]);

  // Pollutant toggling:
  // - compareCities OFF => multi-select
  // - compareCities ON  => single-select (radio-like)
  const togglePollutant = (key: PollutantKey) => {
    setSelectedPollutants((prev) => {
      if (compareCities) return [key];
      const has = prev.includes(key);
      if (has) return prev.filter((k) => k !== key);
      return [...prev, key];
    });
  };

  const allSelected = selectedPollutants.length === POLLUTANTS.length;

  const onSelectAll = () => {
    if (compareCities) return; // disallow in compare mode
    if (allSelected) setSelectedPollutants([]);
    else setSelectedPollutants(POLLUTANTS.map((p) => p.key));
  };

  const toggleCity = (city: string) => {
    setSelectedCities((prev) => {
      const has = prev.includes(city);
      if (has) {
        const next = prev.filter((c) => c !== city);
        // keep at least one
        return next.length ? next : prev;
      }
      return [...prev, city];
    });
  };

  const series = useMemo(() => {
    const { start, end } = clampDateOrder(startDateInput, endDateInput);
    const hasRange = Boolean(start && end);

    if (!compareCities) {
      const byCity = indexed.get(activeCity);
      if (!byCity) return [];

      return selectedPollutants.map((k) => {
        const csvPollutant = pollutantLabelToCsv[k];
        const pts = byCity.get(csvPollutant) ?? [];
        const filtered = hasRange ? pts.filter((p) => p.date >= start && p.date <= end) : pts;

        return {
          mode: 'pollutant' as const,
          key: k,
          label: POLLUTANTS.find((p) => p.key === k)?.label ?? k,
          name: pollutantLabelToCsv[k],
          color: pollutantColors[k],
          dataKey: pollutantKeyToDataKey[k],
          allPoints: pts,
          points: filtered,
        };
      });
    }

    const pollutantKey = selectedPollutants[0] ?? ((pollutionType as PollutantKey) ?? 'pm10');
    const csvPollutant = pollutantLabelToCsv[pollutantKey];

    return selectedCitiesEffective.map((city) => {
      const byCity = indexed.get(city);
      const pts = byCity?.get(csvPollutant) ?? [];
      const filtered = hasRange ? pts.filter((p) => p.date >= start && p.date <= end) : pts;

      return {
        mode: 'city' as const,
        key: city,
        label: city,
        name: city,
        color: cityColors[city] ?? goldenAngleColor(0),
        dataKey: cityToDataKey(city),
        allPoints: pts,
        points: filtered,
        pollutantKey,
      };
    });
  }, [
    compareCities,
    indexed,
    activeCity,
    selectedPollutants,
    selectedCitiesEffective,
    startDateInput,
    endDateInput,
    pollutantLabelToCsv,
    pollutantColors,
    pollutantKeyToDataKey,
    pollutionType,
  ]);

  const selectionRange = useMemo(() => {
    const dates: string[] = [];
    for (const s of series as any[]) {
      for (const p of s.allPoints ?? []) dates.push(p.date);
    }
    if (dates.length === 0) return null;

    const minDate = dates.reduce((acc, d) => (d < acc ? d : acc), dates[0]);
    const maxDate = dates.reduce((acc, d) => (d > acc ? d : acc), dates[0]);
    return { minDate, maxDate };
  }, [series]);

  const setRangeToLatest = (t: TimeRangeKey) => {
    const max = (selectionRange ?? dataRange)?.maxDate;
    if (!max) return;

    const end = parseDate(max);
    const days = limitDaysFromTimeRange(t);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));

    setStartDateInput(formatDate(start));
    setEndDateInput(formatDate(end));
  };

  useEffect(() => {
    const max = (selectionRange ?? dataRange)?.maxDate;
    if (!max) return;

    const end = new Date(`${max}T00:00:00`);
    const start = new Date(end);
    start.setDate(start.getDate() - 6); // 7D

    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    setStartDateInput(fmt(start));
    setEndDateInput(fmt(end));
  }, [selectionRange?.maxDate, dataRange?.maxDate]);

  useEffect(() => {
    if (showForecast) return;
    const max = dataRange?.maxDate;
    if (!max) return;
    if (endDateInput > max) setRangeToLatest(timeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForecast]);

  const chartData = useMemo(() => {
  const { start, end } = clampDateOrder(startDateInput, endDateInput);
  if (!start || !end) return [];

  const startD = new Date(`${start}T00:00:00`);
  const endD = new Date(`${end}T00:00:00`);

  // Build a lookup: date -> { seriesKey -> value }
  const byDate = new Map<string, Record<string, number>>();

  for (const s of series) {
    for (const p of s.points) {
      const row = byDate.get(p.date) ?? {};
      row[s.dataKey] = p.value;
      byDate.set(p.date, row);
    }
  }

  const out: RechartsDatum[] = [];

  for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const row: RechartsDatum = { date: dateStr };

    const existing = byDate.get(dateStr);

    for (const s of series) {
      row[s.dataKey] = existing && s.dataKey in existing ? existing[s.dataKey] : null;
    }

    out.push(row);
  }

  return out;
}, [series, startDateInput, endDateInput]);


  const yDomain = useMemo(() => {
    const vals: number[] = [];

    for (const s of series) {
      for (const p of s.points) vals.push(p.value);
    }

    if (limitDisplay !== 'None') {
      if (!compareCities) {
        for (const s of series) {
          if (s.mode !== 'pollutant') continue;
          const k = s.key as PollutantKey;
          const who = LIMITS_ANNUAL_BY_AUTH.WHO[k];
          const eu = LIMITS_ANNUAL_BY_AUTH.EU[k];
          if ((limitDisplay === 'WHO' || limitDisplay === 'WHO and EU') && typeof who === 'number') vals.push(who);
          if ((limitDisplay === 'EU' || limitDisplay === 'WHO and EU') && typeof eu === 'number') vals.push(eu);
        }
      } else {
        const pollutantKey = (series[0] as any)?.pollutantKey as PollutantKey | undefined;
        const k = pollutantKey ?? selectedPollutants[0];
        if (k) {
          const who = LIMITS_ANNUAL_BY_AUTH.WHO[k];
          const eu = LIMITS_ANNUAL_BY_AUTH.EU[k];
          if ((limitDisplay === 'WHO' || limitDisplay === 'WHO and EU') && typeof who === 'number') vals.push(who);
          if ((limitDisplay === 'EU' || limitDisplay === 'WHO and EU') && typeof eu === 'number') vals.push(eu);
        }
      }
    }

    if (vals.length === 0) return { min: 0, max: 1 };

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const pad = range * 0.08;
    return { min: Math.max(0, min - pad), max: max + pad };
  }, [series, limitDisplay, compareCities, selectedPollutants]);

  const xTickFormatter = useMemo(() => {
    const { start, end } = clampDateOrder(startDateInput, endDateInput);
    if (!start || !end) return (v: string) => v;

    const days = Math.round((parseDate(end).getTime() - parseDate(start).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 40) return (v: string) => String(v).slice(5);
    if (days <= 400) return (v: string) => String(v).slice(0, 7);
    return (v: string) => String(v).slice(0, 4);
  }, [startDateInput, endDateInput]);

  const hasEnoughChartData = useMemo(() => {
    if (chartData.length < 2) return false;
    const keys = series.map((s) => s.dataKey);

    let nonNullPoints = 0;
    for (const row of chartData) {
      if (keys.some((k) => row[k] !== null && row[k] !== undefined)) nonNullPoints += 1;
      if (nonNullPoints >= 2) return true;
    }
    return false;
  }, [chartData, series]);

  const formatCompact1 = (value: unknown) => {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return '';

    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';

    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}k`;
    return `${n.toFixed(1)}`;
  };

  const comparePollutantKey = compareCities
    ? (selectedPollutants[0] ?? ((pollutionType as PollutantKey) ?? 'pm10'))
    : null;

  const trendsSubtitle = useMemo(() => {
    return generateTrendsSubtitle({
      timeRange,
      rangeMode,
      customDays,
      compareCities,
      startDate: startDateInput,
      endDate: endDateInput,
    });
  }, [timeRange, rangeMode, customDays, compareCities, startDateInput, endDateInput]);

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar} aria-label="Analysis controls">
        <div className={styles.sideHeader}>
          <div className={styles.sideTitle}>{AnalysisContent.title}</div>
          <div className={styles.sideSubtitle}>{AnalysisContent.subtitle}</div>
        </div>

        <div className={styles.sideBody}>
          <section>
            <div className={styles.sectionTitleRow}>
              <div className={styles.sectionTitle}>{AnalysisContent.side.pollutants}</div>

              {!compareCities && (
                <button className={styles.smallLink} type="button" onClick={onSelectAll}>
                  {allSelected ? 'Clear' : 'Select All'}
                </button>
              )}

              {compareCities && <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 800 }}>Select 1</div>}
            </div>

            <div className={styles.grid2}>
              {POLLUTANTS.map((p) => {
                const checked = selectedPollutants.includes(p.key);
                const count = countsByPollutant[p.key];

                return (
                  <label key={p.key} className={`${styles.option} ${checked ? styles.optionActive : ''}`}>
                    <input
                      className={styles.checkbox}
                      type={compareCities ? 'radio' : 'checkbox'}
                      name={compareCities ? 'pollutant' : undefined}
                      checked={checked}
                      onChange={() => togglePollutant(p.key)}
                    />
                    <span className={styles.optionText}>
                      {p.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section>
            <div className={styles.sectionTitle}>{AnalysisContent.side.timeRange}</div>

            <div className={styles.modeToggle}>
              <button
                type="button"
                className={`${styles.modeBtn} ${rangeMode === 'preset' ? styles.modeBtnActive : ''}`}
                onClick={() => {
                  setRangeMode('preset');
                  setRangeToLatest(timeRange);
                }}
              >
                Preset
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${rangeMode === 'custom' ? styles.modeBtnActive : ''}`}
                onClick={() => setRangeMode('custom')}
              >
                Custom
              </button>
            </div>

            <div className={styles.timeTabs}>
              {(['7D', '30D', '1Y', '10Y'] as const).map((t) => (
                <button
                  key={t}
                  className={`${styles.timeTab} ${timeRange === t ? styles.timeTabActive : ''}`}
                  type="button"
                  onClick={() => {
                    setTimeRange(t);
                    if (rangeMode === 'preset') setRangeToLatest(t);
                    else setCustomDays(limitDaysFromTimeRange(t));
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {(selectionRange ?? dataRange) && (
              <div className={styles.dataInfo}>
                Available: {(selectionRange ?? dataRange)!.minDate} → {(selectionRange ?? dataRange)!.maxDate}
              </div>
            )}

            {rangeMode === 'custom' && (
              <div className={styles.dateSection}>
                <div className={styles.inputGroup}>
                  <span className={styles.inputGroupLabel}>Duration (days)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={1}
                    step={1}
                    value={customDays}
                    onChange={(e) => setCustomDays(Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
              </div>
            )}

            <div className={styles.dateSection}>
              <span className={styles.dateLabel}>Date Range</span>
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <span className={styles.inputGroupLabel}>From</span>
                  <input
                    className={styles.input}
                    type="date"
                    value={startDateInput}
                    onChange={(e) => {
                      const nextStart = e.target.value;
                      const { start, end } = clampDateOrder(nextStart, endDateInput);
                      setStartDateInput(start);
                      setEndDateInput(end);
                    }}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <span className={styles.inputGroupLabel}>To</span>
                  <input
                    className={styles.input}
                    type="date"
                    value={endDateInput}
                    onChange={(e) => {
                      const nextEnd = e.target.value;
                      const { start, end } = clampDateOrder(startDateInput, nextEnd);
                      setStartDateInput(start);
                      setEndDateInput(end);
                    }}
                    disabled={rangeMode === 'custom'}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className={styles.sectionTitle}>Limits</div>

            <select
              className={styles.select}
              value={limitDisplay}
              onChange={(e) => setLimitDisplay(e.target.value as LimitDisplay)}
            >
              <option value="None">No limits</option>
              <option value="WHO">WHO only</option>
              <option value="EU">EU only</option>
              <option value="WHO and EU">WHO and EU</option>
            </select>
          </section>

          <section>
            <div className={styles.sectionTitle}>{AnalysisContent.side.locations}</div>

            <div className={styles.locations}>
              {visibleCities.map((loc) => {
                const count = countsByCity[loc] ?? 0;
                const isDisabled = count === 0;

                const isSelected = compareCities ? selectedCities.includes(loc) : loc === activeCity;

                return (
                  <div
                    key={loc}
                    className={`${styles.locationPill} ${isDisabled ? styles.locationPillDisabled : ''}`}
                    role="button" 
                    tabIndex={isDisabled ? -1 : 0}
                    aria-label={`Select ${loc}`}
                    aria-disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      if (compareCities) toggleCity(loc);
                      else setActiveCity(loc);
                    }}
                    onKeyDown={(e) => {
                      if (isDisabled) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (compareCities) toggleCity(loc);
                        else setActiveCity(loc);
                      }
                    }}
                    style={{
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      border: isSelected ? '1px solid var(--primary)' : undefined,
                      background: isSelected ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--distance)' }}>
                      <span
                        className={styles.dot}
                        style={{ background: compareCities ? (cityColors[loc] ?? goldenAngleColor(0)) : 'var(--primary)' }}
                      />
                      <span style={{ fontWeight: 800 }}>{loc}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: 12 }}>{count}</span>
                  </div>
                );
              })}

              {cityPages > 1 && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    className={styles.smallLink}
                    onClick={() => setCityPage((p) => Math.max(0, p - 1))}
                    disabled={cityPage === 0}
                    style={{ opacity: cityPage === 0 ? 0.6 : 1 }}
                  >
                    Prev
                  </button>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>
                    Page {cityPage + 1} / {cityPages}
                  </div>
                  <button
                    type="button"
                    className={styles.smallLink}
                    onClick={() => setCityPage((p) => Math.min(cityPages - 1, p + 1))}
                    disabled={cityPage >= cityPages - 1}
                    style={{ opacity: cityPage >= cityPages - 1 ? 0.6 : 1 }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </section>

          <section>
          <div style={{ marginTop: 12 }}>
              <div className={styles.sectionTitle} style={{ marginBottom: 8 }}>
                Forecast
              </div>
              <label className={styles.btnPrimary} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={showForecast}
                  onChange={(e) => setShowForecast(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontWeight: 900 }}>Show predictions</span>
              </label>
              <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                Shows predictions for the year 2026
              </div>
            </div>
          </section>
        </div>

        <div className={styles.sideFooter}>
          <label
            className={styles.btnPrimary}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={compareCities}
              onChange={(e) => setCompareCities(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontWeight: 900 }}>Compare cities</span>
          </label>

          {compareCities && (
            <div style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>
              Selected: {selectedCitiesEffective.join(', ')} • Pollutant: {pollutantLabelToCsv[comparePollutantKey!]}
            </div>
          )}
        </div>
      </aside>

      <section className={styles.main} aria-label="Analysis results">
        <div className={styles.canvas}>
          <div className={styles.chartCard}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 'var(--distance-xl)',
                alignItems: 'center',
              }}
            >
              <div>
                <div className={styles.cardTitle}>Annual Mean Concentration</div>
                <div className={styles.cardSubtitle}>{trendsSubtitle}</div>
              </div>

              <div className={styles.legend}>
                {series.map((s) => (
                  <div key={String(s.key)} className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: s.color }} />{' '}
                    {s.mode === 'pollutant' ? s.name : s.label}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.chartArea}>
              {allStatus === 'loading' && <div className={styles.chartMessage}>Loading full dataset…</div>}
              {allStatus === 'error' && (
                <div className={styles.chartMessage} style={{ color: 'var(--warning)' }}>
                  {allError}
                </div>
              )}
              {allStatus === 'success' && allWarning && <div className={styles.chartWarning}>Data warnings: {allWarning}</div>}

              {allStatus === 'success' && selectedPollutants.length === 0 && (
                <div className={styles.chartMessage}>Select at least one pollutant.</div>
              )}
              {allStatus === 'success' && selectedPollutants.length > 0 && !hasEnoughChartData && (
                <div className={styles.chartMessage}>Not enough points for a chart.</div>
              )}

              {allStatus === 'success' && selectedPollutants.length > 0 && hasEnoughChartData && (
                <div className={styles.chartRecharts}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 18, left: 10, bottom: 14 }}>
                      <XAxis
                        dataKey="date"
                        tickFormatter={xTickFormatter}
                        minTickGap={18}
                        height={30}
                        tickMargin={8}
                        stroke="color-mix(in srgb, var(--text) 35%, transparent)"
                        tick={{ fill: 'color-mix(in srgb, var(--text) 55%, transparent)', fontSize: 11 }}
                        axisLine={{ stroke: 'color-mix(in srgb, var(--text) 18%, transparent)' }}
                        tickLine={{ stroke: 'color-mix(in srgb, var(--text) 18%, transparent)' }}
                      />
                      <YAxis
                        domain={[yDomain.min, yDomain.max]}
                        width={58}
                        tickFormatter={formatCompact1}
                        tickMargin={10}
                        stroke="color-mix(in srgb, var(--text) 35%, transparent)"
                        tick={{ fill: 'color-mix(in srgb, var(--text) 65%, transparent)', fontSize: 12, fontWeight: 700 }}
                        axisLine={{ stroke: 'color-mix(in srgb, var(--text) 18%, transparent)' }}
                        tickLine={{ stroke: 'color-mix(in srgb, var(--text) 18%, transparent)' }}
                      />

                      <Tooltip
                        formatter={(v: unknown, name: unknown) => [formatCompact1(v), String(name)]}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 12,
                          color: 'var(--text)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                        }}
                        labelStyle={{ color: 'var(--text-muted)', fontWeight: 800 }}
                        itemStyle={{ color: 'var(--text)', fontWeight: 700 }}
                        cursor={{ stroke: 'color-mix(in srgb, var(--text) 20%, transparent)' }}
                      />

                      {/* LIMIT LINES */}
                      {limitDisplay !== 'None' &&
                        !compareCities &&
                        series.flatMap((s) => {
                          if (s.mode !== 'pollutant') return [];
                          const k = s.key as PollutantKey;
                          const who = LIMITS_ANNUAL_BY_AUTH.WHO[k];
                          const eu = LIMITS_ANNUAL_BY_AUTH.EU[k];
                          const showLabels = true;

                          const lines = [] as ReactNode[];
                          if ((limitDisplay === 'WHO' || limitDisplay === 'WHO and EU') && typeof who === 'number') {
                            lines.push(
                              <ReferenceLine
                                key={`${String(s.key)}-who`}
                                y={who}
                                stroke={s.color}
                                strokeDasharray="6 6"
                                strokeWidth={2}
                                opacity={0.7}
                                label={
                                  showLabels
                                    ? { value: `WHO: ${who}`, position: 'left', fill: s.color, fontSize: 10 }
                                    : undefined
                                }
                              />,
                            );
                          }
                          if ((limitDisplay === 'EU' || limitDisplay === 'WHO and EU') && typeof eu === 'number') {
                            lines.push(
                              <ReferenceLine
                                key={`${String(s.key)}-eu`}
                                y={eu}
                                stroke={s.color}
                                strokeDasharray="2 6"
                                strokeWidth={2}
                                opacity={0.7}
                                label={
                                  showLabels
                                    ? { value: `EU: ${eu}`, position: 'left', fill: s.color, fontSize: 10 }
                                    : undefined
                                }
                              />,
                            );
                          }
                          return lines;
                        })}

                      {limitDisplay !== 'None' &&
                        compareCities &&
                        (() => {
                          const k = comparePollutantKey!;
                          const who = LIMITS_ANNUAL_BY_AUTH.WHO[k];
                          const eu = LIMITS_ANNUAL_BY_AUTH.EU[k];
                          const stroke = pollutantColors[k];

                          const lines: ReactNode[] = [];
                          if ((limitDisplay === 'WHO' || limitDisplay === 'WHO and EU') && typeof who === 'number') {
                            lines.push(
                              <ReferenceLine
                                key={`compare-who`}
                                y={who}
                                stroke={stroke}
                                strokeDasharray="6 6"
                                strokeWidth={2}
                                opacity={0.7}
                                label={{ value: `WHO: ${who}`, position: 'left', fill: stroke, fontSize: 10 }}
                              />,
                            );
                          }
                          if ((limitDisplay === 'EU' || limitDisplay === 'WHO and EU') && typeof eu === 'number') {
                            lines.push(
                              <ReferenceLine
                                key={`compare-eu`}
                                y={eu}
                                stroke={stroke}
                                strokeDasharray="2 6"
                                strokeWidth={2}
                                opacity={0.7}
                                label={{ value: `EU: ${eu}`, position: 'left', fill: stroke, fontSize: 10 }}
                              />,
                            );
                          }
                          return lines;
                        })()}

                      {/* LINES */}
                      {series.map((s) => (
                        <Line
                          key={String(s.key)}
                          type="monotone"
                          dataKey={s.dataKey}
                          name={s.mode === 'pollutant' ? s.name : s.label}
                          stroke={s.color}
                          strokeWidth={2}
                          dot={false}
                          connectNulls={false}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Summary bar inside chart */}
              <div className={styles.summaryBar}>
                <div className={styles.summaryPill}>
                  <span className={styles.summaryPillLabel}>City:</span>
                  <span className={styles.summaryPillValue}>
                    {compareCities ? selectedCitiesEffective.join(', ') : activeCity}
                  </span>
                </div>
                <div className={styles.summaryPill}>
                  <span className={styles.summaryPillLabel}>Pollutants:</span>
                  <span className={styles.summaryPillValue}>
                    {selectedPollutants.map((k) => pollutantLabelToCsv[k]).join(', ') || 'None'}
                  </span>
                </div>
                <div className={styles.summaryPill}>
                  <span className={styles.summaryPillLabel}>Limit:</span>
                  <span className={styles.summaryPillValue}>{limitDisplay}</span>
                </div>
                <div className={styles.summaryPill}>
                  <span className={styles.summaryPillLabel}>Predicition:</span>
                  <span className={styles.summaryPillValue}>{showForecast ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
