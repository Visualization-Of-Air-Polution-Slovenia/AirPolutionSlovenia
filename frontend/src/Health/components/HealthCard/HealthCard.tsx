import styles from './HealthCard.module.css';
import { getToneStyle, getBorderColor } from '../../Health.config';

interface HealthCardProps {
  title: string;
  icon: string;
  badge: string;
  tone: string;
  border: string;
  body: string;
  tags: readonly string[];
}

/**
 * HealthCard Component
 * Displays a card with health-related information, including an icon, badge, description, and tags.
 */
export const HealthCard = ({ title, icon, badge, tone, border, body, tags }: HealthCardProps) => {
  return (
    <article className={styles.card} style={{ borderLeftColor: getBorderColor(border) }}>
      <div className={styles.cardHeader}>
        <div className={styles.iconBox} style={getToneStyle(tone)}>
          <span className={`material-symbols-outlined ${styles.icon}`}>
            {icon}
          </span>
        </div>
        <div className={styles.badge}>{badge}</div>
      </div>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardBody}>{body}</div>
      <div className={styles.tags}>
        {tags.map((t) => (
          <span key={t} className={styles.tag}>
            {t}
          </span>
        ))}
      </div>
    </article>
  );
};
