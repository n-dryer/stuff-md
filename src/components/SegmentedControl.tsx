import React, { useEffect, useMemo, useRef } from 'react';

interface SegmentedControlOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
  autoFocusActive?: boolean;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
  ariaLabel,
  autoFocusActive = false,
}) => {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = useMemo(
    () => options.findIndex(option => option.value === value),
    [options, value]
  );

  useEffect(() => {
    if (!autoFocusActive) {
      return;
    }
    if (activeIndex < 0) {
      return;
    }
    const button = buttonRefs.current[activeIndex];
    if (!button || button === document.activeElement) {
      return;
    }
    button.focus();
  }, [activeIndex, autoFocusActive, options]);

  const focusOption = (index: number) => {
    const button = buttonRefs.current[index];
    button?.focus();
  };

  const handleArrowNavigation = (direction: 'next' | 'previous') => {
    if (options.length === 0) {
      return;
    }
    const nextIndex =
      direction === 'next'
        ? (activeIndex + 1) % options.length
        : (activeIndex - 1 + options.length) % options.length;
    const nextValue = options[nextIndex]?.value;
    if (!nextValue) {
      return;
    }
    onChange(nextValue);
    focusOption(nextIndex);
  };

  return (
    <div
      role='radiogroup'
      aria-label={ariaLabel}
      className={`inline-flex w-full border-2 border-accent-black dark:border-off-white overflow-hidden ${className}`}
    >
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            ref={el => {
              buttonRefs.current[index] = el;
            }}
            type='button'
            role='radio'
            aria-checked={isActive}
            className={`flex-1 px-3 sm:px-4 py-2 min-h-[44px] font-mono text-xs sm:text-sm uppercase tracking-widest cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black ${
              index !== options.length - 1
                ? 'border-r-2 border-accent-black dark:border-off-white'
                : ''
            } ${
              isActive
                  ? 'bg-accent-black text-off-white dark:bg-off-white dark:text-off-black hover:bg-accent-black/90 dark:hover:bg-off-white/90'
                : 'bg-off-white text-off-black dark:bg-brutal-gray dark:text-off-white hover:bg-accent-black/10 hover:text-accent-black dark:hover:bg-off-white/10 dark:hover:text-off-white'
            }`}
            onClick={() => onChange(option.value)}
            onKeyDown={event => {
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                handleArrowNavigation('next');
              }
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                handleArrowNavigation('previous');
              }
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
