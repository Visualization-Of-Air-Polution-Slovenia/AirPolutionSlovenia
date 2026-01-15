import React from 'react';
import styles from './Legal.module.css';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: January 2026</p>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Introduction</h2>
          <p className={styles.text}>
            Welcome to AirPollutionSlovenia. We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you as to how we look after your personal data when you visit our website
            and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Data We Collect</h2>
          <p className={styles.text}>
            We currently do not collect any personal data from our users. Our website is for informational purposes only
            and does not require user registration or personal information submission.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Third-Party Links</h2>
          <p className={styles.text}>
            This website may include links to third-party websites, plug-ins, and applications. Clicking on those links
            or enabling those connections may allow third parties to collect or share data about you. We do not control
            these third-party websites and are not responsible for their privacy statements.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. External Data Sources</h2>
          <p className={styles.text}>
            This website displays air quality data provided by external sources, including:
          </p>
            <ul className={styles.list}>
                <li className={styles.listItem}><a href="https://www.arso.gov.si/" target="_blank" rel="noopener noreferrer">ARSO (Slovenian Environment Agency)</a></li>
                <li className={styles.listItem}><a href="https://www.eea.europa.eu/" target="_blank" rel="noopener noreferrer">EEA (European Environment Agency)</a></li>
                <li className={styles.listItem}><a href="https://waqi.info/" target="_blank" rel="noopener noreferrer">WAQI (World Air Quality Index)</a></li>
                <li className={styles.listItem}><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a></li>
            </ul>
          <p className={styles.text}>
            We do not control or guarantee the accuracy of data from these sources.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Contact Us</h2>
          <p className={styles.text}>
            If you have any questions about this privacy policy or our privacy practices, please contact the project leader:
            <br /><br />
            <strong>Luka Rizman</strong>
            <br />
            Email: <a href="mailto:lr37199@student.uni-lj.si" style={{ color: 'var(--primary)', textDecoration: 'none' }}>lr37199@student.uni-lj.si</a>
          </p>
        </section>
      </div>
    </div>
  );
};
