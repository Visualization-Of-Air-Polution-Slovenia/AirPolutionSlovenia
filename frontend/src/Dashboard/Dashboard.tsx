import { useAppStore } from '@/store/useStore';
import { renderPollutionButtons } from './Dashboard.config';

import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const { pollutionType, setPollutionType, selectedRegion } = useAppStore();

  return (
    <main className={styles.dashboard}>
      <section className={styles.controls}>

        {/* Main Content's Header (Left) */}
        <div>
          <h2>Air Quality Monitor</h2>
          <p className={styles.subtitle}>Real-time air quality data across Slovenia</p>
        </div>

        {/* Pollution Type Filters (Right) */}
        <div className={styles.filters}>
          <div className={styles.buttonGroup}>
            {renderPollutionButtons(pollutionType, setPollutionType)}
          </div>
        </div>
        
      </section>

      <section className={styles.visualization}>
        <div className={styles.mapPlaceholder}>

          {/* Map Visualization */}
          <h3>Slovenia Map Visualization</h3>
          <p>Selected Pollutant: <strong>{pollutionType.toUpperCase()}</strong></p>
          <p>Selected Region: <strong>{selectedRegion || 'None'}</strong></p>
          <div className={styles.placeholderContent}>
            {/* This is where the Vega-Lite map would go */}
            [Map Component Placeholder]
          </div>

        </div>
        
        <div className={styles.sidebar}>

          {/* Status information */}
          <div className={styles.statCard}>
            <h3>Overall Status</h3>
            <div className={styles.statValue}>Good</div>
            <p className={styles.statDescription}>Air quality is satisfactory</p>
          </div>

          {/* Region Details */}
          <div className={styles.card}>
            <h4>Region Details</h4>
            {selectedRegion ? (
              <p>Details for {selectedRegion}...</p>
            ) : (
              <p className={styles.emptyState}>Select a region on the map to see details.</p>
            )}
          </div>
          
          {/* Health Impact */}
          <div className={styles.card}>
            <h4>Health Impact</h4>
            <p>Current levels are within WHO guidelines.</p>
          </div>

        </div>
      </section>
    </main>
  );
};