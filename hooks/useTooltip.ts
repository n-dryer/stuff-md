import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { Coords } from '../utils/tooltipPositioning';
import { computeTooltipPosition } from '../utils/tooltipPositioning';

type Placement = 'top' | 'bottom' | 'left' | 'right';

const AUTO_CLOSE_DELAY_MS = 100; // ms auto-hide delay

export const useTooltip = (position: Placement, text: string) => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const autoHideTimeoutRef = useRef<number | null>(null);
  const [coords, setCoords] = useState<Coords>({
    top: 0,
    left: 0,
    placement: position,
  });

  const clearCloseTimer = useCallback(() => {
    if (closeTimeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = null;
  }, []);

  const cancelAutoHide = useCallback(() => {
    if (autoHideTimeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(autoHideTimeoutRef.current);
    }
    autoHideTimeoutRef.current = null;
  }, []);

  const scheduleAutoHide = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    cancelAutoHide();
    autoHideTimeoutRef.current = window.setTimeout(() => {
      const trigger = triggerRef.current;
      const isHovering = !!trigger?.matches?.(':hover');
      const isFocused = !!trigger && trigger === document.activeElement;

      if (!isHovering && !isFocused) {
        setOpen(false);
      }
      autoHideTimeoutRef.current = null;
    }, AUTO_CLOSE_DELAY_MS);
  }, [cancelAutoHide]);

  const scheduleClose = useCallback(() => {
    cancelAutoHide();
    clearCloseTimer();
    setOpen(false);
  }, [cancelAutoHide, clearCloseTimer]);

  const openTooltip = useCallback(() => {
    clearCloseTimer();
    cancelAutoHide();
    setOpen(true);
  }, [cancelAutoHide, clearCloseTimer]);

  const computeCoords = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const docWidth = window.innerWidth;
    const docHeight = window.innerHeight;

    const tooltipWidth =
      tooltipEl?.offsetWidth ?? Math.min(320, Math.max(160, text.length * 7));
    const tooltipHeight = tooltipEl?.offsetHeight ?? 36;

    const computedCoords = computeTooltipPosition(
      rect,
      tooltipWidth,
      tooltipHeight,
      position,
      docWidth,
      docHeight
    );

    setCoords(computedCoords);
  }, [position, text]);

  useEffect(() => {
    if (open) {
      scheduleAutoHide();
    } else {
      cancelAutoHide();
    }
    return () => {
      cancelAutoHide();
    };
  }, [cancelAutoHide, open, scheduleAutoHide]);

  useLayoutEffect(() => {
    if (!open) return;
    computeCoords();
  }, [open, computeCoords]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => computeCoords();
    const onScroll = () => setOpen(false);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, computeCoords]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClickAway = (e: Event) => {
      const t = e.target as Node;
      if (!tooltipRef.current || !triggerRef.current) return;
      if (
        !tooltipRef.current.contains(t) &&
        !triggerRef.current.contains(t as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClickAway);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onClickAway);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
      cancelAutoHide();
    };
  }, [cancelAutoHide, clearCloseTimer]);

  const handleClick = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  return {
    triggerRef,
    tooltipRef,
    open,
    coords,
    openTooltip,
    scheduleClose,
    clearCloseTimer,
    cancelAutoHide,
    handleClick,
  };
};
