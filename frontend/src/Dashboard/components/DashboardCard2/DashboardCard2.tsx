import styles from './DashboardCard2.module.css';

import { DashboardContent } from '../../Dashboard.content';

/**
 * DashboardCard2 component
 * Displays an additional chart or data visualization.
 * Currently a placeholder for future content.
 */
export const DashboardCard2 = () => {
  return (
    <section className={styles.card} aria-label="Additional chart">
      <div className={styles.titleRow}>
        <div>
          <div className={styles.h3}>{DashboardContent.chartCard2.title}</div>
          <div className={styles.subtitle}>{DashboardContent.chartCard2.subtitle}</div>
        </div>
      </div>

      <div className={styles.canvas}>
        <div className={styles.placeholder}>
          <span className={`material-symbols-outlined ${styles.placeholderIcon}`}>
          </span>
          <p className={styles.placeholderText}></p>
        </div>
      </div>
    </section>
  );
};

