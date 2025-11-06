import { Note } from '../types';
import { logError } from '../utils/logger';

// Lazy load jszip only when needed to reduce initial bundle size
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let jszipModule: any = null;

const loadJSZip = async () => {
  if (!jszipModule) {
    jszipModule = await import('jszip');
  }
  return jszipModule.default;
};

const sanitizeFilename = (filename: string): string => {
  return (
    filename
      // eslint-disable-next-line no-control-regex
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
      .replace(/^\.+/, '')
      .replace(/\.+$/, '')
      .trim() || 'note'
  );
};

const formatNoteWithYAML = (note: Note): string => {
  const tags =
    Array.isArray(note.tags) && note.tags.length > 0
      ? note.tags.join(', ')
      : '';
  const date = note.date || new Date().toISOString();
  const frontMatter = `---
tags: [${tags}]
date: ${date}
---`;
  return `${frontMatter}\n\n${note.content || ''}`;
};

const triggerDownload = (
  filename: string,
  content: string | Blob,
  mimeType?: string
): void => {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportAsTxt = (notes: Note[]): void => {
  if (notes.length === 0) {
    throw new Error('No notes to export.');
  }
  const content = notes
    .map(formatNoteWithYAML)
    .join('\n\n====================\n\n');
  triggerDownload('STUFF-MD-export.txt', content, 'text/plain;charset=utf-8');
};

export const exportAsJson = (notes: Note[]): void => {
  if (notes.length === 0) {
    throw new Error('No notes to export.');
  }
  const content = JSON.stringify(notes, null, 2);
  triggerDownload(
    'STUFF-MD-export.json',
    content,
    'application/json;charset=utf-8'
  );
};

export const exportAsZip = async (notes: Note[]): Promise<void> => {
  if (notes.length === 0) {
    throw new Error('No notes to export.');
  }
  try {
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    const usedNames = new Set<string>();

    notes.forEach((note, index) => {
      const content = formatNoteWithYAML(note);
      let filename = sanitizeFilename(note.name || `note-${index + 1}.md`);

      if (!filename.toLowerCase().endsWith('.md')) {
        filename = `${filename}.md`;
      }

      let uniqueFilename = filename;
      let counter = 1;
      while (usedNames.has(uniqueFilename)) {
        const baseName = filename.replace(/\.md$/, '');
        uniqueFilename = `${baseName}-${counter}.md`;
        counter++;
      }
      usedNames.add(uniqueFilename);

      zip.file(uniqueFilename, content);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerDownload('STUFF-MD-export.zip', zipBlob);
  } catch (error) {
    logError('Failed to create ZIP file:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create ZIP file: ${error.message}`);
    }
    throw new Error('An error occurred while creating the ZIP file.');
  }
};
