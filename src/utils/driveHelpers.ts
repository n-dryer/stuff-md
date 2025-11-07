import { Note } from '../types';

/**
 * Google Drive file structure from the API
 */
export interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  appProperties?: {
    title?: string;
    summary?: string;
    categoryPath?: string;
    tags?: string;
    date?: string;
    aiGenerated?: string;
  };
}

export const driveFileToNote = (file: DriveFile, content: string): Note => {
  const appProps = file.appProperties || {};

  // Parse categoryPath and tags from appProperties
  let categoryPath: string[] = ['Misc'];
  let tags: string[] = [];

  if (appProps.categoryPath) {
    try {
      categoryPath = JSON.parse(appProps.categoryPath);
      if (!Array.isArray(categoryPath) || categoryPath.length === 0) {
        categoryPath = ['Misc'];
      }
    } catch {
      categoryPath = ['Misc'];
    }
  }

  if (appProps.tags) {
    try {
      tags = JSON.parse(appProps.tags);
      if (!Array.isArray(tags)) {
        tags = [];
      }
    } catch {
      tags = [];
    }
  }

  // Ensure tags always has at least ['misc'] if empty
  if (tags.length === 0) {
    tags = ['misc'];
    categoryPath = ['Misc'];
  }

  // Parse AI generated data
  let aiGenerated: Note['aiGenerated'] = null;
  if (appProps.aiGenerated) {
    try {
      aiGenerated = JSON.parse(appProps.aiGenerated);
    } catch {
      aiGenerated = null;
    }
  }

  return {
    id: file.id,
    name: file.name,
    title: appProps.title || file.name,
    content,
    summary: appProps.summary || '',
    categoryPath,
    tags,
    date: file.createdTime,
    modifiedTime: file.modifiedTime,
    aiGenerated,
  };
};

export const noteToAppProperties = (
  note: Omit<Note, 'id'> | Note
): DriveFile['appProperties'] => {
  return {
    title: note.title,
    summary: note.summary,
    categoryPath: JSON.stringify(note.categoryPath),
    tags: JSON.stringify(note.tags),
    aiGenerated: note.aiGenerated
      ? JSON.stringify(note.aiGenerated)
      : undefined,
  };
};
