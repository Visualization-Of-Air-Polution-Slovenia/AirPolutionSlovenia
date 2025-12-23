import styles from './PollutantTabs.module.css';

import type { PollutantType } from '@/store/useStore';
import { POLLUTION_TABS } from '../Dashboard.config';

interface Props {
  value: PollutantType;
  onChange: (value: PollutantType) => void;
}

export const PollutantTabs = ({ value, onChange }: Props) => {
  return (
    <div className={styles.wrap} role="tablist" aria-label="Pollutant selection">
      {POLLUTION_TABS.map((t) => (
        <button
          key={t.type}
          type="button"
          role="tab"
          aria-selected={value === t.type}
          className={`${styles.tab} ${value === t.type ? styles.active : ''}`}
          onClick={() => onChange(t.type)}
        >
          <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
            {t.icon}
          </span>
          {t.label}
        </button>
      ))}
    </div>
  );
};
