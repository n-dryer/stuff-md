import { useMemo } from 'react';
import { Note } from '../types';

type SortKey = 'date' | 'title';
type SortDirection = 'asc' | 'desc';

interface UseNoteSortingParams {
  filteredNotes: Note[];
  sortKey: SortKey;
  sortDirection: SortDirection;
}

export const useNoteSorting = ({
  filteredNotes,
  sortKey,
  sortDirection,
}: UseNoteSortingParams): Note[] => {
  return useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      // Handle invalid dates by treating them as 0 (oldest)
      const dateCompare =
        (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      const titleCompare = (a.title || '').localeCompare(b.title || '');

      if (sortKey === 'date') {
        return sortDirection === 'desc' ? dateCompare : -dateCompare;
      } else {
        // title
        return sortDirection === 'asc' ? titleCompare : -titleCompare;
      }
    });
  }, [filteredNotes, sortKey, sortDirection]);
};

export type { SortKey, SortDirection };
