import React from 'react';

export const AlertMessage = ({ type = 'danger', message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginLeft: '12px',
            color: 'inherit'
          }}
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

