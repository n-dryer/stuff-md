import React, { type ReactNode } from 'react';

import ErrorBoundary from './ErrorBoundary';
import ErrorDisplay from './ErrorDisplay';

interface NoteListErrorDisplayProps {
  onRetry: () => void;
}

const NoteListErrorDisplay: React.FC<NoteListErrorDisplayProps> = ({ onRetry }) => (
  <div className="p-8 border-2 border-accent-black dark:border-off-white/50 bg-off-white dark:bg-off-black">
    <ErrorDisplay
      message="Error loading notes. Please refresh the page."
      onDismiss={onRetry}
    />
    <button
      onClick={onRetry}
      className="mt-4 uppercase text-sm font-bold text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white transition-colors font-mono"
    >
      [RETRY]
    </button>
  </div>
);

interface NoteListErrorBoundaryProps {
  children: ReactNode;
}

const NoteListErrorBoundary: React.FC<NoteListErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={<NoteListErrorDisplay onRetry={() => window.location.reload()} />}
    >
      {children}
    </ErrorBoundary>
  );
};

export default NoteListErrorBoundary;

