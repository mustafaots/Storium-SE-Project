// represents a reusable header component with title, subtitle, and optional icon

import styles from './Header.module.css';

function Header({ 
  title, 
  subtitle, 
  icon, 
  size = 'medium', // 'small' | 'medium' | 'large'
  align = 'left'   // 'left' | 'center' | 'right'
}) {
  return (
    <header className={`${styles.header} ${styles[align]} ${styles[size]}`}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          {icon && (
            <div className={styles.iconContainer}>
              {icon}
            </div>
          )}
          <div className={styles.textContainer}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
      </div>
      <hr></hr>
    </header>
  );
}

export default Header;