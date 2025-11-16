import { useRef } from 'react';
import styles from './Button.module.css';
import ButtonTipSound from '../../../assets/audio/ButtonTipSound.mp3';

function Button({ children, onClick, variant = 'primary', ...props }) {
  const tipSound = useRef(new Audio(ButtonTipSound)); // ✅ Move inside component

  const handleHover = () => {
    // Remove the cell check since buttons should always play sound on hover
    tipSound.current.currentTime = 0; // rewind sound
    tipSound.current.play().catch(() => {}); // prevent blocked promise
  };

  return (
    <button 
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      onMouseEnter={handleHover} // ✅ Use the function directly
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;