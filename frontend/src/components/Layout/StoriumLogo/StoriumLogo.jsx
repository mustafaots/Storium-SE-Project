import styles from './StoriumLogo.module.css';
import storiumLogo from '../../../assets/images/storium-logo.png';

function StoriumLogo() {
  return (
    <img src={storiumLogo} alt="Storium Logo" className={styles.logo} />
  );
}

export default StoriumLogo;