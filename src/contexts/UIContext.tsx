import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { SYSTEM_INSTRUCTION } from '../services/aiService';

interface UIState {
  feedback: { type: 'success' | 'error'; message: string } | null;
  activeTags: string[];
  customInstructions: string;
  lastCustomInstructions: string;
  viewMode: 'grid' | 'table';
  theme: 'light' | 'dark';
}

interface UIActions {
  displayFeedback: (
    type: 'success' | 'error',
    message: string,
    duration?: number
  ) => void;
  clearFeedback: () => void;
  handleTagClick: (tag: string) => void;
  handleClearTags: () => void;
  saveInstructions: (instructions: string) => void;
  setViewMode: (mode: 'grid' | 'table') => void;
  toggleTheme: () => void;
}

const UIStateContext = createContext<UIState | undefined>(undefined);
const UIActionsContext = createContext<UIActions | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, toggleTheme] = useTheme();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [lastCustomInstructions, setLastCustomInstructions] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const displayFeedback = useCallback(
    (type: 'success' | 'error', message: string, duration: number = 3000) => {
      setFeedback({ type, message });
      setTimeout(() => setFeedback(null), duration);
    },
    []
  );

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleClearTags = useCallback(() => {
    setActiveTags([]);
  }, []);

  const saveInstructions = useCallback((instructions: string) => {
    setCustomInstructions(instructions);
    // Only update lastCustomInstructions if saving actual custom instructions (not default)
    if (instructions.trim() !== SYSTEM_INSTRUCTION.trim()) {
      setLastCustomInstructions(instructions);
    } else {
      // If resetting to default (including when user deletes all custom instructions),
      // clear lastCustomInstructions so it doesn't appear when switching to CUSTOM tab
      setLastCustomInstructions('');
    }
  }, []);

  const state = {
    feedback,
    activeTags,
    customInstructions,
    lastCustomInstructions,
    viewMode,
    theme,
  };

  const actions = {
    displayFeedback,
    clearFeedback,
    handleTagClick,
    handleClearTags,
    saveInstructions,
    setViewMode,
    toggleTheme,
  };

  return (
    <UIStateContext.Provider value={state}>
      <UIActionsContext.Provider value={actions}>
        {children}
      </UIActionsContext.Provider>
    </UIStateContext.Provider>
  );
};

export const useUIStateContext = () => {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIStateContext must be used within a UIProvider');
  }
  return context;
};

export const useUIActions = () => {
  const context = useContext(UIActionsContext);
  if (context === undefined) {
    throw new Error('useUIActions must be used within a UIProvider');
  }
  return context;
};
