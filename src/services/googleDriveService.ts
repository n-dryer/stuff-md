import { Note } from '../types';
import { logError } from '../utils/logger';
import { withConcurrencyLimit } from '../utils/requestQueue';
import {
  DriveFile,
  driveFileToNote,
  noteToAppProperties,
} from '../utils/driveHelpers';
import { authorizedFetch, AuthError, RateLimitError } from './drive/apiHelpers';
import { findOrCreateAppFolder } from './drive/folderOperations';

// Re-export error types for compatibility
export { AuthError, RateLimitError };

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const NOTE_FILE_QUERY_TPL = `'--FOLDER-ID--' in parents and mimeType='text/markdown' and trashed=false`;
const NOTE_FIELDS = 'id, name, createdTime, appProperties';

export const driveService = {
  fetchNotes: async (
    accessToken: string,
    signal?: AbortSignal
  ): Promise<Note[]> => {
    const folderId = await findOrCreateAppFolder(accessToken, signal);
    const query = NOTE_FILE_QUERY_TPL.replace('--FOLDER-ID--', folderId);
    
    const listResponse = await authorizedFetch(
      accessToken,
      `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(${NOTE_FIELDS})&orderBy=createdTime desc`,
      {},
      true,
      signal
    );
    if (!listResponse.ok) throw new Error('Failed to list notes from Drive.');
    let listResult: { files?: DriveFile[] };
    try {
      listResult = (await listResponse.json()) as { files?: DriveFile[] };
    } catch (error) {
      logError('Failed to parse notes list response:', error);
      throw new Error('Invalid response format from Google Drive API.');
    }
    if (!listResult.files) return [];

    // Create array of async functions for concurrency limiting
    const fetchTasks = listResult.files.map(
      (file: DriveFile) => async (): Promise<Note | null> => {
        const contentResponse = await authorizedFetch(
          accessToken,
          `${DRIVE_API_URL}/files/${file.id}?alt=media`,
          {},
          true,
          signal
        );
        if (!contentResponse.ok) {
            logError(`Failed to fetch content for note ${file.id}`);
            return null;
        }
        const content = await contentResponse.text();
        return driveFileToNote(file, content);
      }
    );

    const results = await withConcurrencyLimit(fetchTasks, 5, signal);
    return results.filter((n): n is Note => n !== null);
  },

  saveNote: async (
    accessToken: string,
    noteData: Omit<Note, 'id'>,
    signal?: AbortSignal
  ): Promise<Note> => {
    const folderId = await findOrCreateAppFolder(accessToken, signal);
    const metadata = {
      name: noteData.name,
      mimeType: 'text/markdown',
      parents: [folderId],
      appProperties: noteToAppProperties(noteData),
    };

    const boundary = '-------314159265358979323846';
    const multipartRequestBody = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${boundary}`,
      'Content-Type: text/markdown',
      '',
      noteData.content,
      `--${boundary}--`,
    ].join('\r\n');
    
    const res = await authorizedFetch(
      accessToken,
      `${DRIVE_UPLOAD_URL}/files?uploadType=multipart`,
      {
        method: 'POST',
        headers: {
            'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      },
      true,
      signal
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Failed to save note: ${errorText}`);
    }
    let createdFile: DriveFile;
    try {
      createdFile = (await res.json()) as DriveFile;
    } catch (error) {
      logError('Failed to parse save note response:', error);
      throw new Error('Invalid response format from Google Drive API.');
    }
    return driveFileToNote(createdFile, noteData.content);
  },

  updateNote: async (
    accessToken: string,
    noteId: string,
    updates: Partial<Note>,
    signal?: AbortSignal
  ): Promise<void> => {
    const { content, ...metadataFields } = updates;

    if (Object.keys(metadataFields).length > 0) {
      const metadataUpdate = {
        appProperties: noteToAppProperties(metadataFields),
      };
      const metadataResponse = await authorizedFetch(
        accessToken,
        `${DRIVE_API_URL}/files/${noteId}`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadataUpdate),
        },
        true,
        signal
      );
      if (!metadataResponse.ok)
        throw new Error(
          `Failed to update note metadata: ${await metadataResponse.text()}`
        );
    }

    if (typeof content !== 'undefined') {
      const contentResponse = await authorizedFetch(
        accessToken,
        `${DRIVE_UPLOAD_URL}/files/${noteId}?uploadType=media`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'text/markdown' },
            body: content,
        },
        true,
        signal
      );
      if (!contentResponse.ok)
        throw new Error(
          `Failed to update note content: ${await contentResponse.text()}`
        );
    }
  },

  deleteNote: async (
    accessToken: string,
    noteId: string,
    signal?: AbortSignal
  ): Promise<void> => {
    const deleteResponse = await authorizedFetch(
      accessToken,
      `${DRIVE_API_URL}/files/${noteId}`,
      {
        method: 'DELETE',
      },
      true,
      signal
    );
    if (!deleteResponse.ok)
      throw new Error('Failed to delete note from Drive.');
  },
};
