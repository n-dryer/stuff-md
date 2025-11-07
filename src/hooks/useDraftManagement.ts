import { useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface UseDraftManagementProps {
  openClearDraftModal: () => void;
  closeClearDraftModal: () => void;
  displayFeedback: (
    type: 'success' | 'error',
    message: string,
    duration?: number
  ) => void;
}

export function useDraftManagement({
  openClearDraftModal,
  closeClearDraftModal,
  displayFeedback,
}: UseDraftManagementProps) {
  const [draft, setDraft] = useLocalStorage<string>('stuffmd.draft', '');
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  const handleRequestClearOrBlur = () => {
    if (draft.trim()) {
      openClearDraftModal();
    } else {
      noteInputRef.current?.blur();
    }
  };

  const handleConfirmClearDraft = () => {
    setDraft('');
    closeClearDraftModal();
    noteInputRef.current?.blur();
    displayFeedback('success', 'Draft cleared.');
  };

  return {
    draft,
    setDraft,
    noteInputRef,
    handleRequestClearOrBlur,
    handleConfirmClearDraft,
  };
}
