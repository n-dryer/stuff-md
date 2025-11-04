import React from 'react';
import { createPortal } from 'react-dom';
import type { Coords } from '../utils/tooltipPositioning';

interface TooltipPortalProps {
  text: string;
  coords: Coords;
  id: string;
  tooltipRef: React.RefObject<HTMLDivElement>;
}

const TooltipPortal: React.FC<TooltipPortalProps> = ({
  text,
  coords,
  id,
  tooltipRef,
}) => {
  return createPortal(
    <div
      ref={tooltipRef}
      id={id}
      role='tooltip'
      data-placement={coords.placement}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 9999,
        backgroundColor: 'var(--tooltip-bg)',
        color: 'var(--tooltip-fg)',
        maxWidth: '80vw',
        padding: '0.5rem 0.75rem',
        pointerEvents: 'none',
        border: 'none',
        boxShadow: 'none',
      }}
      className='text-xs sm:text-sm font-mono leading-snug tracking-wide'
    >
      {text}
    </div>,
    document.body
  );
};

export default TooltipPortal;
