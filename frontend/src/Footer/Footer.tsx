import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>

        <p>&copy; {new Date().getFullYear()} Air Pollution Slovenia. Data provided by ARSO.</p>
        
        <div className={styles.links}>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
        </div>
        
      </div>
    </footer>
  );
};
