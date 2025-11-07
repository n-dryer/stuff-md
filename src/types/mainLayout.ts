import React from 'react';

import { Note } from '../types';

export interface NoteManagementProps {
  notes: Note[];
  isNotesLoading: boolean;
  requestDeleteNote: (noteId: string) => void;
  onDeleteNotes: (noteIds: string[]) => void;
  setEditingNote: (note: Note | null) => void;
  isDeleting?: boolean;
}

export interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearchQuery: string;
}

export interface FilterProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  activeTags: string[];
  handleTagClick: (tag: string) => void;
  handleClearTags: () => void;
  dynamicCategories: string[];
  hasLinks: boolean;
}

export interface ViewProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
}

export interface InputProps {
  draft: string;
  setDraft: (content: string) => void;
  handleSaveNote: () => void;
  isSaving: boolean;
  noteInputRef: React.RefObject<HTMLTextAreaElement | null>;
  onRequestClearOrBlur: () => void;
  onDraftSaved?: () => void;
}

export interface InstructionProps {
  customInstructions: string;
  setShowInstructions: (show: boolean) => void;
  instructionsButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export interface MetadataProps {
  logout: () => void;
  onDeleteAll: () => void;
}

export interface HelpProps {
  isHelpOpen: boolean;
  setShowHelp: (show: boolean) => void;
}
