import { useMemo } from 'react';
import { Note } from '../types';

export const useCategories = (notes: Note[]) => {
  const dynamicCategories = useMemo(() => {
    const categoriesSet = notes.reduce((acc, note) => {
      // Filter out notes with empty or missing categoryPath - they should be in Misc
      if (note.categoryPath && note.categoryPath.length > 0) {
        const topLevel = note.categoryPath[0].toUpperCase();
        if (topLevel === 'PERSONAL' || topLevel === 'SHOPPING') {
          acc.add('PERSONAL / SHOPPING');
        } else {
          acc.add(topLevel);
        }
      }
      return acc;
    }, new Set<string>());

    // Always include MISC category if there are any notes
    if (notes.length > 0) {
      categoriesSet.add('MISC');
    }

    return ['ALL', ...Array.from(categoriesSet).sort()];
  }, [notes]);

  return { dynamicCategories };
};
