import styles from './Health.module.css';

import { HealthContent, ResearchLinks, SystemicCards } from './Health.content';
import { HealthCard } from './components/HealthCard/HealthCard';
import { HealthResearchLink } from './components/HealthResearchLink/HealthResearchLink';

/**
 * Displays health impact analysis, systemic health effects cards, and research links.
 */
export const Health = () => {
  return (
    <main className={styles.page}>
      <div className={styles.bgBlobs} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blobPrimary}`} />
        <div className={`${styles.blob} ${styles.blobInfo}`} />
      </div>

      <div className={styles.canvas}>
        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.label}>
              <span className={`material-symbols-outlined ${styles.labelIcon}`}>
                medical_services
              </span>
              <span>{HealthContent.label}</span>
            </div>

            <h1 className={styles.title}>
              {HealthContent.title.before} <span className={styles.gradientText}>{HealthContent.title.highlight}</span> {HealthContent.title.after}
            </h1>

            <p className={styles.intro}>{HealthContent.intro}</p>
          </div>

          <div className={styles.alert}>
            <div className={styles.alertIconBox}>
              <span className={`material-symbols-outlined ${styles.alertIcon}`}>
                warning
              </span>
            </div>
            <div>
              <div className={styles.alertLabel}>{HealthContent.alert.label}</div>
              <div className={styles.alertValue}>{HealthContent.alert.value}</div>
            </div>
          </div>
        </section>

        <div className={styles.grid}>
          <section>
            <h2 className={styles.sectionTitle}>
              <span className={`material-symbols-outlined ${styles.sectionIcon}`}>
                vital_signs
              </span>
              {HealthContent.sections.systemic}
            </h2>

            <div className={styles.cards}>
              {SystemicCards.map((c) => (
                <HealthCard
                  key={c.title}
                  title={c.title}
                  icon={c.icon}
                  badge={c.badge}
                  tone={c.tone}
                  border={c.border}
                  body={c.body}
                  tags={c.tags}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>
              <span className={`material-symbols-outlined ${styles.sectionIcon}`}>
                library_books
              </span>
              {HealthContent.sections.research}
            </h2>

            <div className={styles.linkList}>
              {ResearchLinks.map((r) => (
                <HealthResearchLink
                  key={r.title}
                  title={r.title}
                  desc={r.desc}
                  meta={r.meta}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
