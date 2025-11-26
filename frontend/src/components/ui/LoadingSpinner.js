import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ size = 'medium', text = null, fullScreen = false, inline = false }) {
  const spinnerSize = {
    small: '16px',
    medium: '40px',
    large: '60px'
  }[size];

  if (inline) {
    return (
      <span 
        className="loading-spinner-inline" 
        style={{ width: spinnerSize, height: spinnerSize }}
      />
    );
  }

  const content = (
    <div className={`loading-spinner-wrapper ${fullScreen ? 'fullscreen' : ''}`}>
      <div 
        className="loading-spinner" 
        style={{ width: spinnerSize, height: spinnerSize }}
      />
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );

  return content;
}

export default LoadingSpinner;

