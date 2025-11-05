import React, { useCallback, useEffect, useRef } from 'react';

import {
  generateModalId,
  getTopModalElement,
  hasOpenModals,
  isTopModal,
  registerModal,
  unregisterModal,
} from '../utils/modalStack';

/**
 * Elements that should prevent Escape key from closing modals.
 * These are interactive elements where Escape has its own meaning (e.g., closing dropdowns).
 */
const ESCAPE_PROTECTED_SELECTOR =
  '[data-modal-escape-stop="true"], [role="combobox"], [aria-autocomplete], [role="listbox"], [role="menu"], [role="tree"], [role="grid"]';

interface UseModalInteractionOptions {
  isOpen: boolean;
  onClose: () => void;
  modalRef: React.RefObject<HTMLElement>;
  triggerRef?: React.RefObject<HTMLElement>;
}

/**
 * Hook for managing modal interactions including escape key handling.
 * 
 * Implements 2025 best practices for modal accessibility:
 * - Escape key closes only the topmost modal (modal stack system)
 * - Escape is prevented when focus is in protected elements (dropdowns, comboboxes)
 * - Focus trapping within modals
 * - Focus restoration to trigger element on close
 * 
 * @param options Configuration options for modal interaction
 * @returns Handlers for backdrop clicks and keyboard events
 */

export const useModalInteraction = ({
  isOpen,
  onClose,
  modalRef,
  triggerRef,
}: UseModalInteractionOptions) => {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const modalIdRef = useRef(generateModalId());

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [modalRef, onClose]
  );

  const handleBackdropKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    const modalId = modalIdRef.current;

    if (isOpen) {
      registerModal({ id: modalId, modalRef });
    }

    return () => {
      unregisterModal(modalId);
    };
  }, [isOpen, modalRef]);

  /**
   * Escape key handler following 2025 best practices:
   * 1. Only closes the topmost modal (respects modal stack)
   * 2. Respects protected elements (dropdowns, comboboxes, etc.)
   * 3. Prevents event bubbling to avoid conflicts
   * 4. Uses capture phase for reliable handling
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      
      // Don't handle if event was already handled
      if (e.defaultPrevented) return;
      
      // Only handle if this modal is open and is the top modal
      if (!isOpen) return;
      if (!hasOpenModals()) return;
      if (!isTopModal(modalIdRef.current)) return;

      const topModal = getTopModalElement();
      const eventTarget = e.target instanceof Node ? e.target : null;
      const activeElement = document.activeElement;
      
      if (topModal) {
        // Verify focus is within the modal
        const containsTarget = eventTarget
          ? topModal.contains(eventTarget)
          : false;
        const containsActive =
          activeElement instanceof Node
            ? topModal.contains(activeElement)
            : false;

        // If focus escaped the modal, restore it
        if (!containsTarget && !containsActive) {
          (topModal as HTMLElement).focus();
          return;
        }

        // Don't close if focus is in a protected element (dropdown, combobox, etc.)
        if (
          eventTarget instanceof HTMLElement &&
          eventTarget.closest(ESCAPE_PROTECTED_SELECTOR)
        ) {
          return;
        }

        if (
          activeElement instanceof HTMLElement &&
          activeElement.closest(ESCAPE_PROTECTED_SELECTOR)
        ) {
          return;
        }
      }

      // Close the modal
      e.stopPropagation();
      e.preventDefault();
      onClose();
    };
    
    if (isOpen) {
      // Use capture phase to ensure we handle before other handlers
      window.addEventListener('keydown', handleKeyDown, true);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const triggerElement = triggerRef?.current ?? null;

    if (!previousActiveElementRef.current) {
      previousActiveElementRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    }

    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(
        modal.querySelectorAll(focusableSelectors)
      ) as HTMLElement[];
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (
          document.activeElement === firstElement ||
          !modal.contains(document.activeElement as Node)
        ) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (
          document.activeElement === lastElement ||
          !modal.contains(document.activeElement as Node)
        ) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTab);

    return () => {
      window.removeEventListener('keydown', handleTab);

      if (triggerElement) {
        triggerElement.focus();
      } else if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }

      previousActiveElementRef.current = null;
    };
  }, [isOpen, modalRef, triggerRef]);

  return {
    handleBackdropClick,
    handleBackdropKeyDown,
  };
};
