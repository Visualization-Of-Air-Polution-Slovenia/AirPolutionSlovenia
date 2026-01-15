import { useEffect, useMemo, useRef, useState } from 'react';

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

  const [cityPage, setCityPage] = useState(0);
  const cityPageSize = 8;
  const cityPages = Math.max(1, Math.ceil(allCities.length / cityPageSize));
  const visibleCities = cityPages > 1 ? allCities.slice(cityPage * cityPageSize, (cityPage + 1) * cityPageSize) : allCities;

  useEffect(() => {
    setCityPage((p) => Math.min(Math.max(0, p), cityPages - 1));
  }, [cityPages]);



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


  const yDomainsByKey = useMemo(() => {
  const out: Record<string, { min: number; max: number; range: number }> = {};

  for (const s of series) {
    const vals = s.points.map((p) => p.value);

    const k = s.key as PollutantKey;
    const who = LIMITS_ANNUAL_BY_AUTH.WHO[k];
    const eu = LIMITS_ANNUAL_BY_AUTH.EU[k];

    if ((limitDisplay === 'WHO' || limitDisplay === 'WHO and EU') && typeof who === 'number') vals.push(who);
    if ((limitDisplay === 'EU' || limitDisplay === 'WHO and EU') && typeof eu === 'number') vals.push(eu);

    if (vals.length === 0) continue;

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    out[s.key] = { min, max, range: max - min || 1 };
  }

  return out;
}, [series, limitDisplay]);


  const chartSvg = useMemo(() => {
    if (series.length === 0) return null;

    const { start: startStr, end: endStr } = clampDateOrder(startDateInput, endDateInput);
    if (!startStr || !endStr) return null;

    const startDate = parseDate(startStr);
    const endDate = parseDate(endStr);
    if (startDate > endDate) return null;

    const axisDates: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      axisDates.push(formatDate(d));
      if (axisDates.length > 11000) break;
    }
    if (axisDates.length < 2) return null;

    const dateToIndex = new Map<string, number>();
    axisDates.forEach((ds, idx) => dateToIndex.set(ds, idx));

    const W = 900;
    const H = 260;

    const left = 40;
    const right = 12;
    const top = 12;
    const bottom = 36;

    const w = W - left - right;
    const h = H - top - bottom;

    const stepX = w / (axisDates.length - 1);

    const valueToY = (seriesKey: string, v: number) => {
      const dom = yDomainsByKey[seriesKey];
      if (!dom) return top + h / 2;
      return top + (1 - (v - dom.min) / dom.range) * h;
    };

    const diffDays = (a: string, b: string) => {
      const da = parseDate(a);
      const db = parseDate(b);
      return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
    };

    const buildPathWithGaps = (seriesKey: string, pts: ChartPoint[]) => {
      const inRange = pts.filter((p) => p.date >= axisDates[0] && p.date <= axisDates[axisDates.length - 1]);
      if (inRange.length < 2) return null;

      let d = '';
      let prevDate: string | null = null;

      for (const p of inRange) {
        const idx = dateToIndex.get(p.date);
        if (idx === undefined) continue;

        const x = left + idx * stepX;
        const y = valueToY(seriesKey, p.value);

        if (!prevDate || diffDays(prevDate, p.date) > 1) {
          d += ` M ${x} ${y}`;
        } else {
          d += ` L ${x} ${y}`;
        }

        prevDate = p.date;
      }

      return d.trim().length ? d : null;
    };

    const firstDate = axisDates[0];
    const lastDate = axisDates[axisDates.length - 1];

    return (
      <svg width="100%" height="260" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <line x1={left} y1={top} x2={left} y2={top + h} stroke="currentColor" opacity="0.25" />
        <line x1={left} y1={top + h} x2={left + w} y2={top + h} stroke="currentColor" opacity="0.25" />

        
        {series.map((s) => {
          const pathD = buildPathWithGaps(s.key, s.points);
          if (!pathD) return null;
          return <path key={s.key} d={pathD} fill="none" stroke={s.color} strokeWidth="2" opacity="0.95" />;
        })}

        
        {limitDisplay !== 'None' &&
        series.map((s) => {
          const key = s.key as PollutantKey;

          const who = LIMITS_ANNUAL_BY_AUTH.WHO[key];
          const eu = LIMITS_ANNUAL_BY_AUTH.EU[key];

          const renderLimit = (kind: 'WHO' | 'EU', v: number, dash: string, labelX: number) => {
            const y = valueToY(s.key, v);
            return (
              <g key={`${s.key}-${kind}`}>
                <line
                  x1={left}
                  x2={left + w}
                  y1={y}
                  y2={y}
                  stroke={s.color}
                  strokeWidth="2"
                  strokeDasharray={dash}
                  opacity="0.7"
                />
                <text x={labelX} y={y - 6} fontSize="10" fill={s.color} opacity="0.9" style={{ fontWeight: 700 }}>
                  {kind}: {v}
                </text>
              </g>
            );
          };

          return (
            <g key={`${s.key}-limits`}>
              {(limitDisplay === 'WHO' || limitDisplay === 'WHO and EU') && typeof who === 'number'
                ? renderLimit('WHO', who, '6 6', left + 6)
                : null}

              {(limitDisplay === 'EU' || limitDisplay === 'WHO and EU') && typeof eu === 'number'
                ? renderLimit('EU', eu, '2 6', left + 78)
                : null}
            </g>
          );
        })}


        <text x={left} y={top + h + 22} fontSize="10" fill="currentColor" opacity="0.6">
          {firstDate}
        </text>
        <text x={left + w - 70} y={top + h + 22} fontSize="10" fill="currentColor" opacity="0.6">
          {lastDate}
        </text>
      </svg>
    );  
  }, [series, yDomainsByKey, startDateInput, endDateInput, limitDisplay]);


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

                return (
                  <div
                    key={loc}
                    className={styles.locationPill}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${loc}`}
                    onClick={() => setActiveCity(loc)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setActiveCity(loc);
                    }}
                    style={{
                      cursor: 'pointer',
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
              {allStatus === 'loading' && <div style={{ padding: 16, color: 'var(--text-muted)' }}>Loading full dataset…</div>}
              {allStatus === 'error' && <div style={{ padding: 16, color: 'var(--warning)' }}>{allError}</div>}
              {allStatus === 'success' && allWarning && (
                <div style={{ padding: 16, color: 'var(--text-muted)' }}>
                  Data warnings: {allWarning}
                </div>
              )}
              {allStatus === 'success' && selectedPollutants.length === 0 && (
                <div style={{ padding: 16, color: 'var(--text-muted)' }}>Select at least one pollutant.</div>
              )}
              {allStatus === 'success' && selectedPollutants.length > 0 && chartSvg}
              {allStatus === 'success' && selectedPollutants.length > 0 && !chartSvg && (
                <div style={{ padding: 16, color: 'var(--text-muted)' }}>Not enough points for a chart.</div>
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

