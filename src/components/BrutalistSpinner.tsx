import React, { useState, useEffect } from 'react';

const SPINNER_FRAMES = ['|', '/', '-', '\\'];
const FRAME_INTERVAL_MS = 200; // Slower for better readability

const BrutalistSpinner: React.FC = () => {
  const [frame, setFrame] = useState(SPINNER_FRAMES[0]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    if (prefersReducedMotion) {
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    let frameIndex = 0;
    const animationInterval = setInterval(() => {
      frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length;
      setFrame(SPINNER_FRAMES[frameIndex]);
    }, FRAME_INTERVAL_MS);

    return () => {
      clearInterval(animationInterval);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className='inline-flex items-center justify-center border-2 border-accent-black dark:border-off-white shadow-brutalist dark:shadow-brutalist-dark px-[clamp(0.5rem,1.5vw,0.75rem)] py-[clamp(0.25rem,1vw,0.5rem)] pointer-events-none'
      style={{
        backgroundColor: 'transparent',
        background: 'transparent',
      }}
      aria-label='Processing...'
      role='status'
    >
      <span
        className='text-[clamp(1.5rem,4vw,2rem)] font-mono font-bold text-accent-black dark:text-off-white leading-none'
        aria-hidden='true'
      >
        {prefersReducedMotion ? '…' : frame}
      </span>
    </div>
  );
};

export default BrutalistSpinner;
