import React, { useId, useMemo } from 'react';
import { useTooltip } from '../hooks/useTooltip';
import TooltipPortal from './TooltipPortal';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface BrutalistTooltipProps {
  children: React.ReactElement;
  text: string;
  position?: Placement;
  forcePreferredPosition?: boolean;
  /**
   * Deprecated: tooltips are hover/focus-only. This prop is ignored to meet accessibility and UX requirements.
   */
  alwaysVisible?: boolean;
}

const BrutalistTooltip: React.FC<BrutalistTooltipProps> = ({
  children,
  text,
  position = 'top',
  forcePreferredPosition = false,
}) => {
  const id = useId();
  const {
    triggerRef,
    tooltipRef,
    open,
    coords,
    openTooltip,
    scheduleClose,
    clearCloseTimer,
    cancelAutoHide,
    handleClick,
  } = useTooltip(position, text, { forcePreferredPosition });

  const triggerProps = useMemo(
    () =>
      ({
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
        },
        'aria-describedby': open ? id : undefined,
        onPointerEnter: openTooltip,
        onPointerLeave: scheduleClose,
        onPointerCancel: scheduleClose,
        onMouseEnter: openTooltip,
        onMouseLeave: scheduleClose,
        onFocus: openTooltip,
        onBlur: scheduleClose,
        onClick: handleClick,
        // Touch events: show on touch start, close on touch end
        onTouchStart: (_e: React.TouchEvent<HTMLElement>) => {
          clearCloseTimer();
          cancelAutoHide();
          openTooltip();
        },
        onTouchEnd: (_e: React.TouchEvent<HTMLElement>) => {
          scheduleClose();
        },
        onTouchCancel: scheduleClose,
      }) as const,
    [
      id,
      open,
      openTooltip,
      scheduleClose,
      clearCloseTimer,
      cancelAutoHide,
      handleClick,
      triggerRef,
    ]
  );

  const composeHandler =
    <
      E extends
        | React.PointerEvent<HTMLElement>
        | React.MouseEvent<HTMLElement>
        | React.FocusEvent<HTMLElement>
        | React.TouchEvent<HTMLElement>,
    >(
      existingHandler?: (event: E) => void,
      ourHandler?: (event: E) => void
    ) =>
    (event: E) => {
      if ('type' in event && event.type === 'click') {
        ourHandler?.(event);
        if (!event.defaultPrevented) {
          existingHandler?.(event);
        }
        return;
      }
      existingHandler?.(event);
      if (event.defaultPrevented) {
        return;
      }
      ourHandler?.(event);
    };

  const mergeRefs = (
    childRef: React.Ref<HTMLElement> | undefined,
    triggerRefFn: (node: HTMLElement | null) => void
  ) => {
    return (node: HTMLElement | null) => {
      triggerRefFn(node);
      if (!childRef) return;
      if (typeof childRef === 'function') {
        childRef(node);
      } else {
        try {
          (childRef as React.MutableRefObject<HTMLElement | null>).current =
            node;
        } catch {
          // noop
        }
      }
    };
  };

  const child = React.Children.only(children);
  const childProps = child.props as Record<string, unknown>;

  const enhancedProps: Record<string, unknown> = {
    ...childProps,
  };

  const triggerHandlers = {
    onPointerEnter: triggerProps.onPointerEnter,
    onPointerLeave: triggerProps.onPointerLeave,
    onPointerCancel: triggerProps.onPointerCancel,
    onMouseEnter: triggerProps.onMouseEnter,
    onMouseLeave: triggerProps.onMouseLeave,
    onFocus: triggerProps.onFocus,
    onBlur: triggerProps.onBlur,
    onClick: triggerProps.onClick,
    onTouchStart: triggerProps.onTouchStart,
    onTouchEnd: triggerProps.onTouchEnd,
    onTouchCancel: triggerProps.onTouchCancel,
  } as const;

  (Object.keys(triggerHandlers) as Array<keyof typeof triggerHandlers>).forEach(
    key => {
      const handler = triggerHandlers[key];
      if (!handler) return;
      const existing = childProps[key] as ((event: never) => void) | undefined;
      enhancedProps[key] = composeHandler(existing as never, handler as never);
    }
  );

  const describedByValues = [
    childProps['aria-describedby'],
    triggerProps['aria-describedby'],
  ].filter(
    (value): value is string => typeof value === 'string' && value.length > 0
  );

  const mergedDescribedBy = describedByValues.join(' ').trim();

  if (mergedDescribedBy.length > 0) {
    enhancedProps['aria-describedby'] = mergedDescribedBy;
  } else {
    delete enhancedProps['aria-describedby'];
  }

  const childRef = React.isValidElement(child)
    ? (child.props as { ref?: React.Ref<HTMLElement> })?.ref
    : undefined;
  enhancedProps.ref = mergeRefs(childRef, triggerProps.ref);

  const existingClassName =
    typeof childProps.className === 'string' ? childProps.className : '';
  const classNames = [existingClassName, 'group']
    .filter(Boolean)
    .join(' ')
    .trim();
  if (classNames) {
    enhancedProps.className = classNames;
  }

  const enhancedChild = React.cloneElement(
    child,
    enhancedProps as React.DOMAttributes<HTMLElement>
  );

  return (
    <>
      {enhancedChild}
      {open && (
        <TooltipPortal
          text={text}
          coords={coords}
          id={id}
          tooltipRef={tooltipRef}
        />
      )}
    </>
  );
};

export default BrutalistTooltip;
