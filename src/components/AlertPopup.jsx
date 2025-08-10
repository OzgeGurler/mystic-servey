import React from 'react';

export default function AlertPopup({ type = 'info', title, message, onClose }) {
  return (
    <div className={`alert-popup ${type}`} role="alert" aria-live="polite">
      <div className="alert-content">
        <div className="alert-title">{title}</div>
        {message && <div className="alert-message">{message}</div>}
      </div>
      <button className="alert-close" onClick={onClose} aria-label="Kapat">×</button>
    </div>
  );
} 