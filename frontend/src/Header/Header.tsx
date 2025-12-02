import { Link } from 'react-router-dom';

import styles from './Header.module.css';

import { useAppStore } from '@/store/useStore';
import { ThemeIcons } from './Header.content';

export const Header = () => {
  const { theme, toggleTheme } = useAppStore();

  return (
    <header className={styles.header}>

      {/* Basic logo */}
      <div className={styles.logo}>
        <h1><Link to="/" className={styles.logoLink}>AirPollution<span className={styles.highlight}>SLO</span></Link></h1>
      </div>

      {/* Naviagation + color change */}
      <nav className={styles.nav}>

        <Link to="/">Dashboard</Link>
        <a href="#trends">Trends</a>
        <a href="#health">Health Impact</a>
        <Link to="/about">About</Link>

        <button 
          onClick={toggleTheme} 
          className={styles.themeToggle}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? ThemeIcons.Dark : ThemeIcons.Light}
        </button>
        
      </nav>
    </header>
  );
};
