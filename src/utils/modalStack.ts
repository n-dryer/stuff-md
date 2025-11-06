import type { RefObject } from 'react';

type ModalId = symbol;

interface ModalRegistration {
  id: ModalId;
  modalRef: RefObject<HTMLElement | null>;
}

const modalStack: ModalRegistration[] = [];

export const generateModalId = (): ModalId => Symbol('modal');

export const registerModal = (registration: ModalRegistration) => {
  const existingIndex = modalStack.findIndex(
    ({ id }) => id === registration.id
  );

  if (existingIndex >= 0) {
    modalStack.splice(existingIndex, 1);
  }

  modalStack.push(registration);
};

export const unregisterModal = (id: ModalId) => {
  const index = modalStack.findIndex(modal => modal.id === id);

  if (index >= 0) {
    modalStack.splice(index, 1);
  }
};

export const isTopModal = (id: ModalId): boolean => {
  if (modalStack.length === 0) {
    return false;
  }

  return modalStack[modalStack.length - 1].id === id;
};

export const hasOpenModals = (): boolean => modalStack.length > 0;

export const getTopModalElement = (): HTMLElement | null => {
  if (modalStack.length === 0) {
    return null;
  }
  return modalStack[modalStack.length - 1].modalRef.current ?? null;
};
