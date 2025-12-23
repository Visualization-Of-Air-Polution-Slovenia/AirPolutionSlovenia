import { useMemo, useState } from 'react';

import styles from './Analysis.module.css';

import { useAppStore } from '@/store/useStore';
import { AnalysisContent } from './Analysis.content';

const POLLUTANTS = [
  { key: 'pm10', label: 'PM₁₀' },
  { key: 'pm2.5', label: 'PM₂.₅' },
  { key: 'no2', label: 'NO₂' },
  { key: 'o3', label: 'O₃' },
] as const;

type TimeRangeKey = '24H' | '7D' | '30D' | '1Y';

export const Analysis = () => {
  const { pollutionType, setPollutionType, selectedRegion, setSelectedRegion } = useAppStore();

  const [timeRange, setTimeRange] = useState<TimeRangeKey>('7D');
  const [model, setModel] = useState('Moving Average (SMA)');

  const locations = useMemo(() => {
    const base = ['Maribor', 'Ljubljana'];
    if (selectedRegion && !base.includes(selectedRegion)) return [selectedRegion, ...base];
    return base;
  }, [selectedRegion]);

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
              <button className={styles.smallLink} type="button">
                Select All
              </button>
            </div>
            <div className={styles.grid2}>
              {POLLUTANTS.map((p) => (
                <label
                  key={p.key}
                  className={`${styles.option} ${pollutionType === p.key ? styles.optionActive : ''}`}
                >
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={pollutionType === p.key}
                    onChange={() => setPollutionType(p.key)}
                  />
                  <span className={styles.optionText}>{p.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className={styles.sectionTitle}>{AnalysisContent.side.timeRange}</div>
            <div className={styles.timeTabs}>
              {(['24H', '7D', '30D', '1Y'] as const).map((t) => (
                <button
                  key={t}
                  className={`${styles.timeTab} ${timeRange === t ? styles.timeTabActive : ''}`}
                  type="button"
                  onClick={() => setTimeRange(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className={styles.inputRow}>
              <input className={styles.input} type="date" defaultValue="2023-10-01" />
              <input className={styles.input} type="date" defaultValue="2023-10-07" />
            </div>
          </section>

          <section>
            <div className={styles.sectionTitle}>{AnalysisContent.side.model}</div>
            <select className={styles.select} value={model} onChange={(e) => setModel(e.target.value)}>
              <option>Linear Regression</option>
              <option>Moving Average (SMA)</option>
              <option>Exponential Smoothing</option>
              <option>Polynomial Trend</option>
            </select>
            <label className={styles.option} style={{ marginTop: 'var(--distance-md)' }}>
              <input className={styles.checkbox} type="checkbox" defaultChecked />
              <span className={styles.optionText}>Compare Cities</span>
            </label>
          </section>

          <section>
            <div className={styles.sectionTitle}>{AnalysisContent.side.locations}</div>
            <div className={styles.locations}>
              {locations.map((loc) => (
                <div key={loc} className={styles.locationPill}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--distance)' }}>
                    <span
                      className={styles.dot}
                      style={{ background: loc === 'Maribor' ? 'var(--warning)' : 'var(--primary)' }}
                    />
                    <span style={{ fontWeight: 700 }}>{loc}</span>
                  </div>
                  <button type="button" style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      close
                    </span>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSelectedRegion(selectedRegion ? null : 'Ljubljana')}
                style={{
                  borderRadius: 12,
                  padding: '10px 12px',
                  border: '1px dashed color-mix(in srgb, var(--border) 70%, transparent)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--distance-sm)',
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  add
                </span>
                Add Location
              </button>
            </div>
          </section>
        </div>

        <div className={styles.sideFooter}>
          <button className={styles.btnPrimary} type="button">
            <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>
              play_arrow
            </span>
            {AnalysisContent.side.run}
          </button>
        </div>
      </aside>

      <section className={styles.main} aria-label="Analysis results">
        <div className={styles.topbar}>
          <div className={styles.topTitle}>
            <span>{AnalysisContent.topbar.heading}: O₃ vs PM₁₀</span>
            <span className={styles.pill}>{AnalysisContent.topbar.updated}</span>
          </div>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={styles.dot} style={{ background: 'var(--warning)' }} /> Maribor (O₃)
            </div>
            <div className={styles.legendItem}>
              <span className={styles.dot} style={{ background: 'var(--primary)' }} /> Ljubljana (PM₁₀)
            </div>
            <button
              type="button"
              style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
              aria-label="More"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        <div className={styles.canvas}>
          <div className={styles.grid}>
            <div className={`${styles.card} ${styles.card8}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--distance-xl)', alignItems: 'start' }}>
                <div>
                  <div className={styles.cardTitle}>{AnalysisContent.widgets.trendsTitle}</div>
                  <div className={styles.cardSubtitle}>{AnalysisContent.widgets.trendsSubtitle}</div>
                </div>
                <div className={styles.legend}>
                  <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: 'var(--warning)' }} /> O₃
                  </div>
                  <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: 'var(--primary)' }} /> PM₁₀
                  </div>
                </div>
              </div>
              <div className={styles.chartArea} aria-label="Chart placeholder" />
            </div>

            <div className={`${styles.card} ${styles.card4}`}>
              <div className={styles.cardTitle}>{AnalysisContent.widgets.summaryTitle}</div>
              <div className={styles.cardSubtitle}>Highlights for the selected time range and model.</div>
              <div style={{ marginTop: 'var(--distance-xl)', display: 'grid', gap: 'var(--distance)' }}>
                <div style={{ padding: 'var(--distance-lg)', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'color-mix(in srgb, var(--surface-2) 70%, transparent)' }}>
                  <div style={{ fontWeight: 900 }}>Trend</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: 6 }}>O₃ shows periodic peaks; PM₁₀ remains stable.</div>
                </div>
                <div style={{ padding: 'var(--distance-lg)', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'color-mix(in srgb, var(--surface-2) 70%, transparent)' }}>
                  <div style={{ fontWeight: 900 }}>Model</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: 6 }}>{model}</div>
                </div>
                <div style={{ padding: 'var(--distance-lg)', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'color-mix(in srgb, var(--surface-2) 70%, transparent)' }}>
                  <div style={{ fontWeight: 900 }}>Selected</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: 6 }}>Primary pollutant: {pollutionType.toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
