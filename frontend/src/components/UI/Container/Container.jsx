import styles from './Container.module.css';

// A simple container component to wrap content with consistent styling

function Container({ children, className = '' }) {
  return (
    <div className={`${styles.container} ${className}`}>
      {children}
    </div>
  );
}

export default Container;