import styles from './WarehouseOccupancy.module.css';

function WarehouseOccupancy() {
  const slots = [
    'low', 'low-mid', 'mid', 'high', 'full',
    'low', 'mid', 'mid', 'high', 'full',
    'empty', 'low', 'mid', 'mid', 'high',
    'empty', 'low-mid', 'mid', 'mid-high', 'empty',
    'empty', 'low', 'mid', 'mid-high', 'low',
    'empty', 'empty', 'low', 'mid', 'mid-high'
  ];

  const getSlotColor = (type) => {
    switch (type) {
      case 'empty':
        return styles.empty;
      case 'low':
        return styles.low;
      case 'low-mid':
        return styles.lowMid;
      case 'mid':
        return styles.mid;
      case 'mid-high':
        return styles.midHigh;
      case 'high':
        return styles.high;
      case 'full':
        return styles.full;
      default:
        return styles.empty;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Warehouse Occupancy</h3>
        <p className={styles.subtitle}>Zone A - Floor 1</p>
      </div>

      <div className={styles.grid}>
        {slots.map((slot, index) => (
          <div
            key={index}
            className={`${styles.slot} ${getSlotColor(slot)}`}
          />
        ))}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.empty}`} />
          <span>Empty</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.low}`} />
          <span>Low</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.mid}`} />
          <span>Mid</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.full}`} />
          <span>Full</span>
        </div>
      </div>
    </div>
  );
}

export default WarehouseOccupancy;
