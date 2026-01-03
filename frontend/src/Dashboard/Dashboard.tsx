import { useAppStore } from '@/store/useStore';

import styles from './Dashboard.module.css';

import { DashboardContent } from './Dashboard.content';
import { CITY_OPTIONS } from './Dashboard.config';
import { PollutantTabs } from './components/PollutantTabs/PollutantTabs';
import { DashboardMapCard } from './components/DashboardMapCard/DashboardMapCard';
import { DashboardTrendCard } from './components/DashboardTrendCard/DashboardTrendCard';

const normalizeCity = (value: string) => value.split(',')[0].trim();

/**
 * Dashboard component
 * The main page of the application, displaying the dashboard with various cards.
 * Includes the hero section with controls and the grid of visualization cards.
 */
export const Dashboard = () => {
  const { pollutionType, setPollutionType, selectedRegion, setSelectedRegion } = useAppStore();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.h2}>{DashboardContent.hero.title}</div>
          <div className={styles.subtitle}>
            {DashboardContent.hero.subtitlePrefix}
          </div>
          <div className={styles.updated}>{DashboardContent.hero.updated}</div>
        </div>

        <div className={styles.heroActions}>
          <div className={styles.actionsCol}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Pollutant</label>
              <PollutantTabs value={pollutionType} onChange={setPollutionType} />
            </div>
          </div>

          <div className={styles.controlsCol}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Location</label>
              <div className={styles.selectWrap}>
                <span className={`material-symbols-outlined ${styles.selectIcon}`} aria-hidden="true">
                  location_on
                </span>
                <select
                  className={styles.select}
                  value={selectedRegion ? `${selectedRegion}, SI` : 'Ljubljana, SI'}
                  onChange={(e) => setSelectedRegion(normalizeCity(e.target.value))}
                  aria-label="Select city"
                >
                  {CITY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Comparison</label>
              <div className={styles.selectWrap}>
                <span className={`material-symbols-outlined ${styles.selectIcon}`} aria-hidden="true">
                  compare_arrows
                </span>
                <select className={styles.select} defaultValue="Compare Region" aria-label="Compare region">
                  <option>Compare Region</option>
                  <option>Zagreb, HR</option>
                  <option>Graz, AT</option>
                  <option>Trieste, IT</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <DashboardMapCard selectedCity={selectedRegion} onSelectCity={setSelectedRegion} />
        <DashboardTrendCard />
      </section>
    </main>
  );
};