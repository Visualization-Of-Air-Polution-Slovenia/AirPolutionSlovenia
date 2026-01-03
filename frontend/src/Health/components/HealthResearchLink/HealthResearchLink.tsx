import styles from './HealthResearchLink.module.css';

interface HealthResearchLinkProps {
  title: string;
  desc: string;
  meta: readonly string[];
}

/**
 * Displays a link to a research article with title, description, and metadata.
 */
export const HealthResearchLink = ({ title, desc, meta }: HealthResearchLinkProps) => {
  return (
    <a className={styles.linkItem} href="#">
      <div>
        <div className={styles.linkTitle}>{title}</div>
        <div className={styles.linkDesc}>{desc}</div>
        <div className={styles.meta}>
          {meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
      <span className={`material-symbols-outlined ${styles.arrowIcon}`}>
        arrow_forward
      </span>
    </a>
  );
};
