import React, { useState, useEffect, useRef, useCallback } from 'react';

import {
  exportAsTxt,
  exportAsJson,
  exportAsZip,
} from '../services/exportService';
import { Note } from '../types';
import { normalizeError, sanitizeErrorMessage } from '../utils/errorHandler';
import { logError } from '../utils/logger';
import { useExportMenuNavigation } from '../hooks/useExportMenuNavigation';
import { useExportMenuPosition } from '../hooks/useExportMenuPosition';
import ErrorDisplay from './ErrorDisplay';
import BrutalistTooltip from './BrutalistTooltip';
import ExportMenu from './ExportMenu';

interface ExportButtonsProps {
  notes: Note[];
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ notes }) => {
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const exportOptions = [
    {
      label: 'TXT',
      fn: () => exportAsTxt(notes),
      errorMsg: 'Failed to export as TXT',
      ariaLabel: 'Export as TXT',
    },
    {
      label: 'JSON',
      fn: () => exportAsJson(notes),
      errorMsg: 'Failed to export as JSON',
      ariaLabel: 'Export as JSON',
    },
    {
      label: 'ZIP',
      fn: async () => exportAsZip(notes),
      errorMsg: 'Failed to export as ZIP',
      ariaLabel: 'Export as ZIP',
    },
  ];

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    buttonRef.current?.focus();
  }, []);

  const handleExport = async (
    exportFn: () => void | Promise<void>,
    errorMessage: string
  ): Promise<void> => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      setError(null);
      await exportFn();
      handleClose();
    } catch (err) {
      const normalizedError = normalizeError(err);
      const sanitizedMessage = sanitizeErrorMessage(normalizedError);
      setError(sanitizedMessage || errorMessage);
      logError('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  useExportMenuNavigation({
    isExpanded,
    menuRef,
    menuItemRefs,
    exportOptionsCount: exportOptions.length,
    buttonRef,
    onClose: handleClose,
  });

  const { menuPosition } = useExportMenuPosition({
    isExpanded,
    buttonRef,
    menuRef,
    exportOptionsCount: exportOptions.length,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isExpanded, handleClose]);

  const buttonClasses =
    'uppercase font-bold text-xs sm:text-sm md:text-base text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white hover:font-black focus:font-black transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-black dark:focus-visible:ring-off-white focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-off-black px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 whitespace-nowrap min-h-[44px]';

  return (
    <div
      ref={containerRef}
      className='relative'
      style={{ pointerEvents: 'auto' }}
    >
      {error && (
        <div className='absolute bottom-full mb-2 right-0 z-50'>
          <ErrorDisplay message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <ExportMenu
        isExpanded={isExpanded}
        menuRef={menuRef}
        menuItemRefs={menuItemRefs}
        menuPosition={menuPosition}
        exportOptions={exportOptions}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <BrutalistTooltip
        text='Export notes'
        position='top'
        forcePreferredPosition
      >
        <button
          ref={buttonRef}
          onClick={e => {
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
          onMouseDown={e => {
            e.stopPropagation();
          }}
          onPointerDown={e => {
            e.stopPropagation();
          }}
          aria-expanded={isExpanded}
          aria-haspopup='menu'
          aria-label='Export options'
          className={buttonClasses}
          type='button'
          style={{ pointerEvents: 'auto', cursor: 'pointer', zIndex: 100 }}
        >
          [EXPORT]
        </button>
      </BrutalistTooltip>
    </div>
  );
};

export default ExportButtons;
