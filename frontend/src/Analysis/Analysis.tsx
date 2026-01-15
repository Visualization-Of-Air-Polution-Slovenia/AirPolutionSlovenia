import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import styles from './Analysis.module.css';

import { useAppStore } from '@/store/useStore';
import { AnalysisContent } from './Analysis.content';

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
    o3: 120, 
  },
  WHO: {
    'pm2.5': 5,
    pm10: 15,
    no2: 10,
    o3: 60, 
  },
};


export const Analysis = () => {
  const { pollutionType } = useAppStore();

  const [timeRange, setTimeRange] = useState<TimeRangeKey>('7D');
  const [rangeMode, setRangeMode] = useState<'preset' | 'custom'>('preset');
  const [customDays, setCustomDays] = useState<number>(30);
  const didInitRangeRef = useRef(false);

  const [startDateInput, setStartDateInput] = useState<string>('2023-10-01');
  const [endDateInput, setEndDateInput] = useState<string>('2023-10-07');

  const [activeCity, setActiveCity] = useState<string>('Ljubljana');

  // multi-select pollutants
  const [selectedPollutants, setSelectedPollutants] = useState<PollutantKey[]>([
    (pollutionType as PollutantKey) ?? 'pm10',
  ]);

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
    const initialDays = 7; // matches initial timeRange default: '7D'

    async function loadAll() {
      try {
        setAllStatus('loading');
        setAllError('');
        setAllWarning('');

        const apiBaseRaw = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL) : '';
        const apiBase = apiBaseRaw.replace(/\/$/, '');
        const url = `${apiBase}/api/arso/all`;

        const res = await fetch(url);
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
            const days = initialDays;
            const start = new Date(end);
            start.setDate(start.getDate() - (days - 1));
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

    if (uniq.includes('Ljubljana')) {
      return ['Ljubljana', ...uniq.filter((c) => c !== 'Ljubljana')];
    }
    return uniq;
  }, [allStatus, allRows]);

  const dataRange = useMemo(() => {
    if (allRows.length === 0) return null;
    const dates = allRows.map((r) => r.date).filter(Boolean);
    if (dates.length === 0) return null;

    const minDate = dates.reduce((acc, d) => (d < acc ? d : acc), dates[0]);
    const maxDate = dates.reduce((acc, d) => (d > acc ? d : acc), dates[0]);
    return { minDate, maxDate };
  }, [allRows]);

  useEffect(() => {
    if (allCities.length === 0) return;
    if (allCities.includes(activeCity)) return;
    setActiveCity(allCities.includes('Ljubljana') ? 'Ljubljana' : (allCities[0] ?? 'Ljubljana'));
  }, [allCities, activeCity]);

  // Build an index: city -> pollutant -> sorted points[]
  const indexed = useMemo(() => {
    const map = new Map<string, Map<string, ChartPoint[]>>();

    for (const r of allRows) {
      if (!map.has(r.city)) map.set(r.city, new Map());
      const byCity = map.get(r.city)!;

      if (!byCity.has(r.pollutant)) byCity.set(r.pollutant, []);
      byCity.get(r.pollutant)!.push({ date: r.date, value: r.value });
    }

    for (const byCity of map.values()) {
      for (const s of byCity.values()) {
        s.sort((a, b) => a.date.localeCompare(b.date));
      }
    }

    return map;
  }, [allRows]);

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
      pm10: '#3b82f6', // blue
      'pm2.5': '#f59e0b', // amber
      no2: '#10b981', // green
      o3: '#ef4444', // red
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

  const setRangeToLatest = (t: TimeRangeKey) => {
    if (!dataRange) return;
    const end = parseDate(dataRange.maxDate);
    const days = limitDaysFromTimeRange(t);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));

    setStartDateInput(formatDate(start));
    setEndDateInput(formatDate(end));
  };

  // Custom mode: keep end date synced to start + N days.
  useEffect(() => {
    if (rangeMode !== 'custom') return;
    if (!startDateInput) return;
    if (!Number.isFinite(customDays) || customDays <= 0) return;

    const start = parseDate(startDateInput);
    const end = new Date(start);
    end.setDate(end.getDate() + (customDays - 1));
    setEndDateInput(formatDate(end));
  }, [rangeMode, startDateInput, customDays]);

  const countsByPollutant = useMemo(() => {
    const out: Record<PollutantKey, number> = { pm10: 0, 'pm2.5': 0, no2: 0, o3: 0 };
    const { start, end } = clampDateOrder(startDateInput, endDateInput);
    if (!start || !end) return out;

    for (const r of allRows) {
      if (r.city !== activeCity) continue;
      if (r.date < start || r.date > end) continue;

      if (r.pollutant === pollutantLabelToCsv.pm10) out.pm10 += 1;
      if (r.pollutant === pollutantLabelToCsv['pm2.5']) out['pm2.5'] += 1;
      if (r.pollutant === pollutantLabelToCsv.no2) out.no2 += 1;
      if (r.pollutant === pollutantLabelToCsv.o3) out.o3 += 1;
    }

    return out;
  }, [allRows, activeCity, startDateInput, endDateInput, pollutantLabelToCsv]);

  const countsByCity = useMemo(() => {
    const out: Record<string, number> = {};
    const { start, end } = clampDateOrder(startDateInput, endDateInput);
    if (!start || !end) return out;

    const selectedPollutantSet = new Set(selectedPollutants.map((k) => pollutantLabelToCsv[k]));
    for (const r of allRows) {
      if (r.date < start || r.date > end) continue;
      if (!selectedPollutantSet.has(r.pollutant)) continue;
      out[r.city] = (out[r.city] ?? 0) + 1;
    }
    return out;
  }, [allRows, selectedPollutants, startDateInput, endDateInput, pollutantLabelToCsv]);

  const enabledCities = useMemo(() => {
    return allCities.filter((c) => (countsByCity[c] ?? 0) > 0);
  }, [allCities, countsByCity]);

  const disabledCities = useMemo(() => {
    return allCities.filter((c) => (countsByCity[c] ?? 0) === 0);
  }, [allCities, countsByCity]);

  const sortedCities = useMemo(() => {
    // Keep original ordering for enabled cities (Ljubljana-first), push empty cities to the bottom.
    return [...enabledCities, ...disabledCities];
  }, [enabledCities, disabledCities]);

  const [cityPage, setCityPage] = useState(0);
  const cityPageSize = 8;
  const cityPages = Math.max(1, Math.ceil(sortedCities.length / cityPageSize));
  const visibleCities =
    cityPages > 1 ? sortedCities.slice(cityPage * cityPageSize, (cityPage + 1) * cityPageSize) : sortedCities;

  useEffect(() => {
    setCityPage((p) => Math.min(Math.max(0, p), cityPages - 1));
  }, [cityPages]);

  useEffect(() => {
    // If current active city has no data for the selected range/pollutants, switch to first enabled.
    if (enabledCities.length === 0) return;
    if ((countsByCity[activeCity] ?? 0) > 0) return;
    setActiveCity(enabledCities[0] ?? activeCity);
  }, [enabledCities, countsByCity, activeCity]);



  const series = useMemo(() => {
    const byCity = indexed.get(activeCity);
    if (!byCity) return [];

    const { start, end } = clampDateOrder(startDateInput, endDateInput);
    const hasRange = Boolean(start && end);

    return selectedPollutants.map((k) => {
      const csvPollutant = pollutantLabelToCsv[k];
      const pts = byCity.get(csvPollutant) ?? [];

      const filtered = hasRange ? pts.filter((p) => p.date >= start && p.date <= end) : pts;

      return {
        key: k,
        label: POLLUTANTS.find((p) => p.key === k)?.label ?? k,
        color: pollutantColors[k],
        points: filtered,
      };
    });
  }, [indexed, activeCity, selectedPollutants, pollutantColors, pollutantLabelToCsv, startDateInput, endDateInput]);

  const pollutantKeyToDataKey = useMemo(() => {
    const map: Record<PollutantKey, string> = {
      pm10: 'pm10',
      'pm2.5': 'pm2_5',
      no2: 'no2',
      o3: 'o3',
    };
    return map;
  }, []);

  const chartData = useMemo(() => {
    const byDate = new Map<string, RechartsDatum>();

    for (const s of series) {
      const dataKey = pollutantKeyToDataKey[s.key as PollutantKey];
      for (const p of s.points) {
        const row = byDate.get(p.date) ?? { date: p.date };
        row[dataKey] = p.value;
        byDate.set(p.date, row);
      }
    }

    const out = Array.from(byDate.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));

    // Ensure nulls for missing series keys (keeps gaps in lines)
    for (const row of out) {
      for (const k of selectedPollutants) {
        const dk = pollutantKeyToDataKey[k];
        if (!(dk in row)) row[dk] = null;
      }
    }

    return out;
  }, [series, selectedPollutants, pollutantKeyToDataKey]);


  const yDomain = useMemo(() => {
    const vals: number[] = [];

    for (const s of series) {
      for (const p of s.points) vals.push(p.value);

      const k = s.key as PollutantKey;
      const who = LIMITS_ANNUAL_BY_AUTH.WHO[k];
      const eu = LIMITS_ANNUAL_BY_AUTH.EU[k];
      if ((limitDisplay === 'WHO' || limitDisplay === 'WHO and EU') && typeof who === 'number') vals.push(who);
      if ((limitDisplay === 'EU' || limitDisplay === 'WHO and EU') && typeof eu === 'number') vals.push(eu);
    }

    if (vals.length === 0) return { min: 0, max: 1 };

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const pad = range * 0.08;
    return { min: Math.max(0, min - pad), max: max + pad };
  }, [series, limitDisplay]);

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
    const keys = selectedPollutants.map((k) => pollutantKeyToDataKey[k]);
    let nonNullPoints = 0;
    for (const row of chartData) {
      if (keys.some((k) => row[k] !== null && row[k] !== undefined)) nonNullPoints += 1;
      if (nonNullPoints >= 2) return true;
    }
    return false;
  }, [chartData, selectedPollutants, pollutantKeyToDataKey]);

  const formatCompact1 = (value: unknown) => {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return '';

    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';

    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}k`;
    return `${n.toFixed(1)}`;
  };


  const togglePollutant = (key: PollutantKey) => {
    setSelectedPollutants((prev) => {
      const has = prev.includes(key);
      if (has) return prev.filter((k) => k !== key);
      return [...prev, key];
    });
  };

  const allSelected = selectedPollutants.length === POLLUTANTS.length;

  const onSelectAll = () => {
    if (allSelected) setSelectedPollutants([]);
    else setSelectedPollutants(POLLUTANTS.map((p) => p.key));
  };

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
              <button className={styles.smallLink} type="button" onClick={onSelectAll}>
                {allSelected ? 'Clear' : 'Select All'}
              </button>
            </div>

            <div className={styles.grid2}>
              {POLLUTANTS.map((p) => {
                const checked = selectedPollutants.includes(p.key);
                const count = countsByPollutant[p.key];
                return (
                  <label key={p.key} className={`${styles.option} ${checked ? styles.optionActive : ''}`}>
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePollutant(p.key)}
                    />
                    <span className={styles.optionText}>
                      {p.label}
                      <span style={{ marginLeft: 6, opacity: 0.7, fontWeight: 700 }}>({count ?? 0})</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>
              Counts shown for <b>{activeCity}</b> within the selected date range.
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
                    if (rangeMode === 'preset') {
                      setRangeToLatest(t);
                    } else {
                      setCustomDays(limitDaysFromTimeRange(t));
                    }
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {dataRange && (
              <div className={styles.dataInfo}>
                Available: {dataRange.minDate} → {dataRange.maxDate}
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
                const isActive = loc === activeCity;
                const count = countsByCity[loc] ?? 0;
                const isDisabled = count === 0;

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
                      setActiveCity(loc);
                    }}
                    onKeyDown={(e) => {
                      if (isDisabled) return;
                      if (e.key === 'Enter' || e.key === ' ') setActiveCity(loc);
                    }}
                    style={{
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      border: isActive ? '1px solid var(--primary)' : undefined,
                      background: isActive ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--distance)' }}>
                      <span className={styles.dot} style={{ background: 'var(--primary)' }} />
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
        </div>

        <div className={styles.sideFooter}>
          <button className={styles.btnPrimary} type="button">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}
            >
              play_arrow
            </span>
            {AnalysisContent.side.run}
          </button>
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
                <div className={styles.cardSubtitle}>{AnalysisContent.widgets.trendsSubtitle}</div>
              </div>

              <div className={styles.legend}>
                {selectedPollutants.map((k) => (
                  <div key={k} className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: pollutantColors[k] }} /> {pollutantLabelToCsv[k]}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.chartArea}>
              {allStatus === 'loading' && <div className={styles.chartMessage}>Loading full dataset…</div>}
              {allStatus === 'error' && <div className={styles.chartMessage} style={{ color: 'var(--warning)' }}>{allError}</div>}
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
                        formatter={(v: unknown, name: unknown) => [formatCompact1(v), String(name).toUpperCase()]}
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

                      {limitDisplay !== 'None' &&
                        series.flatMap((s) => {
                          const k = s.key as PollutantKey;
                          const who = LIMITS_ANNUAL_BY_AUTH.WHO[k];
                          const eu = LIMITS_ANNUAL_BY_AUTH.EU[k];
                          const showLabels = selectedPollutants.length === 1;

                          const lines = [] as ReactNode[];
                          if ((limitDisplay === 'WHO' || limitDisplay === 'WHO and EU') && typeof who === 'number') {
                            lines.push(
                              <ReferenceLine
                                key={`${s.key}-who`}
                                y={who}
                                stroke={s.color}
                                strokeDasharray="6 6"
                                strokeWidth={2}
                                opacity={0.7}
                                label={showLabels ? { value: `WHO: ${who}`, position: 'insideTopLeft', fill: s.color, fontSize: 10 } : undefined}
                              />,
                            );
                          }
                          if ((limitDisplay === 'EU' || limitDisplay === 'WHO and EU') && typeof eu === 'number') {
                            lines.push(
                              <ReferenceLine
                                key={`${s.key}-eu`}
                                y={eu}
                                stroke={s.color}
                                strokeDasharray="2 6"
                                strokeWidth={2}
                                opacity={0.7}
                                label={showLabels ? { value: `EU: ${eu}`, position: 'insideTopLeft', fill: s.color, fontSize: 10 } : undefined}
                              />,
                            );
                          }
                          return lines;
                        })}

                      {series.map((s) => (
                        <Line
                          key={s.key}
                          type="monotone"
                          dataKey={pollutantKeyToDataKey[s.key as PollutantKey]}
                          name={pollutantLabelToCsv[s.key as PollutantKey]}
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
                  <span className={styles.summaryPillValue}>{activeCity}</span>
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

