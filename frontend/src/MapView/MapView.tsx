import { useEffect, useMemo, useState } from 'react';

import styles from './MapView.module.css';

import { useCityData, useSloveniaData } from '@/Services';
import { useAppStore } from '@/store/useStore';
import { MapViewContent } from './MapView.content';

import { SloveniaMap } from './components/SloveniaMap/SloveniaMap';

const MS_HOUR = 60 * 60 * 1000;

const floorToUtcHour = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), 0, 0, 0));

const addHoursUtc = (base: Date, hours: number) =>
  new Date(base.getTime() + hours * MS_HOUR);

const formatUtcHour = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:00 ` +
  `${String(d.getDate()).padStart(2, '0')}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${d.getFullYear()}`;

const formatLocalDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${d.getFullYear()}`;

export const MapView = () => {

  const nowUtcHour = useMemo(() => floorToUtcHour(new Date()), []);
  const [timeOffsetHours, setTimeOffsetHours] = useState(0);

  const selectedTimeIso = useMemo(() => {
    return addHoursUtc(nowUtcHour, timeOffsetHours).toISOString();
  }, [nowUtcHour, timeOffsetHours]);

  const { pollutionType, setPollutionType, selectedRegion, setSelectedRegion } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // =========================================================================
  // API Call: Fetch real-time data when selectedRegion changes
  // =========================================================================
  // useCityData is a React Query hook that:
  // - Automatically fetches when selectedRegion changes
  // - Caches the result (won't re-fetch if you switch back to same city)
  // - Provides isLoading, error, and data states
  const { data: cityApiData, isLoading, error } = useCityData(selectedRegion);

  const { data: sloveniaApiData, isLoading: sloveniaLoading, error: sloveniaError } = useSloveniaData();

  useEffect(() => {
    if (sloveniaLoading) {
      console.debug(`[API] Loading data for Slovenia`);
    }
    if (sloveniaError) {
      console.error(`[API] Error fetching Slovenia data:`, sloveniaError);
    }
  }, [sloveniaLoading, sloveniaError]);

  // Log to console so you can see what's happening
  useEffect(() => {
    if (isLoading) {
      console.debug(`[API] Loading data for city: ${selectedRegion}`);
    }
    if (error) {
      console.error(`[API] Error fetching city data:`, error);
    }
    if (cityApiData) {
      console.debug(`[API] Received data for ${selectedRegion}:`, cityApiData);
    }
  }, [selectedRegion, isLoading, error, cityApiData]);

  useEffect(() => {
    const exists = MapViewContent.cities.some((c) => c.key === selectedRegion);
    if (!selectedRegion || !exists) {
      setSelectedRegion(MapViewContent.defaults.cityKey);
    }
  }, [selectedRegion, setSelectedRegion]);

  // Get static city definition (for name, position, heroImage, etc.)
  const staticCity = useMemo(() => {
    const fallback = MapViewContent.cities.find((c) => c.key === MapViewContent.defaults.cityKey) ?? MapViewContent.cities[0];
    const city = MapViewContent.cities.find((c) => c.key === selectedRegion);
    return city ?? fallback;
  }, [selectedRegion]);

  // Merge static city data with live API data
  const selectedCity = useMemo(() => {
    // If no API data yet, use static city as-is
    if (!cityApiData?.data) {
      return staticCity;
    }

    const apiData = cityApiData.data;

    // Helper to determine badge based on AQI value
    const getAqiBadge = (aqi: number): 'good' | 'moderate' | 'unhealthy' => {
      if (aqi <= 50) return 'good';
      if (aqi <= 100) return 'moderate';
      return 'unhealthy';
    };

    // Helper to get AQI label
    const getAqiLabel = (aqi: number): string => {
      if (aqi <= 50) return 'Good';
      if (aqi <= 100) return 'Moderate';
      if (aqi <= 150) return 'Unhealthy for Sensitive';
      if (aqi <= 200) return 'Unhealthy';
      if (aqi <= 300) return 'Very Unhealthy';
      return 'Hazardous';
    };

    // Helper to get health advice based on AQI
    const getHealthAdvice = (aqi: number): string => {
      if (aqi <= 50) return 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
      if (aqi <= 100) return 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.';
      if (aqi <= 150) return 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.';
      if (aqi <= 200) return 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
      if (aqi <= 300) return 'Health warnings of emergency conditions. The entire population is more likely to be affected.';
      return 'Health alert: everyone may experience more serious health effects.';
    };

    // Build pollutants object with only available data
    const pollutants: typeof staticCity.pollutants = {};

    const apiPollutants = apiData.pollutants;
    if (apiPollutants) {
      if (apiPollutants.pm10 !== undefined) {
        pollutants.pm10 = { value: apiPollutants.pm10, unit: 'µg/m³', badge: getAqiBadge(apiPollutants.pm10) };
      }
      if (apiPollutants.pm25 !== undefined) {
        pollutants['pm2.5'] = { value: apiPollutants.pm25, unit: 'µg/m³', badge: getAqiBadge(apiPollutants.pm25) };
      }
      if (apiPollutants.no2 !== undefined) {
        pollutants.no2 = { value: apiPollutants.no2, unit: 'µg/m³', badge: getAqiBadge(apiPollutants.no2) };
      }
      if (apiPollutants.o3 !== undefined) {
        pollutants.o3 = { value: apiPollutants.o3, unit: 'PPM', badge: getAqiBadge(apiPollutants.o3) };
      }
    }

    const aqiValue = apiData.aqi ?? staticCity.aqi?.value;
    if (aqiValue === undefined) {
      return {
        ...staticCity,
        pollutants,
      };
    }

    return {
      ...staticCity,
      aqi: {
        value: aqiValue,
        label: getAqiLabel(aqiValue),
      },
      pollutants,
      pinVariant: getAqiBadge(aqiValue),
      healthAdvice: getHealthAdvice(aqiValue),
    };
  }, [staticCity, cityApiData]);

  const sidebarIcon = sidebarOpen ? MapViewContent.sidebar.toggleOpenIcon : MapViewContent.sidebar.toggleClosedIcon;
  const sidebarButtonAria = sidebarOpen ? MapViewContent.sidebar.toggleCloseAriaLabel : MapViewContent.sidebar.toggleOpenAriaLabel;

  const sidebarVariantClass =
    selectedCity.pinVariant === 'good'
      ? styles.sidebarVariantGood
      : selectedCity.pinVariant === 'moderate'
        ? styles.sidebarVariantModerate
        : selectedCity.pinVariant === 'unhealthy'
          ? styles.sidebarVariantUnhealthy
          : ''; // null = no variant class (loading state)

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
            sloveniaData={ sloveniaApiData?.data ?? [] }
            selectedTimeIso={selectedTimeIso}
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
          <div className={styles.panelLabel}>Time</div>

          <div className={styles.sliderWrap}>
            <input
              className={styles.slider}
              type="range"
              min={-72}
              max={72}
              step={1}
              value={timeOffsetHours}
              onChange={(e) => setTimeOffsetHours(Number(e.target.value))}
              aria-label="Select time"
            />
            <div className={styles.sliderMeta}>
              <span>{formatLocalDate(addHoursUtc(nowUtcHour, -72))}</span>
              <strong>{formatUtcHour(new Date(selectedTimeIso))}</strong>
              <span>{formatLocalDate(addHoursUtc(nowUtcHour, 72))}</span>
            </div>
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
                {selectedCity.aqi ? (
                  <div className={styles.statValue}>
                    <div className={styles.aqiNumber}>{selectedCity.aqi.value}</div>
                    <div className={styles.aqiBadge}>{selectedCity.aqi.label}</div>
                  </div>
                ) : (
                  <div className={styles.loadingAqi}>Loading...</div>
                )}
              </div>
              {selectedCity.pinVariant && (
                <div aria-hidden="true" className={styles.statusRing}>
                  <span className="material-symbols-outlined">
                    {selectedCity.pinVariant === 'good'
                      ? 'check'
                      : selectedCity.pinVariant === 'moderate'
                        ? 'warning'
                        : 'close'}
                  </span>
                </div>
              )}
            </div>

            <section>
              <div className={styles.sectionTitle}>{MapViewContent.panel.pollutantsTitle}</div>
              <div className={styles.grid}>
                {MapViewContent.pollutantOrder
                  .filter((t) => selectedCity.pollutants[t] !== undefined) // Only show available pollutants
                  .map((t) => {
                    const item = selectedCity.pollutants[t]!;
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
              {isLoading && <div className={styles.loadingText}>Loading live data...</div>}
              {error && <div className={styles.errorText}>Could not load live data</div>}
            </section>

            <section className={styles.advice}>
              <div className={styles.adviceTitle}>{MapViewContent.panel.healthAdviceTitle}</div>
              <div className={styles.adviceText}>
                {selectedCity.healthAdvice ?? MapViewContent.sidebar.healthAdviceText}
              </div>
            </section>
          </div>
        </div>
      </aside>
    </main>
  );
};
