import { useMemo } from 'react';
import { Note } from '../types';
import { containsURL } from '../utils/textUtils';

interface UseNoteFiltersParams {
  notes: Note[];
  activeCategory: string;
  activeTags: string[];
  debouncedSearchQuery: string;
  startDate: string;
  endDate: string;
}

export const useNoteFilters = ({
  notes,
  activeCategory,
  activeTags,
  debouncedSearchQuery,
  startDate,
  endDate,
}: UseNoteFiltersParams): Note[] => {
  return useMemo(() => {
    let result = notes.filter(note => {
      if (activeCategory === 'ALL') return true;
      if (activeCategory === 'LINKS') return containsURL(note.content);

      const pathString = note.categoryPath.join(' / ').toUpperCase();
      
      if (activeCategory === 'PERSONAL / SHOPPING') {
        return pathString.includes('PERSONAL') || pathString.includes('SHOPPING');
      }

      return pathString.includes(activeCategory);
    });

    if (activeTags.length > 0) {
      result = result.filter(note => 
        activeTags.every(activeTag => note.tags.includes(activeTag))
      );
    }
    
    if (debouncedSearchQuery.trim()) {
      const lowercasedQuery = debouncedSearchQuery.toLowerCase();
      result = result.filter(note => 
        note.title.toLowerCase().includes(lowercasedQuery) ||
        note.content.toLowerCase().includes(lowercasedQuery)
      );
    }

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00.000Z`);
      // Only filter if start date is valid
      if (!isNaN(start.getTime())) {
        result = result.filter(note => {
          const noteDate = new Date(note.date);
          // Exclude notes with invalid dates from date filtering
          return isNaN(noteDate.getTime()) || noteDate >= start;
        });
      }
    }

    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999Z`);
      // Only filter if end date is valid
      if (!isNaN(end.getTime())) {
        result = result.filter(note => {
          const noteDate = new Date(note.date);
          // Exclude notes with invalid dates from date filtering
          return isNaN(noteDate.getTime()) || noteDate <= end;
        });
      }
    }

    return result;
  }, [notes, activeCategory, activeTags, debouncedSearchQuery, startDate, endDate]);
};

