import { Note } from '../types';
import { logError } from './logger';

// Type for Drive API file metadata
export interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
  appProperties?: {
    title?: string;
    summary?: string;
    categoryPath?: string;
    tags?: string;
    aiGenerated?: string;
    isStuffMdNote?: string;
  };
}

/**
 * Safely parses a JSON string, returning a default value if parsing fails
 * @param jsonString The JSON string to parse
 * @param defaultValue The default value to return if parsing fails
 * @returns The parsed value or the default value
 */
export const safeJsonParse = <T>(
  jsonString: string | null | undefined,
  defaultValue: T
): T => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    logError('Failed to parse JSON from Drive appProperties', e);
    return defaultValue;
  }
};

/**
 * Converts a Google Drive file with its content to a Note object
 * @param file The Drive file metadata
 * @param content The file content (markdown)
 * @returns A Note object
 */
export const driveFileToNote = (file: DriveFile, content: string): Note => {
  const parsedTags = safeJsonParse<string[]>(file.appProperties?.tags, []);
  // Ensure every note has at least the "misc" tag
  const tags = parsedTags.length === 0 ? ['misc'] : parsedTags;

  return {
    id: file.id,
    name: file.name,
    content: content,
    date: file.createdTime,
    title: file.appProperties?.title || 'Untitled',
    summary: file.appProperties?.summary || '',
    categoryPath: safeJsonParse<string[]>(file.appProperties?.categoryPath, [
      'Misc',
    ]),
    tags: tags,
    aiGenerated: safeJsonParse<Note['aiGenerated']>(
      file.appProperties?.aiGenerated,
      null
    ),
  };
};

/**
 * Converts note metadata to Google Drive app properties format
 * @param noteData The note data to convert
 * @returns An object with string values for Drive app properties
 */
export const noteToAppProperties = (
  noteData: Partial<Note>
): { [key: string]: string | null } => {
  const properties: { [key: string]: string | null } = {};
  if (noteData.title) properties.title = noteData.title;
  if (noteData.summary) properties.summary = noteData.summary;
  if (noteData.categoryPath)
    properties.categoryPath = JSON.stringify(noteData.categoryPath);
  if (noteData.tags) properties.tags = JSON.stringify(noteData.tags);
  if (noteData.aiGenerated)
    properties.aiGenerated = JSON.stringify(noteData.aiGenerated);
  properties.isStuffMdNote = 'true';
  return properties;
};
