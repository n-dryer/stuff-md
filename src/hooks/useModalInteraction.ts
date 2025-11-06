import React, { useCallback, useEffect, useRef } from 'react';

import {
  generateModalId,
  getTopModalElement,
  hasOpenModals,
  isTopModal,
  registerModal,
  unregisterModal,
} from '../utils/modalStack';

const ESCAPE_PROTECTED_SELECTOR =
  '[data-modal-escape-stop="true"], [role="combobox"], [aria-autocomplete], [role="listbox"], [role="menu"], [role="tree"], [role="grid"]';

interface UseModalInteractionOptions {
  isOpen: boolean;
  onClose: () => void;
  modalRef: React.RefObject<HTMLElement | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (e.defaultPrevented) return;
      if (!isOpen) return;
      if (!hasOpenModals()) return;
      if (!isTopModal(modalIdRef.current)) return;

      const topModal = getTopModalElement();
      const eventTarget = e.target instanceof Node ? e.target : null;
      const activeElement = document.activeElement;

      if (topModal) {
        const containsTarget = eventTarget
          ? topModal.contains(eventTarget)
          : false;
        const containsActive =
          activeElement instanceof Node
            ? topModal.contains(activeElement)
            : false;

        if (!containsTarget && !containsActive) {
          (topModal as HTMLElement).focus();
          return;
        }

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

      e.stopPropagation();
      e.preventDefault();
      onClose();
    };

    if (isOpen) {
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
