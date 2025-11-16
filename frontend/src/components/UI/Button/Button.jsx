import { useRef } from 'react';
import styles from './Button.module.css';
import ButtonTipSound from '../../../assets/audio/ButtonTipSound.mp3';

// A reusable button component with hover sound effect
function Button({ children, onClick, variant = 'primary', ...props }) {
  // Ref for the hover sound effect
  const tipSound = useRef(new Audio(ButtonTipSound));

  const handleHover = () => {
    tipSound.current.currentTime = 0; // rewind sound
    tipSound.current.play().catch(() => {}); // prevent blocked promise
  };

  return (
    // Button element with variant styling and hover sound effect
    <button 
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      onMouseEnter={handleHover}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;