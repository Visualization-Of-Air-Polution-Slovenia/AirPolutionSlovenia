import styles from './Health.module.css';

import { HealthContent, ResearchLinks, SystemicCards } from './Health.content';
import { HealthCard } from './components/HealthCard/HealthCard';
import { HealthResearchLink } from './components/HealthResearchLink/HealthResearchLink';
import { useMemo } from 'react';
import { useAppStore } from '@/store/useStore';
import { LOCATIONS, type LocationId } from './Health.locations';
import { getAirQualityPrompt } from './Health.prompts';
import { getDynamicCardContent, getAirQualityLevel } from './Health.dynamic';
import { useCityData } from '@/Services';

/**
 * Displays health impact analysis, systemic health effects cards, and research links.
 */
export const Health = () => {
  const { selectedRegion, setSelectedRegion } = useAppStore();

  // simulate or fetch AQI
  const { data: cityApiData, isLoading, error } = useCityData(selectedRegion);
  const airIndex = useMemo(() => {
    if (!cityApiData?.data?.aqi) return null;
    return cityApiData.data.aqi;
  }, [cityApiData]);

  const airPrompt = airIndex !== null ? getAirQualityPrompt(airIndex) : null;

  const level = airIndex !== null ? getAirQualityLevel(airIndex) : null;
  const dynamicCards = useMemo(() => {
    const baseCards = level ? getDynamicCardContent(level) : SystemicCards;
    if (!airPrompt) return baseCards;
    return baseCards.map((card) => ({ ...card, tone: airPrompt.cardTone }));
  }, [level, airPrompt]);

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
          {HealthContent.title.before}{' '}
          <span className={styles.gradientText}>{HealthContent.title.highlight}</span>{' '}
          {HealthContent.title.after}
        </h1>

        <p className={styles.intro}>
          {isLoading
            ? 'Loading current air quality…'
            : error
              ? 'Failed to load current air quality. Please try again.'
              : airPrompt
                ? airPrompt.intro
                : 'Select a city to view current air quality and health information.'}
        </p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Choose location</h2>
        <select
          className={styles.dropdown}
          value={selectedRegion || ''}
          onChange={(e) => setSelectedRegion(e.target.value as LocationId)}
        >
          <option value="" disabled>
            City
          </option>
          {LOCATIONS.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.label}
            </option>
          ))}
        </select>
      </section>

      <div className={styles.alert}>
        <div className={styles.alertIconBox}>
          <span className="material-symbols-outlined">warning</span>
        </div>
        <div>
          <div className={styles.alertLabel}>
            {airPrompt ? airPrompt.alert.label : 'Select a city'}
          </div>
          <div className={styles.alertValue}>
            {isLoading
              ? 'Loading…'
              : error
                ? 'Data not available'
                : airPrompt
                  ? `${airPrompt.alert.value} (${airIndex})`
                  : 'Data not available'}
          </div>
        </div>
      </div>
    </section>

    {/* === Keep grid separate === */}
    <div className={styles.grid}>
      <section>
        <h2 className={styles.sectionTitle}>
          <span className={`material-symbols-outlined ${styles.sectionIcon}`}>
            vital_signs
          </span>
          {HealthContent.sections.systemic}
        </h2>

        <div className={styles.cards}>
          {dynamicCards.map((c) => (
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
