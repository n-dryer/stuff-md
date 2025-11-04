import { useMemo } from 'react';
import { Note } from '../types';

export const useCategories = (notes: Note[]) => {
  const dynamicCategories = useMemo(() => {
    const categoriesSet = notes.reduce((acc, note) => {
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

    return ['ALL', ...Array.from(categoriesSet).sort()];
  }, [notes]);

  return { dynamicCategories };
};

