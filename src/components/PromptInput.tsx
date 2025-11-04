import React from 'react';

interface PromptInputProps {
  instructions: string;
  onEdit: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  children?: React.ReactNode;
}

const PromptInput: React.FC<PromptInputProps> = ({ instructions, onEdit, buttonRef, children }) => {
  return (
    <div className="flex items-center justify-between w-full p-4">
      <p className="text-sm text-off-black/70 dark:text-off-white/70 truncate pr-4 font-mono">
        <span className="font-bold uppercase">AI Instructions:</span> {instructions || 'Default instructions'}
      </p>
      <div className="flex items-center gap-x-4">
        {children}
        <button
          ref={buttonRef}
          onClick={onEdit}
          className="uppercase text-sm font-bold text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white transition-colors flex-shrink-0"
        >
          [EDIT INSTRUCTIONS]
        </button>
      </div>
    </div>
  );
};

export default PromptInput;