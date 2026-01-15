import React from 'react';
import styles from './Legal.module.css';

export const TermsOfService: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: January 2026</p>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Agreement to Terms</h2>
          <p className={styles.text}>
            By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations.
            If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Use License</h2>
          <p className={styles.text}>
            Permission is granted to temporarily download one copy of the materials (information or software) on AirPollutionSlovenia's website for personal,
            non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Modify or copy the materials;</li>
            <li className={styles.listItem}>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li className={styles.listItem}>Attempt to decompile or reverse engineer any software contained on the website;</li>
            <li className={styles.listItem}>Remove any copyright or other proprietary notations from the materials; or</li>
            <li className={styles.listItem}>Transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Disclaimer</h2>
          <p className={styles.text}>
            The materials on AirPollutionSlovenia's website are provided on an 'as is' basis. We make no warranties, expressed or implied,
            and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Limitations</h2>
          <p className={styles.text}>
            In no event shall AirPollutionSlovenia or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit,
            or due to business interruption) arising out of the use or inability to use the materials on our website.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Accuracy of Materials</h2>
          <p className={styles.text}>
            The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials
            on its website are accurate, complete or current. We may make changes to the materials contained on its website at any time without notice.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Contact</h2>
          <p className={styles.text}>
            If you have any questions about these Terms of Service, please contact the project leader:
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
