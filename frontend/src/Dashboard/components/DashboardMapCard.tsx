import styles from './DashboardMapCard.module.css';

import { DashboardContent } from '../Dashboard.content';
import { CITY_OPTIONS } from '../Dashboard.config';

interface Props {
  selectedCity: string | null;
  onSelectCity: (city: string) => void;
}

const normalizeCity = (value: string) => value.split(',')[0].trim();

export const DashboardMapCard = ({ selectedCity, onSelectCity }: Props) => {
  const cityValue = selectedCity ? `${selectedCity}, SI` : 'Ljubljana, SI';

  return (
    <section className={styles.card} aria-label="Map overview">
      <div className={styles.titleRow}>
        <div>
          <div className={styles.h3}>{DashboardContent.mapCard.title}</div>
          <div className={styles.subtitle}>{DashboardContent.mapCard.subtitle}</div>
        </div>
        <div className={styles.legend} aria-label="Legend">
          <div style={{ fontWeight: 900, marginBottom: 6 }}>{DashboardContent.mapCard.legendTitle}</div>
          <div className={styles.legendRow}>
            <span className={styles.dot} style={{ background: 'var(--primary)' }} /> Good
          </div>
          <div className={styles.legendRow}>
            <span className={styles.dot} style={{ background: 'var(--warning)' }} /> Moderate
          </div>
          <div className={styles.legendRow}>
            <span className={styles.dot} style={{ background: 'var(--danger)' }} /> Unhealthy
          </div>
        </div>
      </div>

      <div className={styles.mapWrap}>
        <svg className={styles.svg} viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" aria-label="Stylized Slovenia map">
          <path
            className={styles.region}
            d="M220,150 L300,130 L400,110 L500,120 L600,100 L680,140 L720,200 L680,300 L600,350 L500,380 L400,360 L300,400 L200,380 L150,300 L120,200 Z"
          />

          <g className={styles.marker} transform="translate(400, 250)" onClick={() => onSelectCity('Ljubljana')}>
            <circle cx="0" cy="0" r="6" fill="var(--primary)" className={styles.markerDot} />
            <text className={styles.cityText} x="12" y="4">
              Ljubljana
            </text>
          </g>

          <g className={styles.marker} transform="translate(550, 150)" onClick={() => onSelectCity('Maribor')}>
            <circle cx="0" cy="0" r="6" fill="var(--warning)" className={styles.markerDot} />
            <text className={styles.cityText} x="12" y="4">
              Maribor
            </text>
          </g>

          <g className={styles.marker} transform="translate(350, 200)" onClick={() => onSelectCity('Kranj')}>
            <circle cx="0" cy="0" r="5" fill="var(--primary)" className={styles.markerDot} />
            <text className={styles.cityText} x="-45" y="4">
              Kranj
            </text>
          </g>

          <g className={styles.marker} transform="translate(200, 350)" onClick={() => onSelectCity('Koper')}>
            <circle cx="0" cy="0" r="5" fill="var(--primary)" className={styles.markerDot} />
            <text className={styles.cityText} x="12" y="4">
              Koper
            </text>
          </g>

          <g className={styles.marker} transform="translate(500, 220)" onClick={() => onSelectCity('Celje')}>
            <circle cx="0" cy="0" r="5" fill="var(--danger)" className={styles.markerDot} />
            <text className={styles.cityText} x="12" y="4">
              Celje
            </text>
          </g>
        </svg>
      </div>

      <div className={styles.footerControls}>
        <div className={styles.picker}>
          <div>
            <div className={styles.k}>Select City</div>
            <select
              className={styles.select}
              value={cityValue}
              onChange={(e) => onSelectCity(normalizeCity(e.target.value))}
              aria-label="Select city"
            >
              {CITY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {normalizeCity(o)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.split}>
            <div className={styles.k}>Avg AQI</div>
            <div style={{ fontWeight: 900, color: 'var(--primary)' }}>42 (Good)</div>
          </div>
        </div>

        <button className={styles.locate} type="button" aria-label="My location">
          <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>
            my_location
          </span>
        </button>
      </div>
    </section>
  );
};
