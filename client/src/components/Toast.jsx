import { useState } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  const [hiding, setHiding] = useState(false);

  const handleClose = () => {
    setHiding(true);
    setTimeout(() => onClose?.(), 250);
  };

  // Auto-close after 4 seconds
  useState(() => {
    const t = setTimeout(handleClose, 4000);
    return () => clearTimeout(t);
  });

  return (
    <div
      className={`toast toast-${type}`}
      style={hiding ? { animation: 'toastSlideOut 0.25s ease forwards' } : {}}
      onClick={handleClose}
    >
      {message}
    </div>
  );
}
