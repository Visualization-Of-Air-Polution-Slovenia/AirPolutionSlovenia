import { Link, NavLink, useLocation } from 'react-router-dom';

import styles from './Header.module.css';

import { useAppStore } from '@/store/useStore';
import { ThemeIcons } from './Header.content';

export const Header = () => {
  const { theme, toggleTheme } = useAppStore();
  const location = useLocation();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logoIcon} aria-hidden="true">
          <span className="material-symbols-outlined">air</span>
        </div>
        <h1 className={styles.title}>
          <Link to="/" className={styles.logoLink}>
            AirViz <span className={styles.highlight}>Slovenia</span>
          </Link>
        </h1>
      </div>

      <nav className={styles.nav} aria-label="Primary">
        <div className={styles.navPill}>
          <NavLink to="/map" className={({ isActive }) => `${styles.navLink} ${isActive || location.pathname === '/' ? styles.navActive : ''}`}
            >Map View</NavLink>
          <NavLink to="/analysis" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
            >Analysis</NavLink>
          <NavLink to="/health" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
            >Health</NavLink>
          <NavLink to="/about" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
            >About</NavLink>
        </div>
      </nav>

      <div className={styles.actions}>
        {/* <button className={styles.iconBtn} type="button" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button> */}

        <button
          className={styles.iconBtn}
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? ThemeIcons.Light : ThemeIcons.Dark}
        </button>
      </div>
    </header>
  );
};
