import { useMemo } from 'react';

import styles from './MapView.module.css';

import { useAppStore } from '@/store/useStore';
import { MapViewContent } from './MapView.content';
import { CITIES } from './MapView.config';

const POLLUTANT_LABELS: Record<string, string> = {
  pm10: 'PM₁₀',
  'pm2.5': 'PM₂.₅',
  no2: 'NO₂',
  o3: 'O₃',
};

export const MapView = () => {
  const { pollutionType, setPollutionType, selectedRegion, setSelectedRegion } = useAppStore();

  const selectedCity = useMemo(() => {
    const fallback = CITIES[0];
    const city = CITIES.find((c) => c.name === selectedRegion);
    return city ?? fallback;
  }, [selectedRegion]);

  return (
    <main className={styles.page}>
      <div className={styles.mapStage}>
        <img
          className={styles.mapImage}
          alt="Abstract dark map texture"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLBIH4MJBlCeZVX4qgIw1TXpCpxAaBn5bK569zBW38UX0hHAfi_wGsPYiMqwo4kJfsnFx-pYEIZE7zycsq5azrfL682mYw9tu1BweaQI4Huloc0Dvy7gM8N7zJfyg0DM7dpmvSoHGam8kDMo-QclmqAKI3nIntu-9vwhAt9U-7HYI1WSwk1DqKwNLdGDnxg2PVznDfHI4cMaAeeilNXcvEBKVD1D1HbE1kr_NOIsaMNkEhM0TzV1ghLuXHoxvZuIcuKq_9xMTaqDPh"
        />
        <div className={styles.vignette} />

        <div className={`${styles.blob} ${styles.blobPrimary}`} style={{ top: '30%', left: '45%', width: 260, height: 260 }} />
        <div className={`${styles.blob} ${styles.blobWarning}`} style={{ top: '40%', left: '55%', width: 220, height: 220 }} />
        <div className={`${styles.blob} ${styles.blobPrimary}`} style={{ top: '25%', left: '60%', width: 160, height: 160, opacity: 0.26 }} />

        {CITIES.map((city) => {
          const moderate = city.key === 'maribor';
          return (
            <div
              key={city.key}
              className={styles.pin}
              style={{ top: city.mapPosition.top, left: city.mapPosition.left, opacity: city.name === selectedCity.name ? 1 : 0.75 }}
              onClick={() => setSelectedRegion(city.name)}
              role="button"
              tabIndex={0}
            >
              <div className={`${styles.pinDot} ${moderate ? styles.pinDotModerate : ''}`} />
              <div className={styles.pinName}>{city.name}</div>
            </div>
          );
        })}
      </div>

      <div className={styles.controls}>
        <div className={`${styles.glass} ${styles.panel}`}>
          <div className={styles.panelLabel}>{MapViewContent.panel.selectPollutantLabel}</div>
          <div className={styles.pillRow}>
            {(['pm10', 'pm2.5', 'no2', 'o3'] as const).map((t) => (
              <button
                key={t}
                className={`${styles.pill} ${pollutionType === t ? styles.pillActive : ''}`}
                onClick={() => setPollutionType(t)}
                type="button"
              >
                {POLLUTANT_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className={`${styles.glass} ${styles.zoomWrap}`}>
          <button className={styles.zoomBtn} type="button" aria-label="Zoom in">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className={styles.zoomBtn} type="button" aria-label="Zoom out">
            <span className="material-symbols-outlined">remove</span>
          </button>
        </div>

        <button className={`${styles.glass} ${styles.panel}`} type="button" aria-label="Center map" style={{ padding: 0, width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center' }}>
          <span className="material-symbols-outlined">near_me</span>
        </button>
      </div>

      <aside className={`${styles.glass} ${styles.sidebar}`} aria-label="City details">
        <div className={styles.sidebarHeader}>
          <div
            className={styles.headerImage}
            style={{ backgroundImage: selectedCity.heroImageUrl ? `url(${selectedCity.heroImageUrl})` : 'linear-gradient(135deg, rgba(43,238,121,0.18), rgba(59,130,246,0.10))' }}
          />
          <div className={styles.headerFade} />
          <div className={styles.sidebarTitle}>
            <div className={styles.cityName}>{selectedCity.name}</div>
            <div className={styles.cityMeta}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>
                location_on
              </span>
              <span>{selectedCity.subtitle}</span>
            </div>
          </div>
        </div>

        <div className={styles.sidebarBody}>
          <div className={styles.statCard}>
            <div>
              <div className={styles.statLabel}>{MapViewContent.panel.aqiLabel}</div>
              <div className={styles.statValue}>
                <div className={styles.aqiNumber}>{selectedCity.aqi.value}</div>
                <div className={styles.aqiBadge}>{selectedCity.aqi.label}</div>
              </div>
            </div>
            <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 9999, border: `4px solid color-mix(in srgb, var(--primary) 30%, transparent)`, display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined">check</span>
            </div>
          </div>

          <section>
            <div style={{ fontWeight: 800, marginBottom: 'var(--distance-md)' }}>{MapViewContent.panel.pollutantsTitle}</div>
            <div className={styles.grid}>
              {(['pm10', 'pm2.5', 'no2', 'o3'] as const).map((t) => {
                const item = selectedCity.pollutants[t];
                return (
                  <div key={t} className={styles.gridItem}>
                    <div className={styles.k}>{POLLUTANT_LABELS[t]}</div>
                    <div className={styles.v}>
                      {item.value} <span className={styles.unit}>{item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.advice}>
            <div className={styles.adviceTitle}>{MapViewContent.panel.healthAdviceTitle}</div>
            <div className={styles.adviceText}>
              Current levels are within typical ranges. If you are sensitive, consider reducing prolonged outdoor activity when the selected pollutant spikes.
            </div>
          </section>
        </div>
      </aside>
    </main>
  );
};
