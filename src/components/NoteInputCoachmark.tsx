import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDarkMode } from '../hooks/useDarkMode';

interface NoteInputCoachmarkProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  onDismiss: () => void;
}

const NoteInputCoachmark: React.FC<NoteInputCoachmarkProps> = ({
  inputRef,
  containerRef,
  onDismiss,
}) => {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();

  const calculatePosition = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    });
  }, [containerRef]);

  useEffect(() => {
    calculatePosition();
    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [calculatePosition]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);

    const handleClick = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node) &&
        !containerRef.current?.contains(e.target as Node)
      ) {
        handleDismiss();
      }
    };

    const handleInputFocus = () => {
      handleDismiss();
    };

    window.addEventListener('click', handleClick);
    inputRef.current?.addEventListener('focus', handleInputFocus);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleClick);
      inputRef.current?.removeEventListener('focus', handleInputFocus);
    };
  }, [isVisible, inputRef, containerRef]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  }, [onDismiss]);

  if (!position || !isVisible) return null;

  const spotlightWidth = Math.max(position.width * 1.5, 400);
  const spotlightHeight = Math.max(position.height * 1.5, 200);
  const overlayColor = isDarkMode
    ? 'rgba(248, 248, 248, 0.6)'
    : 'rgba(0, 0, 0, 0.6)';

  return createPortal(
    <>
      <style>
        {`
          @keyframes pulse-border {
            0%, 100% {
              box-shadow: 0 0 0 0 ${isDarkMode ? 'rgba(248, 248, 248, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
              opacity: 1;
            }
            50% {
              box-shadow: 0 0 0 8px ${isDarkMode ? 'rgba(248, 248, 248, 0)' : 'rgba(0, 0, 0, 0)'};
              opacity: 0.7;
            }
          }
        `}
      </style>
      <div
        ref={overlayRef}
        className='fixed inset-0 z-40 transition-opacity duration-300'
        style={{
          opacity: isVisible ? 1 : 0,
        }}
        onClick={handleDismiss}
        aria-label='Dismiss coachmark'
        role='button'
        tabIndex={-1}
      >
        {/* Spotlight overlay */}
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            background: `radial-gradient(ellipse ${spotlightWidth}px ${spotlightHeight}px at ${position.centerX}px ${position.centerY}px, transparent 0%, ${overlayColor} 70%)`,
            transition: 'background 0.3s ease',
          }}
          aria-hidden='true'
        />
        {/* Pulsing border */}
        <div
          className='absolute z-50 pointer-events-none transition-opacity duration-300 rounded border-2 border-accent-black dark:border-off-white'
          style={{
            top: `${position.top - 8}px`,
            left: `${position.left - 8}px`,
            width: `${position.width + 16}px`,
            height: `${position.height + 16}px`,
            animation: 'pulse-border 2s ease-in-out infinite',
          }}
          aria-hidden='true'
        />
      </div>
    </>,
    document.body
  );
};

export default NoteInputCoachmark;
