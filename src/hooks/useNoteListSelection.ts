import { useCallback, useMemo, useEffect } from 'react';
import { useNoteSelection } from './useNoteSelection';
import { Note } from '../types';

interface UseNoteListSelectionProps {
  sortedNotes: Note[];
  isEditMode: boolean;
  onDeleteNotes?: (noteIds: string[]) => void;
}

export const useNoteListSelection = ({
  sortedNotes,
  isEditMode,
  onDeleteNotes,
}: UseNoteListSelectionProps) => {
  const {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    selectedCount,
    hasSelection,
  } = useNoteSelection();

  // Reset selection when exiting edit mode
  useEffect(() => {
    if (!isEditMode) {
      deselectAll();
    }
  }, [isEditMode, deselectAll]);

  const handleSelectAll = useCallback(() => {
    const allIds = sortedNotes.map(note => note.id);
    selectAll(allIds);
  }, [sortedNotes, selectAll]);

  const handleDeleteSelected = useCallback(() => {
    if (hasSelection && onDeleteNotes && selectedCount > 0) {
      const idsArray = Array.from(selectedIds);
      if (idsArray.length > 0) {
        onDeleteNotes(idsArray);
        // Don't deselect here - wait for confirmation
      }
    }
  }, [hasSelection, selectedCount, selectedIds, onDeleteNotes]);

  const allSelected = useMemo(() => {
    return sortedNotes.length > 0 && selectedCount === sortedNotes.length;
  }, [sortedNotes.length, selectedCount]);

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    handleSelectAll,
    handleDeleteSelected,
    deselectAll,
    selectedCount,
    hasSelection,
    allSelected,
  };
};
