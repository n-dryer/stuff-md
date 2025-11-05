import { Note } from '../types';

export function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function createSafeFilename(title: string): string {
  const safeTitle = title
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 50);
  return safeTitle || 'note';
}

export function createOptimisticNote(
  tempId: string,
  content: string,
  title: string
): Note {
  const safeTitleForFilename = createSafeFilename(title);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '');

  return {
    id: tempId,
    name: `${safeTitleForFilename}-${timestamp}.md`,
    content,
    title,
    summary: 'Processing...',
    date: new Date().toISOString(),
    categoryPath: ['Misc'],
    tags: ['misc'],
    aiGenerated: null,
  };
}
