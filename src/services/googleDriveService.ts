import { Note } from '../types';
import { logError } from '../utils/logger';
import { withConcurrencyLimit } from '../utils/requestQueue';
import {
  DriveFile,
  driveFileToNote,
  noteToAppProperties,
} from '../utils/driveHelpers';
import { authorizedFetch, AuthError, RateLimitError } from './drive/apiHelpers';
import {
  clearFolderCache,
  findOrCreateAppFolder,
} from './drive/folderOperations';
import { INoteStorageService } from './INoteStorageService';

// Re-export error types for compatibility
export { AuthError, RateLimitError };

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const NOTE_FILE_QUERY_TPL = `'--FOLDER-ID--' in parents and mimeType='text/markdown' and trashed=false`;
const NOTE_FIELDS = 'id, name, createdTime, modifiedTime, appProperties';

class GoogleDriveService implements INoteStorageService {
  public async getAllNotes(accessToken: string): Promise<Note[]> {
    const folderId = await findOrCreateAppFolder(accessToken);
    const query = NOTE_FILE_QUERY_TPL.replace('--FOLDER-ID--', folderId);

    const listResponse = await authorizedFetch(
      accessToken,
      `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(${NOTE_FIELDS})&orderBy=createdTime desc`,
      {},
      true
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
          true
        );
        if (!contentResponse.ok) {
          logError(`Failed to fetch content for note ${file.id}`);
          return null;
        }
        const content = await contentResponse.text();
        return driveFileToNote(file, content);
      }
    );

    const results = await withConcurrencyLimit(fetchTasks, 5);
    return results.filter((n): n is Note => n !== null);
  }

  public async createNote(
    accessToken: string,
    noteData: Omit<Note, 'id'>
  ): Promise<Note> {
    try {
      const folderId = await findOrCreateAppFolder(accessToken);
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
        true
      );

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(
            'Failed to save note: Parent folder not found. The app folder may have been deleted.'
          );
        }
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
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Parent folder not found')
      ) {
        clearFolderCache();
        throw new Error(
          'Failed to save note: Parent folder not found. Retrying may fix the issue.'
        );
      }
      throw error;
    }
  }

  public async updateNote(
    accessToken: string,
    noteId: string,
    noteData: Partial<Note>
  ): Promise<Note> {
    const { content, ...metadataFields } = noteData;

    if (Object.keys(metadataFields).length > 0) {
      // Get the existing note from Drive to merge with partial updates
      const existingNote = await this.getFileMetadata(accessToken, noteId);
      const mergedNote = { ...existingNote, ...metadataFields };
      const metadataUpdate = {
        appProperties: noteToAppProperties(mergedNote),
      };
      const metadataResponse = await authorizedFetch(
        accessToken,
        `${DRIVE_API_URL}/files/${noteId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metadataUpdate),
        },
        true
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
        true
      );
      if (!contentResponse.ok)
        throw new Error(
          `Failed to update note content: ${await contentResponse.text()}`
        );
    }
    return this.getFileMetadata(accessToken, noteId);
  }

  public async deleteNote(accessToken: string, noteId: string): Promise<void> {
    await authorizedFetch(
      accessToken,
      `${DRIVE_API_URL}/files/${noteId}`,
      {
        method: 'DELETE',
      },
      true
    );
  }

  public async deleteNotesByIds(
    accessToken: string,
    noteIds: string[]
  ): Promise<void> {
    for (const noteId of noteIds) {
      await this.deleteFile(accessToken, noteId);
    }
  }

  private async getFileMetadata(
    accessToken: string,
    fileId: string
  ): Promise<Note> {
    const fileResponse = await authorizedFetch(
      accessToken,
      `${DRIVE_API_URL}/files/${fileId}?fields=id,name,createdTime,appProperties`,
      {},
      true
    );
    if (!fileResponse.ok) {
      throw new Error(
        `Failed to get file metadata for ${fileId}: ${await fileResponse.text()}`
      );
    }
    const file: DriveFile = await fileResponse.json();
    const contentResponse = await authorizedFetch(
      accessToken,
      `${DRIVE_API_URL}/files/${file.id}?alt=media`,
      {},
      true
    );
    if (!contentResponse.ok) {
      throw new Error(
        `Failed to get content for ${file.id}: ${await contentResponse.text()}`
      );
    }
    const content = await contentResponse.text();
    return driveFileToNote(file, content);
  }

  private async deleteFile(accessToken: string, fileId: string): Promise<void> {
    await authorizedFetch(
      accessToken,
      `${DRIVE_API_URL}/files/${fileId}`,
      {
        method: 'DELETE',
      },
      true
    );
  }
}

export const googleDriveService = new GoogleDriveService();
