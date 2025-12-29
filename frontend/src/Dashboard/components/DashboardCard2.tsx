import styles from './DashboardCard2.module.css';

import { DashboardContent } from '../Dashboard.content';

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
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-muted)' }}>
          </span>
          <p style={{ color: 'var(--text-muted)', marginTop: 16 }}></p>
        </div>
      </div>
    </section>
  );
};

