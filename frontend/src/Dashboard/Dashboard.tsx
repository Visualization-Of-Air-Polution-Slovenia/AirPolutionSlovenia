import { useAppStore } from '@/store/useStore';

import styles from './Dashboard.module.css';

import { DashboardContent } from './Dashboard.content';
import { CITY_OPTIONS } from './Dashboard.config';
import { PollutantTabs } from './components/PollutantTabs';
import { DashboardMapCard } from './components/DashboardMapCard';
import { DashboardTrendCard } from './components/DashboardTrendCard';
import { DashboardCard2 } from './components/DashboardCard2';

const normalizeCity = (value: string) => value.split(',')[0].trim();

export const Dashboard = () => {
  const { pollutionType, setPollutionType, selectedRegion, setSelectedRegion } = useAppStore();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.h2}>{DashboardContent.hero.title}</div>
          <div className={styles.subtitle}>
            {DashboardContent.hero.subtitlePrefix} <span className={styles.updated}>{DashboardContent.hero.updated}</span>
          </div>
        </div>

        <div className={styles.heroActions}>
          <div className={styles.actionRow}>
            <PollutantTabs value={pollutionType} onChange={setPollutionType} />

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
      </section>

      <section className={styles.grid}>
        <DashboardMapCard selectedCity={selectedRegion} onSelectCity={setSelectedRegion} />
        <DashboardTrendCard />
        <DashboardCard2 />
      </section>
    </main>
  );
};