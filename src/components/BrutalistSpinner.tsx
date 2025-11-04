import React, { useState, useEffect } from 'react';

const SPINNER_FRAMES = ['|', '/', '-', '\\'];
const FRAME_INTERVAL_MS = 150;

const BrutalistSpinner: React.FC = () => {
  const [frame, setFrame] = useState(SPINNER_FRAMES[0]);

  useEffect(() => {
    let frameIndex = 0;
    const animationInterval = setInterval(() => {
      frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length;
      setFrame(SPINNER_FRAMES[frameIndex]);
    }, FRAME_INTERVAL_MS);

    return () => {
      clearInterval(animationInterval);
    };
  }, []);

  return (
    <div 
      className="text-2xl font-mono text-light-gray pointer-events-none"
      aria-label="Processing..."
      role="status"
    >
      {frame}
    </div>
  );
};

export default BrutalistSpinner;