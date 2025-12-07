import styles from './StatCard.module.css';

function StatCard({ title, value, icon, trend = null }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.title}>{title}</p>
        <span className={styles.icon}>{icon}</span>
      </div>
      <p className={styles.value}>{value}</p>
      {trend && (
        <div className={styles.trend}>
          <span className={styles.trendIcon}>↑</span>
          <p className={styles.trendText}>{trend}</p>
        </div>
      )}
    </div>
  );
}

export default StatCard;
