import { useEffect, useMemo, useState } from 'react';

import styles from './MapView.module.css';

import { useAppStore } from '@/store/useStore';
import { MapViewContent } from './MapView.content';
import { CitySidebarPlaceholderText } from './MapView.config';

import { SloveniaMap } from './components/SloveniaMap/SloveniaMap';

export const MapView = () => {
  const { pollutionType, setPollutionType, selectedRegion, setSelectedRegion } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const exists = MapViewContent.cities.some((c) => c.key === selectedRegion);
    if (!selectedRegion || !exists) {
      setSelectedRegion(MapViewContent.defaults.cityKey);
    }
  }, [selectedRegion, setSelectedRegion]);

  const selectedCity = useMemo(() => {
    const fallback = MapViewContent.cities.find((c) => c.key === MapViewContent.defaults.cityKey) ?? MapViewContent.cities[0];
    const city = MapViewContent.cities.find((c) => c.key === selectedRegion);
    return city ?? fallback;
  }, [selectedRegion]);

  const sidebarIcon = sidebarOpen ? MapViewContent.sidebar.toggleOpenIcon : MapViewContent.sidebar.toggleClosedIcon;
  const sidebarButtonAria = sidebarOpen ? MapViewContent.sidebar.toggleCloseAriaLabel : MapViewContent.sidebar.toggleOpenAriaLabel;

  const sidebarVariantClass =
    selectedCity.pinVariant === 'good'
      ? styles.sidebarVariantGood
      : selectedCity.pinVariant === 'moderate'
        ? styles.sidebarVariantModerate
        : styles.sidebarVariantUnhealthy;

  return (
    <main className={styles.page} aria-label={MapViewContent.pageAriaLabel}>
      <div className={styles.mapStage}>
        <div className={styles.mapFrame}>
          <SloveniaMap
            center={MapViewContent.map.center}
            zoom={MapViewContent.map.zoom}
            tileUrl={MapViewContent.map.tileUrl}
            tileAttribution={MapViewContent.map.tileAttribution}
            cities={MapViewContent.cities.map((c) => ({ key: c.key, name: c.name, position: c.position }))}
            selectedCityKey={selectedCity.key}
            onSelectCity={(key) => setSelectedRegion(key)}
          />
        </div>

        <div className={styles.vignette} />

        <div className={`${styles.blob} ${styles.blobPrimary} ${styles.blobOne}`} />
        <div className={`${styles.blob} ${styles.blobWarning} ${styles.blobTwo}`} />
        <div className={`${styles.blob} ${styles.blobPrimary} ${styles.blobThree}`} />
      </div>

      <div className={styles.controls}>
        <div className={`${styles.glass} ${styles.panel}`}>
          <div className={styles.panelLabel}>{MapViewContent.panel.selectPollutantLabel}</div>
          <div className={styles.pillRow}>
            {MapViewContent.pollutantOrder.map((t) => (
              <button
                key={t}
                className={`${styles.pill} ${pollutionType === t ? styles.pillActive : ''}`}
                onClick={() => setPollutionType(t)}
                type="button"
              >
                {MapViewContent.pollutantLabels[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom/center controls removed for now */}
      </div>

      <aside
        className={`${styles.glass} ${styles.sidebar} ${sidebarVariantClass} ${sidebarOpen ? '' : styles.sidebarCollapsed}`}
        aria-label={MapViewContent.sidebar.ariaLabel}
      >
        <button
          type="button"
          className={styles.sidebarToggle}
          aria-label={sidebarButtonAria}
          onClick={() => setSidebarOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">{sidebarIcon}</span>
        </button>

        <div className={styles.sidebarHeader}>
          <div className={styles.headerImage}>
            {selectedCity.heroImageUrl ? (
              <img className={styles.headerImg} alt={MapViewContent.sidebar.cityImageAlt} src={selectedCity.heroImageUrl} />
            ) : null}
          </div>

          <div className={styles.headerFade} />

          <div className={styles.sidebarTitle}>
            <div className={styles.cityName}>{selectedCity.name}</div>
            <div className={styles.cityMeta}>
              <span className={`material-symbols-outlined ${styles.cityMetaIcon}`}>{MapViewContent.sidebar.locationIcon}</span>
              <span>{selectedCity.subtitle}</span>
            </div>
          </div>
        </div>

        <div className={styles.sidebarBody}>
          <div className={styles.sidebarScroll}>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>{MapViewContent.panel.aqiLabel}</div>
                <div className={styles.statValue}>
                  <div className={styles.aqiNumber}>{selectedCity.aqi.value}</div>
                  <div className={styles.aqiBadge}>{selectedCity.aqi.label}</div>
                </div>
              </div>
              <div aria-hidden="true" className={styles.statusRing}>
                <span className="material-symbols-outlined">{MapViewContent.sidebar.statusIcon}</span>
              </div>
            </div>

            <section>
              <div className={styles.sectionTitle}>{MapViewContent.panel.pollutantsTitle}</div>
              <div className={styles.grid}>
                {MapViewContent.pollutantOrder.map((t) => {
                  const item = selectedCity.pollutants[t];
                  return (
                    <div key={t} className={styles.gridItem}>
                      <div className={styles.k}>{MapViewContent.pollutantLabels[t]}</div>
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
              <div className={styles.adviceText}>{MapViewContent.sidebar.healthAdviceText}</div>
            </section>

            {!selectedCity.heroImageUrl ? (
              <section className={styles.advice}>
                <div className={styles.adviceText}>{CitySidebarPlaceholderText}</div>
              </section>
            ) : null}
          </div>
        </div>
      </aside>
    </main>
  );
};
