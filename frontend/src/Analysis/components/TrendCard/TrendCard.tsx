import styles from './TrendCard.module.css';
import { AnalysisContent } from '../../Analysis.content';

/**
 * TrendCard component
 * Displays a trend chart of pollutant concentration over time.
 * Compares city data against WHO and EU limits.
 */
export const TrendCard = () => {
  return (
    <section className={styles.card} aria-label="Trend chart">
      <div className={styles.titleRow}>
        <div>
          <div className={styles.h3}>{AnalysisContent.widgets.chartCard.title}</div>
          <div className={styles.subtitle}>{AnalysisContent.widgets.chartCard.subtitle}</div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotPrimary}`} /> Ljubljana
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotLimit} ${styles.dotLimitWho}`} /> WHO Limit
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotLimit} ${styles.dotLimitEu}`} /> EU Limit
          </div>
        </div>
      </div>

      <div className={styles.canvas}>
        <svg className={styles.svg} viewBox="0 0 800 300" preserveAspectRatio="none" aria-label="Chart placeholder">
          <path className={styles.gridLine} d="M0 50 H800" />
          <path className={styles.gridLine} d="M0 100 H800" />
          <path className={styles.gridLine} d="M0 150 H800" />
          <path className={styles.gridLine} d="M0 200 H800" />
          <path className={styles.gridLine} d="M0 250 H800" />

          <path className={styles.thresholdWho} d="M0 240 H800" />
          <path className={styles.thresholdEu} d="M0 120 H800" />

          <path className={styles.line} d="M0,210 C80,190 140,220 220,175 C300,130 360,150 440,140 C520,130 610,160 700,120 L800,130" />
        </svg>
      </div>
    </section>
  );
};
