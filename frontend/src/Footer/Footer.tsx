import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>

        <p>&copy; {new Date().getFullYear()} Air Pollution Slovenia. Data provided by ARSO.</p>
        
        <div className={styles.links}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
        
      </div>
    </footer>
  );
};
