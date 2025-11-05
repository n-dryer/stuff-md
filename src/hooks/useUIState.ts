import { useState } from 'react';
import { SYSTEM_INSTRUCTION } from '../services/aiService';
import { useLocalStorage } from './useLocalStorage';

type Feedback = {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
};

export function useUIState() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const [customInstructions, setCustomInstructions] = useLocalStorage<string>(
    'stuffmd.customInstructions',
    ''
  );
  const [lastCustomInstructions, setLastCustomInstructions] =
    useLocalStorage<string>('stuffmd.customInstructions.last', '');
  const [noIconMode, setNoIconMode] = useLocalStorage<boolean>(
    'noIconMode',
    false
  );
  const [isTipDismissed, setIsTipDismissed] = useLocalStorage<boolean>(
    'stuffmd.tip.dismissed',
    false
  );

  const [showInstructions, setShowInstructions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const displayFeedback = (
    message: string,
    type: 'info' | 'success' | 'error',
    duration: number = 3000
  ) => {
    const id = Date.now().toString();
    setFeedback({ id, message, type });
    if (duration > 0) {
      window.setTimeout(() => setFeedback(null), duration);
    }
  };

  const clearFeedback = () => setFeedback(null);

  const handleTagClick = (tag: string) => {
    setActiveTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return Array.from(newTags);
    });
  };

  const handleClearTags = () => {
    setActiveTags([]);
  };

  const [showRegenerateConfirmation, setShowRegenerateConfirmation] =
    useState(false);
  const [pendingInstructions, setPendingInstructions] = useState<string | null>(
    null
  );

  const saveInstructions = (
    instructions: string,
    shouldRegenerate: boolean = false
  ) => {
    const previous = customInstructions;
    const normalized = instructions.trim();

    // Preserve last custom when switching to default
    if (normalized === SYSTEM_INSTRUCTION.trim()) {
      if (previous && previous.trim() !== SYSTEM_INSTRUCTION.trim()) {
        setLastCustomInstructions(previous);
      }
      setCustomInstructions(SYSTEM_INSTRUCTION);
      setShowInstructions(false);
      displayFeedback('AI instructions reset to default.', 'success');
      return;
    }

    // Check if instructions actually changed
    const previousNormalized = previous.trim();
    const hasChanged =
      previousNormalized !== normalized && previousNormalized !== '';

    // If instructions changed, show confirmation (but don't auto-regenerate all notes - too many API calls)
    // Users can manually regenerate individual notes if needed
    if (hasChanged && !shouldRegenerate) {
      setPendingInstructions(normalized);
      setShowRegenerateConfirmation(true);
      return;
    }

    // Saving a custom instruction updates both current and last
    setCustomInstructions(instructions);
    setLastCustomInstructions(instructions);
    setShowInstructions(false);
    setShowRegenerateConfirmation(false);
    setPendingInstructions(null);
    displayFeedback('Custom instructions saved.', 'success');
  };

  const confirmRegenerate = () => {
    if (pendingInstructions) {
      saveInstructions(pendingInstructions, true);
    }
  };

  const cancelRegenerate = () => {
    if (pendingInstructions) {
      // Save without regenerating
      const normalized = pendingInstructions.trim();
      setCustomInstructions(normalized);
      setLastCustomInstructions(normalized);
      setShowInstructions(false);
      setShowRegenerateConfirmation(false);
      setPendingInstructions(null);
      displayFeedback(
        'Custom instructions saved. Existing notes not regenerated.',
        'success'
      );
    }
  };

  return {
    feedback,
    displayFeedback,
    clearFeedback,
    activeTags,
    handleTagClick,
    handleClearTags,
    customInstructions,
    saveInstructions,
    lastCustomInstructions,
    noIconMode,
    setNoIconMode,
    isTipDismissed,
    dismissTip: setIsTipDismissed,
    showInstructions,
    setShowInstructions,
    showHelp,
    setShowHelp,
    showRegenerateConfirmation,
    confirmRegenerate,
    cancelRegenerate,
  };
}
