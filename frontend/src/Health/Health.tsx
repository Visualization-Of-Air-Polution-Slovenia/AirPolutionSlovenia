import styles from './Health.module.css';

import { HealthContent, ResearchLinks, SystemicCards } from './Health.content';

const toneToStyle = (tone: string) => {
  if (tone === 'danger') return { background: 'color-mix(in srgb, var(--danger) 18%, transparent)', color: 'var(--danger)' };
  if (tone === 'warning') return { background: 'color-mix(in srgb, var(--warning) 18%, transparent)', color: 'var(--warning)' };
  if (tone === 'info') return { background: 'color-mix(in srgb, var(--secondary) 18%, transparent)', color: 'var(--secondary)' };
  return { background: 'color-mix(in srgb, var(--surface-2) 60%, transparent)', color: 'var(--text)' };
};

const borderToColor = (border: string) => {
  if (border === 'danger') return 'var(--danger)';
  if (border === 'warning') return 'var(--warning)';
  if (border === 'primary') return 'var(--primary)';
  return 'color-mix(in srgb, var(--text) 45%, transparent)';
};

export const Health = () => {
  return (
    <main className={styles.page}>
      <div className={styles.bgBlobs} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blobPrimary}`} style={{ top: '-10%', right: '-5%', width: 520, height: 520 }} />
        <div className={`${styles.blob} ${styles.blobInfo}`} style={{ bottom: '-10%', left: '-10%', width: 650, height: 650 }} />
      </div>

      <div className={styles.canvas}>
        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.label}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
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
            <div className={styles.alertIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
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
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--text-muted)' }}>
                vital_signs
              </span>
              {HealthContent.sections.systemic}
            </h2>

            <div className={styles.cards}>
              {SystemicCards.map((c) => (
                <article key={c.title} className={styles.card} style={{ borderLeftColor: borderToColor(c.border) }}>
                  <div className={styles.cardHeader}>
                    <div className={styles.iconBox} style={toneToStyle(c.tone)}>
                      <span className="material-symbols-outlined" style={{ fontSize: 30 }}>
                        {c.icon}
                      </span>
                    </div>
                    <div className={styles.badge}>{c.badge}</div>
                  </div>
                  <div className={styles.cardTitle}>{c.title}</div>
                  <div className={styles.cardBody}>{c.body}</div>
                  <div className={styles.tags}>
                    {c.tags.map((t) => (
                      <span key={t} className={styles.tag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--text-muted)' }}>
                library_books
              </span>
              {HealthContent.sections.research}
            </h2>

            <div className={styles.linkList}>
              {ResearchLinks.map((r) => (
                <a key={r.title} className={styles.linkItem} href="#">
                  <div>
                    <div className={styles.linkTitle}>{r.title}</div>
                    <div className={styles.linkDesc}>{r.desc}</div>
                    <div className={styles.meta}>
                      {r.meta.map((m) => (
                        <span key={m}>{m}</span>
                      ))}
                    </div>
                  </div>
                  <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>
                    arrow_forward
                  </span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
