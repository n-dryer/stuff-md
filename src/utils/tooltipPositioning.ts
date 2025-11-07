type Placement = 'top' | 'bottom' | 'left' | 'right';

export type Coords = { top: number; left: number; placement: Placement };

export const VIEWPORT_PADDING = 8; // px
export const TOOLTIP_GAP = 12; // px gap between trigger and tooltip

export const computeTooltipPosition = (
  triggerRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  preferredPosition: Placement,
  docWidth: number,
  docHeight: number,
  forcePreferredPosition = false
): Coords => {
  const placements: Placement[] = forcePreferredPosition
    ? [preferredPosition]
    : Array.from(
        new Set<Placement>([
          preferredPosition,
          'top',
          'bottom',
          'right',
          'left',
        ])
      );

  const computeForPlacement = (placement: Placement) => {
    switch (placement) {
      case 'top':
        return {
          top: triggerRect.top - TOOLTIP_GAP - tooltipHeight,
          left: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
        };
      case 'bottom':
        return {
          top: triggerRect.bottom + TOOLTIP_GAP,
          left: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
        };
      case 'right':
        return {
          top: triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2,
          left: triggerRect.right + TOOLTIP_GAP,
        };
      case 'left':
        return {
          top: triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2,
          left: triggerRect.left - TOOLTIP_GAP - tooltipWidth,
        };
      default:
        return { top: 0, left: 0 };
    }
  };

  // Check if position fits viewport and doesn't overlap with trigger
  const isValidPosition = (top: number, left: number, placement: Placement) => {
    const fitsViewport =
      top >= VIEWPORT_PADDING &&
      left >= VIEWPORT_PADDING &&
      top + tooltipHeight <= docHeight - VIEWPORT_PADDING &&
      left + tooltipWidth <= docWidth - VIEWPORT_PADDING;

    const tooltipRight = left + tooltipWidth;
    const tooltipBottom = top + tooltipHeight;
    const triggerRight = triggerRect.left + triggerRect.width;
    const triggerBottom = triggerRect.top + triggerRect.height;

    const overlaps = !(
      tooltipRight < triggerRect.left ||
      left > triggerRight ||
      tooltipBottom < triggerRect.top ||
      top > triggerBottom
    );

    let maintainsGap = true;
    if (placement === 'top') {
      maintainsGap = tooltipBottom <= triggerRect.top - TOOLTIP_GAP;
    } else if (placement === 'bottom') {
      maintainsGap = top >= triggerRect.bottom + TOOLTIP_GAP;
    } else if (placement === 'left') {
      maintainsGap = tooltipRight <= triggerRect.left - TOOLTIP_GAP;
    } else if (placement === 'right') {
      maintainsGap = left >= triggerRect.right + TOOLTIP_GAP;
    }

    return fitsViewport && !overlaps && maintainsGap;
  };

  let fallback = { top: 0, left: 0, placement: placements[0] };

  for (const placement of placements) {
    const { top, left } = computeForPlacement(placement);
    fallback = { top, left, placement };
    if (isValidPosition(top, left, placement)) {
      return { top, left, placement };
    }
  }

  let clampedTop = fallback.top;
  let clampedLeft = fallback.left;

  if (fallback.placement === 'top') {
    clampedTop = Math.max(
      VIEWPORT_PADDING,
      Math.min(clampedTop, docHeight - tooltipHeight - VIEWPORT_PADDING)
    );
    if (clampedTop + tooltipHeight >= triggerRect.top - TOOLTIP_GAP) {
      clampedTop = triggerRect.top - TOOLTIP_GAP - tooltipHeight;
    }
  } else if (fallback.placement === 'bottom') {
    clampedTop = Math.max(
      triggerRect.bottom + TOOLTIP_GAP,
      Math.min(clampedTop, docHeight - tooltipHeight - VIEWPORT_PADDING)
    );
  } else if (fallback.placement === 'left') {
    clampedLeft = Math.max(
      VIEWPORT_PADDING,
      Math.min(clampedLeft, docWidth - tooltipWidth - VIEWPORT_PADDING)
    );
    if (clampedLeft + tooltipWidth >= triggerRect.left - TOOLTIP_GAP) {
      clampedLeft = triggerRect.left - TOOLTIP_GAP - tooltipWidth;
    }
  } else if (fallback.placement === 'right') {
    clampedLeft = Math.max(
      triggerRect.right + TOOLTIP_GAP,
      Math.min(clampedLeft, docWidth - tooltipWidth - VIEWPORT_PADDING)
    );
  }

  clampedTop = Math.max(
    VIEWPORT_PADDING,
    Math.min(clampedTop, docHeight - tooltipHeight - VIEWPORT_PADDING)
  );
  clampedLeft = Math.max(
    VIEWPORT_PADDING,
    Math.min(clampedLeft, docWidth - tooltipWidth - VIEWPORT_PADDING)
  );

  const clampedTooltipRight = clampedLeft + tooltipWidth;
  const clampedTooltipBottom = clampedTop + tooltipHeight;

  if (fallback.placement === 'top' && clampedTooltipBottom >= triggerRect.top) {
    clampedTop = Math.max(
      VIEWPORT_PADDING,
      triggerRect.top - TOOLTIP_GAP - tooltipHeight
    );
  } else if (
    fallback.placement === 'bottom' &&
    clampedTop <= triggerRect.bottom
  ) {
    clampedTop = Math.min(
      docHeight - tooltipHeight - VIEWPORT_PADDING,
      triggerRect.bottom + TOOLTIP_GAP
    );
  } else if (
    fallback.placement === 'left' &&
    clampedTooltipRight >= triggerRect.left
  ) {
    clampedLeft = Math.max(
      VIEWPORT_PADDING,
      triggerRect.left - TOOLTIP_GAP - tooltipWidth
    );
  } else if (
    fallback.placement === 'right' &&
    clampedLeft <= triggerRect.right
  ) {
    clampedLeft = Math.min(
      docWidth - tooltipWidth - VIEWPORT_PADDING,
      triggerRect.right + TOOLTIP_GAP
    );
  }

  return {
    top: clampedTop,
    left: clampedLeft,
    placement: fallback.placement,
  };
};
