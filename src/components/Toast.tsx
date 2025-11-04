import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 2500, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 200); // Match fadeOut animation duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!isVisible) return null;

  // Checkmark SVG icon for success
  const CheckmarkIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <path
        d="M13.3333 4L6 11.3333L2.66667 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`toast ${isExiting ? 'toast-exit' : 'toast-enter'} toast--${type}`}
    >
      {type === 'success' && (
        <CheckmarkIcon />
      )}
      <span>{message}</span>
    </div>
  );
};

export default Toast;

