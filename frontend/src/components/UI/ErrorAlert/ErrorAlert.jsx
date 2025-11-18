import React from 'react';

const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="error-alert">
      <div className="error-content">
        <span className="error-message">{error}</span>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
    </div>
  );
};

export default ErrorAlert;